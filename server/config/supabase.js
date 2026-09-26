const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('<project-ref>')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log(`⚡ [Supabase Cloud] Initialized client connected to ${supabaseUrl}`);
  } catch (err) {
    console.warn(`⚠️ [Supabase Client Warning]: ${err.message}`);
  }
} else {
  console.log(`ℹ️ [Supabase Note] No valid SUPABASE_URL found in .env. Operating in hybrid memory & simulation mode.`);
}

/**
 * Send OTP via Supabase Auth (SMS or Email)
 */
const sendSupabaseOtp = async ({ phone, email, channel = 'sms' }) => {
  if (!supabase) {
    return {
      success: false,
      isSimulated: true,
      message: 'Supabase client not configured; fallback to local OTP generator'
    };
  }

  try {
    if (channel === 'email' || (email && !phone)) {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false
        }
      });
      if (error) throw error;
      return { success: true, data, channel: 'email', message: `OTP sent via Supabase Email to ${email}` };
    } else {
      // Default to SMS
      const formattedPhone = phone?.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms'
        }
      });
      if (error) throw error;
      return { success: true, data, channel: 'sms', message: `OTP sent via Supabase SMS to ${formattedPhone}` };
    }
  } catch (err) {
    console.warn(`⚠️ [Supabase sendOtp Error]: ${err.message}`);
    return {
      success: false,
      error: err.message,
      fallbackRequired: true
    };
  }
};

/**
 * Verify OTP via Supabase Auth
 */
const verifySupabaseOtp = async ({ phone, email, token, type = 'sms' }) => {
  if (!supabase) {
    return { success: false, isSimulated: true };
  }

  try {
    const payload = {
      token: String(token).trim(),
      type: type || 'sms'
    };
    if (phone) {
      payload.phone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    }
    if (email) {
      payload.email = email.trim();
      payload.type = 'email';
    }

    const { data, error } = await supabase.auth.verifyOtp(payload);
    if (error) throw error;

    return {
      success: true,
      verified: true,
      session: data?.session,
      user: data?.user,
      message: 'OTP verified successfully via Supabase Cloud Auth'
    };
  } catch (err) {
    console.warn(`⚠️ [Supabase verifyOtp Error]: ${err.message}`);
    return {
      success: false,
      verified: false,
      error: err.message
    };
  }
};

/**
 * Record OTP Transaction Audit in Supabase Database (if table exists)
 */
const logSupabaseOtpAudit = async (auditRecord) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('otp_logs')
      .insert([{
        notification_id: auditRecord.notificationId || null,
        action_type: auditRecord.actionType || 'GENERAL',
        mobile: auditRecord.mobile || null,
        status: auditRecord.status || 'pending',
        created_at: new Date().toISOString()
      }]);
    if (error) {
      // Table might not exist yet, safe to ignore
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
};

const getSupabaseStatus = () => {
  const isConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('<project-ref>'));
  return {
    configured: isConfigured,
    provider: isConfigured ? 'supabase' : 'hybrid_in_memory',
    supabaseUrl: isConfigured ? supabaseUrl.replace(/\/$/, '') : 'Not Configured (Using Smart Mock & Local SMS)'
  };
};

module.exports = {
  supabase,
  sendSupabaseOtp,
  verifySupabaseOtp,
  logSupabaseOtpAudit,
  getSupabaseStatus
};
