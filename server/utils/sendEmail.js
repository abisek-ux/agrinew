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
    connectionTimeout: 5000, // 5s max to establish connection
    greetingTimeout: 5000,   // 5s max for greeting
    socketTimeout: 8000      // 8s max for socket activity
  };

  // Support both EMAIL_PASS and EMAIL_PASSWORD environment variable names and strip spaces (Google App Passwords)
  const rawPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '';
  const cleanPass = rawPass.replace(/\s+/g, '');
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const hasCredentials = Boolean(emailUser && cleanPass);

  if (hasCredentials) {
    isRealSmtp = true;
    const emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
    const isSecure = emailPort === 465 || process.env.EMAIL_SECURE === 'true';

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: emailPort,
      secure: isSecure,
      family: 4, // Explicitly enforce IPv4 to prevent IPv6 ENETUNREACH in containers
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
  const isDeliveryOtp = type === 'delivery';
  const headerGradient = isDeliveryOtp
    ? 'linear-gradient(135deg, #0284c7, #0369a1)'
    : isLoginOtp
    ? 'linear-gradient(135deg, #15803d, #166534)'
    : 'linear-gradient(135deg, #1B5E20, #2E7D32)';
  const headerIcon = isDeliveryOtp ? '📦' : isLoginOtp ? '🔐' : '🌾';
  const headingText = isDeliveryOtp
    ? 'Delivery Handover Verification Code'
    : isLoginOtp
    ? 'Registration & Login Verification Code'
    : 'Password Reset Verification';
  const bodyText = isDeliveryOtp
    ? `Your delivery partner has arrived at your address with your AgriLink farm order. Please provide the 6-digit handover code below to your delivery driver to complete delivery:`
    : isLoginOtp
    ? `Welcome to AgriLink! Use the verification code below to verify your email and complete your registration:`
    : `We received a request to reset your password. Use the following 6-digit verification code to complete the reset:`;
  const otpBorderColor = isDeliveryOtp ? '#0284c7' : isLoginOtp ? '#22c55e' : '#2E7D32';
  const otpBgColor = isDeliveryOtp ? '#f0f9ff' : isLoginOtp ? '#f0fdf4' : '#F1F8E9';
  const otpTextColor = isDeliveryOtp ? '#0369a1' : isLoginOtp ? '#15803d' : '#1B5E20';
  const headingColor = isDeliveryOtp ? '#0284c7' : isLoginOtp ? '#15803d' : '#1B5E20';
  const expiryMins = '10';
  const warningText = isDeliveryOtp
    ? 'Only provide this verification code to the delivery driver AFTER physically inspecting your package at your doorstep.'
    : isLoginOtp
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

  // 1. Google Apps Script Webhook (Port 443 HTTPS - Sends directly from Gmail to ANY email in the world with no domain restrictions)
  const googleScriptUrl = (process.env.GOOGLE_SCRIPT_URL || '').trim();
  if (googleScriptUrl) {
    try {
      const response = await fetch(googleScriptUrl, {
        method: 'POST',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to,
          subject: subject,
          html: htmlContent,
          text: `Your AgriLink OTP verification code is: ${otp}. It expires in 10 minutes.`
        })
      });

      const resText = await response.text();
      let resJson = {};
      try { resJson = JSON.parse(resText); } catch (e) {}

      if (response.ok && resJson.success !== false) {
        console.log(`📧 [GOOGLE APPS SCRIPT DELIVERED] Successfully sent to: ${to}`);
        return {
          messageId: resJson.id || `gas_${Date.now()}`,
          previewUrl: null,
          isRealDelivered: true,
          error: null
        };
      } else {
        const gasErr = resJson.error || resText || 'Google Script delivery error';
        console.warn(`⚠️ [Google Script Warning]: ${gasErr}`);
        sendError = gasErr;
      }
    } catch (gasErr) {
      console.warn(`⚠️ [Google Script Exception]: ${gasErr.message}`);
      sendError = gasErr.message;
    }
  }

  // 2. Brevo (Sendinblue) HTTPS API (Port 443 - Sends to ANY email in the world with no domain restrictions)
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: process.env.BREVO_SENDER || emailUser || 'support@agrilink.io'
          },
          to: [{ email: to, name: firstName || 'Valued Member' }],
          subject: subject,
          htmlContent: htmlContent,
          textContent: `Your AgriLink OTP verification code is: ${otp}. It expires in 10 minutes.`
        })
      });

      const bData = await response.json();
      if (response.ok && (bData.messageId || bData.messageIds)) {
        console.log(`📧 [BREVO HTTPS DELIVERED] Successfully sent to: ${to} (MessageId: ${bData.messageId || bData.messageIds?.[0]})`);
        return {
          messageId: bData.messageId || bData.messageIds?.[0],
          previewUrl: null,
          isRealDelivered: true,
          error: null
        };
      } else {
        const bErr = bData.message || JSON.stringify(bData);
        console.warn(`⚠️ [Brevo API Error]: ${bErr}`);
        sendError = bErr;
      }
    } catch (brevoErr) {
      console.warn(`⚠️ [Brevo Dispatch Exception]: ${brevoErr.message}`);
      sendError = brevoErr.message;
    }
  }

  // 3. Resend HTTPS API (Port 443 - Testing sandbox)
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          html: htmlContent,
          text: `Your AgriLink OTP verification code is: ${otp}. It expires in 10 minutes.`
        })
      });

      const data = await response.json();
      if (response.ok && data.id) {
        console.log(`📧 [RESEND HTTPS DELIVERED] Successfully sent to: ${to} (MessageId: ${data.id})`);
        return {
          messageId: data.id,
          previewUrl: null,
          isRealDelivered: true,
          error: null
        };
      } else {
        const errorDetail = data.message || JSON.stringify(data);
        console.warn(`⚠️ [Resend API Error]: ${errorDetail}`);
        sendError = errorDetail;
      }
    } catch (resendErr) {
      console.warn(`⚠️ [Resend Dispatch Exception]: ${resendErr.message}`);
      sendError = resendErr.message;
    }
  }

  // 2. Fallback to Direct SMTP (Port 465 SSL)
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
