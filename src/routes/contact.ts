import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";
import { z } from "zod";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// 5 submissions per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(200),
  message: z.string().min(1, "Message is required").max(2000),
  // Honeypot — real users leave this empty; bots fill it in
  _honey: z.string().max(0).optional(),
});

router.post("/", limiter, async (req: Request, res: Response) => {
  const result = ContactSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: "Invalid input." });
    return;
  }

  const { name, email, message, _honey } = result.data;

  // Silently discard bot submissions without revealing the check
  if (_honey) {
    res.json({ ok: true });
    return;
  }

  const fromAddress = "Portfolio Contact <onboarding@resend.dev>";
  const toAddress = process.env.CONTACT_TO_EMAIL;

  if (!toAddress) {
    console.error("CONTACT_TO_EMAIL is not set");
    res.status(500).json({ error: "Server misconfiguration." });
    return;
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

/** Minimal HTML escaping to prevent injection in the email body. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { router as contactRouter };
