// Follow this setup guide to integrate the Deno language server with your editor:
// https://supabase.com/docs/guides/functions/getting-started

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  getPaymentSuccessEmail,
  getPremiumUpgradeEmail,
} from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("EMAIL_FROM") || "Fotia <noreply@myfotia.com>";

const corsHeaders = {
  // La fonction est appelée uniquement serveur-à-serveur (webhook handler).
  // On restreint l'origine aux domaines Fotia uniquement.
  "Access-Control-Allow-Origin": "https://myfotia.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: "payment-success" | "premium-upgrade";
  to: string;
  userId?: string;
  // Transaction de paiement (Djomy). Permet la déduplication : quand le
  // webhook et la page de succès invoquent tous deux cette fonction pour la
  // même transaction, un seul email part.
  providerPaymentId?: string;
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // 1. Parse and validate request
    const payload: EmailPayload = await req.json();
    const { type, to, userId, providerPaymentId, data } = payload;

    if (!to || !type) {
      throw new Error("Missing required fields: 'to' and 'type' are required.");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set.");
    }

    // 2. Generate Email Content based on type
    let emailContent: { subject: string; html: string };

    switch (type) {
      case "payment-success":
        if (!data?.userName || !data?.plan || !data?.amount || !data?.currency || !data?.expiresAt) {
           throw new Error("Missing data fields for payment-success email.");
        }
        emailContent = getPaymentSuccessEmail(data.userName, data.plan, data.amount, data.currency, data.expiresAt);
        break;
      case "premium-upgrade":
         if (!data?.userName || !data?.plan) {
           throw new Error("Missing data fields for premium-upgrade email.");
         }
         emailContent = getPremiumUpgradeEmail(data.userName, data.plan);
         break;
      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    // 2b. Déduplication (race-safe) — réserver avant d'envoyer
    // Le webhook Djomy et la page /billing/success peuvent invoquer cette
    // fonction quasi-simultanément pour la même transaction. On insère
    // d'abord une ligne 'sending' : si la contrainte unique
    // (email_type, user_id, provider_payment_id) est violée, un autre appel
    // est déjà en train d'envoyer → on skip (200 silencieux).
    let logRowId: string | null = null;

    if (providerPaymentId) {
      const { data: inserted, error: reserveError } = await supabaseClient
        .from("email_logs")
        .insert({
          user_id: userId || null,
          email_type: type,
          to_email: to,
          status: "sending",
          provider: "resend",
          provider_payment_id: providerPaymentId,
        }, {
          onConflict: "email_type,user_id,provider_payment_id",
          ignoreDuplicates: true,
        })
        .select("id");

      if (reserveError) {
        console.error("[Email Reserve Error]", reserveError.message);
        // Non-bloquant : on envoie quand même (log classique ensuite)
      } else if (!inserted || inserted.length === 0) {
        console.log(`[Email Skip] Duplicate ${type} for ${to} (${providerPaymentId}) — déjà traité`);
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logRowId = inserted[0].id;
      }
    }

    // 3. Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      // Échec d'envoi : libérer la réservation pour permettre un nouvel essai
      // (rechargement de la page de succès, retry webhook, etc.)
      if (logRowId) {
        await supabaseClient.from("email_logs").delete().eq("id", logRowId).then(({ error }) => {
          if (error) console.error("[Email Reserve Release Error]", error.message);
        });
      }
      throw new Error(`Resend API error: ${res.status} - ${errorText}`);
    }

    const resendData = await res.json();

    // 4. Log to database
    if (logRowId) {
      // La ligne a déjà été réservée → on la passe en succès
      const { error: updateError } = await supabaseClient
        .from("email_logs")
        .update({ status: "success" })
        .eq("id", logRowId);

      if (updateError) {
        console.error("[Email Log Update Error]", updateError.message);
      }
    } else {
      // Pas de déduplication (pas de providerPaymentId ou échec de réservation)
      const { error: logError } = await supabaseClient
        .from("email_logs")
        .insert({
          user_id: userId || null,
          email_type: type,
          to_email: to,
          status: "success",
          provider: "resend",
          provider_payment_id: providerPaymentId || null,
        });

      if (logError) {
        console.error("[Email Log Error]", logError.message);
        // We don't fail the request if logging fails, but we log it to console
      }
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[Edge Function send-email] Error:", error.message);
    
    // Attempt to log the error if we have enough context
    try {
      // Recreate client just in case
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }});
      await supabaseClient.from("email_logs").insert({
        email_type: "unknown_or_failed",
        to_email: "unknown",
        status: "error",
        error_message: error.message,
      });
    } catch (e) {
      // Ignore inner logging errors
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
