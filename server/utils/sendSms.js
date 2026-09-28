/**
 * Sends an SMS or OTP verification through Twilio REST API / Twilio Verify
 * structured cleanly to support alternate SMS providers without credential leaks.
 */
const sendSms = async ({ to, body, otp, purpose }) => {
  const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase();

  if (provider !== 'twilio') {
    throw new Error(`SMS provider '${provider}' is not supported by this server configuration.`);
  }

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER,
    TWILIO_VERIFY_SERVICE_SID
  } = process.env;

  // Basic format cleanup
  let cleaned = String(to || '').trim().replace(/[\s\-()]/g, '');
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    cleaned = `+91${cleaned}`;
  } else if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  const formattedTo = cleaned;

  // Option 1: Twilio Verify Service (Recommended for OTPs and international routing to India)
  const isVerifyConfigured = Boolean(
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    TWILIO_VERIFY_SERVICE_SID &&
    !TWILIO_VERIFY_SERVICE_SID.includes('XXXX')
  );

  if (isVerifyConfigured) {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const verifyUrl = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`;

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: formattedTo,
        Channel: 'sms'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `HTTP ${response.status}`;
      console.error(`[Twilio Verify Error] Code ${data.code || response.status}: ${errorMsg}`);
      throw new Error(`Twilio Verify rejected request: ${errorMsg} (Code: ${data.code || response.status})`);
    }

    console.log(`[Twilio Verify] Verification initiated for ${formattedTo.slice(0, 5)}... Status: ${data.status}`);
    return {
      provider: 'twilio_verify',
      sid: data.sid,
      status: data.status,
      to: formattedTo
    };
  }

  // Option 2: Twilio Standard Messages API
  const isMessagesConfigured = Boolean(
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    TWILIO_FROM_NUMBER &&
    !TWILIO_ACCOUNT_SID.includes('XXXX')
  );

  if (!isMessagesConfigured) {
    throw new Error(
      'SMS configuration missing: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER (or TWILIO_VERIFY_SERVICE_SID) in your environment variables.'
    );
  }

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const messagesUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const response = await fetch(messagesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      To: formattedTo,
      From: TWILIO_FROM_NUMBER,
      Body: body || `[AgriLink] Your one-time verification passcode is ${otp}. Valid for 5 minutes.`
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || `HTTP ${response.status}`;
    console.error(`[Twilio Messages Error] Code ${data.code || response.status}: ${errorMsg}`);
    throw new Error(`Twilio rejected SMS: ${errorMsg} (Code: ${data.code || response.status})`);
  }

  console.log(`[Twilio Messages] SMS sent successfully. Message SID: ${data.sid}`);
  return {
    provider: 'twilio_messages',
    sid: data.sid,
    status: data.status,
    to: formattedTo
  };
};

module.exports = sendSms;
