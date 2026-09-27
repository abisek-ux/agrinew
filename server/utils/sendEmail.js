const nodemailer = require('nodemailer');

/**
 * Sends an email containing the OTP verification code.
 * If EMAIL_USER and EMAIL_PASS (or EMAIL_PASSWORD) are configured in .env, sends via real SMTP (e.g. Gmail).
 * If not configured or if SMTP fails, logs the test preview link / code fallback.
 */
async function sendEmail({ to, subject, otp, firstName, type = 'reset' }) {
  let transporter;
  let isRealSmtp = false;

  const timeoutOptions = {
    connectionTimeout: 15000, // 15s max to establish connection
    greetingTimeout: 15000,   // 15s max for greeting
    socketTimeout: 20000      // 20s max for socket activity
  };

  const DEFAULT_EMAIL_USER = 'mgowres@gmail.com';
  const DEFAULT_EMAIL_PASS = 'jbxe dlnp mazj rfzs';

  // Support both EMAIL_PASS and EMAIL_PASSWORD environment variable names and strip spaces (Google App Passwords)
  const rawPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || DEFAULT_EMAIL_PASS;
  const cleanPass = rawPass.replace(/\s+/g, '');
  const emailUser = (process.env.EMAIL_USER || DEFAULT_EMAIL_USER).trim();
  const hasCredentials = Boolean(emailUser && cleanPass);

  if (hasCredentials) {
    isRealSmtp = true;
    const emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
    const isSecure = emailPort === 465 || process.env.EMAIL_SECURE === 'true';

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: emailPort,
      secure: isSecure,
      ...timeoutOptions,
      auth: {
        user: emailUser,
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    console.warn('⚠️ No EMAIL_USER/EMAIL_PASS configured in environment.');
  }

  const senderEmail = process.env.EMAIL_FROM || emailUser || 'noreply@agrilink.io';
  const senderName = 'AgriLink Support';

  const isLoginOtp = type === 'login';
  const headerGradient = isLoginOtp
    ? 'linear-gradient(135deg, #15803d, #166534)'
    : 'linear-gradient(135deg, #1B5E20, #2E7D32)';
  const headerIcon = isLoginOtp ? '🔐' : '🌾';
  const headingText = isLoginOtp ? 'Registration & Login Verification Code' : 'Password Reset Verification';
  const bodyText = isLoginOtp
    ? `Welcome to AgriLink! Use the verification code below to verify your email and complete your registration:`
    : `We received a request to reset your password. Use the following 6-digit verification code to complete the reset:`;
  const otpBorderColor = isLoginOtp ? '#22c55e' : '#2E7D32';
  const otpBgColor = isLoginOtp ? '#f0fdf4' : '#F1F8E9';
  const otpTextColor = isLoginOtp ? '#15803d' : '#1B5E20';
  const headingColor = isLoginOtp ? '#15803d' : '#1B5E20';
  const expiryMins = '10';
  const warningText = isLoginOtp
    ? 'If you did not attempt to register on AgriLink, please disregard this message.'
    : 'If you did not request this code, you can safely ignore this email.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #041311; color: #2e3b2e;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.25);">
        <tr>
          <td style="background: ${headerGradient}; padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 0.5px;">${headerIcon} AgriLink Platform</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px;">Direct Farm-to-Table &amp; Real-Time Logistics</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <h2 style="color: ${headingColor}; font-size: 20px; margin-top: 0; margin-bottom: 12px;">${headingText}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
              Hello <strong>${firstName || 'Valued Member'}</strong>,<br>
              ${bodyText}
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background-color: ${otpBgColor}; border: 2px dashed ${otpBorderColor}; border-radius: 14px; padding: 18px 38px;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: ${otpTextColor}; font-family: monospace;">
                  ${otp}
                </span>
              </div>
            </div>
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 24px;">
              ⏱️ This code will expire in <strong>${expiryMins} minutes</strong>.<br>
              ${warningText}
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; line-height: 1.5; margin: 0; text-align: center;">
              Thank you for being part of the AgriLink community.<br>
              Connecting Farmers, Customers &amp; Delivery Fleets.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  let info = null;
  let isRealDelivered = false;

  let sendError = null;

  if (transporter) {
    try {
      info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        subject,
        text: `Your AgriLink OTP verification code is: ${otp}. It expires in 10 minutes.`,
        html: htmlContent
      });
      isRealDelivered = Boolean(info?.messageId);
      console.log(`📧 [EMAIL DELIVERED] Successfully sent to: ${to} (MessageId: ${info?.messageId})`);
    } catch (err) {
      sendError = err.message;
      if (err.code === 'EAUTH') {
        console.warn(`⚠️ [Gmail SMTP Auth Notice] Gmail rejected credentials for ${emailUser}.`);
      } else {
        console.warn(`⚠️ [Email Dispatch Note]: ${err.message}`);
      }
      isRealDelivered = false;
    }
  } else {
    sendError = 'Email service is not configured on the server.';
  }

  const previewUrl = info ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    console.log(`📧 Test Email preview URL: ${previewUrl}`);
  }

  return {
    messageId: info?.messageId || null,
    previewUrl,
    isRealDelivered,
    error: sendError
  };
}

module.exports = sendEmail;
