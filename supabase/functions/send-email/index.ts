// Follow this setup guide to integrate the Deno language server with your editor:
// https://supabase.com/docs/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  getWelcomeEmail,
  getVerifyEmail,
  getResetPasswordEmail,
  getPaymentSuccessEmail,
  getPremiumUpgradeEmail,
} from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("EMAIL_FROM") || "Fotia <noreply@myfotia.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: "welcome" | "verify" | "reset-password" | "payment-success" | "premium-upgrade";
  to: string;
  userId?: string;
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
    const { type, to, userId, data } = payload;

    if (!to || !type) {
      throw new Error("Missing required fields: 'to' and 'type' are required.");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set.");
    }

    // 2. Generate Email Content based on type
    let emailContent: { subject: string; html: string };

    switch (type) {
      case "welcome":
        emailContent = getWelcomeEmail(data?.userName || to.split("@")[0]);
        break;
      case "verify":
        if (!data?.link) throw new Error("Missing 'link' in data for verify email.");
        emailContent = getVerifyEmail(data.link);
        break;
      case "reset-password":
        if (!data?.link) throw new Error("Missing 'link' in data for reset-password email.");
        emailContent = getResetPasswordEmail(data.link);
        break;
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
      throw new Error(`Resend API error: ${res.status} - ${errorText}`);
    }

    const resendData = await res.json();

    // 4. Log to database
    const { error: logError } = await supabaseClient
      .from("email_logs")
      .insert({
        user_id: userId || null,
        email_type: type,
        to_email: to,
        status: "success",
        provider: "resend",
      });

    if (logError) {
      console.error("[Email Log Error]", logError);
      // We don't fail the request if logging fails, but we log it to console
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
