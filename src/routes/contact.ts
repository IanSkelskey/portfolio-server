import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";
import { z } from "zod";
import { buildContactEmailHtml, escapeHtml } from "../emailTemplate.js";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// 3 submissions per IP per 24 hours
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
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
  // Timing — client records mount time; sent to detect instant bot submissions
  _loadTime: z.number().optional(),
});

// URLs in the name field are a near-universal spam signal
const URL_IN_NAME = /https?:\/\/|www\./i;
// Flag messages with more than 5 URLs — legitimate messages rarely have this many
const MAX_URLS_IN_MESSAGE = 5;
const URL_COUNT_RE = /https?:\/\//gi;

router.post("/", limiter, async (req: Request, res: Response) => {
  const result = ContactSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: "Invalid input." });
    return;
  }

  const { name, email, message, _honey, _loadTime } = result.data;

  // Silently discard bot submissions without revealing the check
  if (_honey) {
    res.json({ ok: true });
    return;
  }

  // Timing check — bots submit forms in milliseconds; require at least 2 seconds
  if (_loadTime !== undefined && Date.now() - _loadTime < 2000) {
    res.json({ ok: true });
    return;
  }

  // Content filtering — silently drop obvious spam patterns
  if (URL_IN_NAME.test(name)) {
    res.json({ ok: true });
    return;
  }
  const urlCount = (message.match(URL_COUNT_RE) ?? []).length;
  if (urlCount > MAX_URLS_IN_MESSAGE) {
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
      html: buildContactEmailHtml({ name, email, message }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

export { router as contactRouter };
