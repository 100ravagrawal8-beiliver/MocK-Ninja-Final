export async function POST(request) {
  try {
    const { email, otp, token, timestamp } = await request.json();

    if (!email || !otp || !token || !timestamp) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check expiry (10 minutes)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      return Response.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    // Recreate the token and compare
    const secret = process.env.OTP_SECRET || "mockninja-otp-2026";
    const encoder = new TextEncoder();
    const data = encoder.encode(email + otp + secret + timestamp);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedToken = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (token === expectedToken) {
      return Response.json({ verified: true });
    } else {
      return Response.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
