/**
 * Sends an SMS through Twilio's REST API without exposing credentials to the client.
 */
const sendSms = async ({ to, body }) => {
  const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase();

  if (provider !== 'twilio') {
    throw new Error('SMS provider is not supported by this server');
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error('SMS provider credentials are missing in .env');
  }

  // Ensure 'to' number starts with '+' for international E.164 format
  const formattedTo = to.toString().trim().startsWith('+') ? to : `+${to}`;

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: formattedTo, From: TWILIO_FROM_NUMBER, Body: body })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('Twilio Error Response:', data);
    throw new Error(`Twilio rejected SMS: ${data.message || 'Unknown error'}`);
  }

  console.log(`SMS successfully sent to ${formattedTo}. Message SID: ${data.sid}`);
  return data;
};

module.exports = sendSms;
