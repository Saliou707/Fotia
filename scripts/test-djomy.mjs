import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import crypto from 'crypto';

const DJOMY_CLIENT_ID = process.env.DJOMY_CLIENT_ID;
const DJOMY_CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET;
const DJOMY_PARTNER_SECRET = process.env.DJOMY_PARTNER_SECRET;

const PROD_URL = 'https://api.djomy.africa';
const SANDBOX_URL = 'https://sandbox-api.djomy.africa';

function computeHmacHex(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

async function testDjomy(baseUrl) {
  console.log(`\n--- Testing against ${baseUrl} ---`);
  
  // 1. Auth
  const apiKey = `${DJOMY_CLIENT_ID}:${computeHmacHex(DJOMY_CLIENT_ID, DJOMY_CLIENT_SECRET)}`;
  const authHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey
  };
  if (DJOMY_PARTNER_SECRET) authHeaders['X-PARTNER-DOMAIN'] = DJOMY_PARTNER_SECRET;

  const authRes = await fetch(`${baseUrl}/v1/auth`, { method: 'POST', headers: authHeaders });
  const authData = await authRes.json();
  
  if (!authData.success) {
    console.log('Auth Failed:', authData);
    return;
  }
  console.log('Auth Success!');
  const token = authData.data.accessToken;

  // 2. Gateway
  const gatewayHeaders = {
    ...authHeaders,
    'Authorization': `Bearer ${token}`
  };

  const payload = {
    amount: 1000,
    countryCode: 'GN',
    payerNumber: '00224623201462',
    description: 'Test API Djomy',
    merchantPaymentReference: `SUB_${Date.now()}`,
    returnUrl: 'https://myfotia.com/billing/success',
    cancelUrl: 'https://myfotia.com/billing/failed'
  };

  const res = await fetch(`${baseUrl}/v1/payments/gateway`, {
    method: 'POST',
    headers: gatewayHeaders,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Gateway Response Status:', res.status);
  console.log('Gateway Response Data:', JSON.stringify(data, null, 2));
}

async function main() {
  await testDjomy(SANDBOX_URL);
  await testDjomy(PROD_URL);
}

main();
