interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "E0 Finder <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function notifyAdminPremiumInquiry(data: {
  businessName: string;
  contactEmail: string;
  stationName?: string | null;
  message?: string | null;
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!adminEmail) return false;

  return sendEmail({
    to: adminEmail,
    subject: `Premium inquiry: ${data.businessName}`,
    html: `
      <p><strong>Business:</strong> ${data.businessName}</p>
      <p><strong>Email:</strong> ${data.contactEmail}</p>
      <p><strong>Station:</strong> ${data.stationName ?? "—"}</p>
      <p><strong>Message:</strong> ${data.message ?? "—"}</p>
    `,
  });
}
