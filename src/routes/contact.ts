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
  statusCode: 429,
  message: {
    error: "Too many messages sent. Please wait a few minutes and try again.",
  },
});

const ContactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(200, "Email must be 200 characters or fewer."),
  message: z
    .string()
    .min(1, "Message is required.")
    .max(2000, "Message must be 2000 characters or fewer."),
  // Honeypot — real users leave this empty; bots fill it in
  _honey: z.string().max(0).optional(),
});

// Shape returned to the client on validation failure
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

router.post("/", limiter, async (req: Request, res: Response) => {
  const result = ContactSchema.safeParse(req.body);

  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    const errors: FieldErrors = {
      name: flat.name?.[0],
      email: flat.email?.[0],
      message: flat.message?.[0],
    };
    res.status(400).json({ errors });
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
