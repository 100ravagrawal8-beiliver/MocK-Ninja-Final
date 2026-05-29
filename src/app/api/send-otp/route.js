export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: "Email required" }, { status: 400 });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const timestamp = Date.now();

    // Create a simple verification token (hash of otp + email + secret + timestamp)
    const secret = process.env.OTP_SECRET || "mockninja-otp-2026";
    const encoder = new TextEncoder();
    const data = encoder.encode(email + otp + secret + timestamp);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Send OTP via Resend
    const emailResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MockNinja AI <onboarding@resend.dev>",
        to: [email],
        subject: "Your MockNinja Verification Code: " + otp,
        html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0F1B2D;color:#F5F5F0;border-radius:16px">' +
          '<div style="text-align:center;margin-bottom:24px">' +
          '<h2 style="color:#C9A84C;margin:0">MockNinja AI</h2>' +
          '<p style="color:#94A3B8;font-size:14px">AI-Matched. Better Interviews.</p>' +
          '</div>' +
          '<p style="font-size:15px;line-height:1.6">Your verification code is:</p>' +
          '<div style="text-align:center;margin:24px 0">' +
          '<div style="display:inline-block;padding:16px 40px;background:#1A2A44;border:2px solid #C9A84C;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px;color:#C9A84C">' + otp + '</div>' +
          '</div>' +
          '<p style="font-size:13px;color:#94A3B8;line-height:1.5">This code expires in 10 minutes. Do not share it with anyone.</p>' +
          '<hr style="border:none;border-top:1px solid #334155;margin:24px 0">' +
          '<p style="font-size:12px;color:#64748B;text-align:center">You are receiving this because you used the MockNinja AI Profile Evaluator.</p>' +
          '</div>',
      }),
    });

    if (!emailResp.ok) {
      const errData = await emailResp.json();
      return Response.json({ error: "Failed to send email", details: errData }, { status: 500 });
    }

    return Response.json({ token, timestamp, message: "OTP sent" });
  } catch (error) {
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
