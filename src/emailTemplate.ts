/** Minimal HTML escaping to prevent injection in the email body. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PORTRAIT_URL = "https://ianskelskey.github.io/pixel-portrait-x12.png";
const PORTFOLIO_URL = "https://ianskelskey.github.io";

// Hard-coded hex values from the portfolio's light-mode palette.
// Email clients strip <style> blocks and don't support CSS custom properties,
// so all colours must be inline.
const C = {
  bgOuter:   "#efeff5", // indigo-50  (--surface)
  bgCard:    "#ffffff", // white      (--raised)
  text:      "#0e0e16", // indigo-950 (--foreground)
  textMuted: "#4e4e7e", // indigo-600 (--muted)
  textFaint: "#8181b1", // indigo-400 (--faint)
  accent:    "#4d6336", // spruce-700 (--accent)
  highlight: "#a54827", // brandy-600 (--highlight)
  divider:   "#c0c0d8", // indigo-200 (--divider)
} as const;

export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export function buildContactEmailHtml({ name, email, message }: EmailData): string {
  const safeName    = escapeHtml(name);
  const safeEmail   = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New message from ${safeName}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgOuter};font-family:${font};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:${C.bgOuter};min-width:100%;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:520px;background-color:${C.bgCard};
                 border-radius:10px;border:1px solid ${C.divider};overflow:hidden;">

          <!-- ── Top accent bar ──────────────────── -->
          <tr>
            <td height="4" bgcolor="${C.accent}"
              style="height:4px;line-height:4px;font-size:0;background-color:${C.accent};">&nbsp;</td>
          </tr>

          <!-- ── Header ─────────────────────────── -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;">
              <a href="${PORTFOLIO_URL}" style="display:inline-block;text-decoration:none;">
                <img
                  src="${PORTRAIT_URL}"
                  alt="Ian Skelskey logo"
                  width="75" height="75"
                  style="display:block;margin:0 auto 14px;
                         border-radius:8px;border:2px solid ${C.divider};"
                />
              </a>
              <p style="margin:0;font-size:18px;font-weight:700;color:${C.text};letter-spacing:-0.01em;">
                Ian Skelskey
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:${C.textFaint};
                         letter-spacing:0.1em;text-transform:uppercase;">
                New&nbsp;message&nbsp;via&nbsp;portfolio
              </p>
            </td>
          </tr>

          <!-- ── Divider ─────────────────────────── -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="1" bgcolor="${C.divider}"
                    style="height:1px;line-height:1px;font-size:0;background-color:${C.divider};"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Sender ──────────────────────────── -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 2px;font-size:11px;color:${C.textFaint};
                         letter-spacing:0.08em;text-transform:uppercase;">From</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:600;color:${C.text};">${safeName}</p>
              <p style="margin:0;">
                <a href="mailto:${safeEmail}" style="font-size:14px;color:${C.accent};text-decoration:none;">
                  ${safeEmail}
                </a>
              </p>
            </td>
          </tr>

          <!-- ── Message ─────────────────────────── -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;font-size:11px;color:${C.textFaint};
                         letter-spacing:0.08em;text-transform:uppercase;">Message</p>
              <p style="margin:0;font-size:15px;color:${C.text};line-height:1.7;word-break:break-word;">
                ${safeMessage}
              </p>
            </td>
          </tr>

          <!-- ── Reply button ───────────────────── -->
          <tr>
            <td style="padding:28px 32px 32px;">
              <a href="mailto:${safeEmail}"
                style="display:inline-block;padding:10px 24px;background-color:${C.accent};
                       color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;
                       border-radius:6px;letter-spacing:0.01em;">
                Reply to ${safeName}
              </a>
            </td>
          </tr>

          <!-- ── Footer ─────────────────────────── -->
          <tr>
            <td align="center"
              style="padding:12px 32px;border-top:1px solid ${C.divider};background-color:${C.bgOuter};">
              <p style="margin:0;font-size:12px;color:${C.textFaint};">
                Sent from
                <a href="${PORTFOLIO_URL}" style="color:${C.textMuted};text-decoration:none;">
                  ianskelskey.github.io
                </a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
