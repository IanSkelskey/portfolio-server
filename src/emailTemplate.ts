/** Minimal HTML escaping to prevent injection in the email body. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PORTRAIT_URL = "https://ianskelskey.github.io/pixel-portrait.png";
const PORTFOLIO_URL = "https://ianskelskey.github.io";

// Hard-coded hex values from the portfolio's Indigo + Spruce + Brandy palette.
// Email clients strip <style> blocks and don't support CSS custom properties,
// so all colours must be inline.
const C = {
  bgOuter:   "#0e0e16", // indigo-950
  bgHeader:  "#131320", // near indigo-950, slightly lighter
  bgCard:    "#27273f", // indigo-800
  bgFooter:  "#1a1a2f", // between 900 & 950
  text:      "#efeff5", // indigo-50
  textMuted: "#a0a0c5", // indigo-300
  textBody:  "#c8c8d8", // indigo-200 ish
  accent:    "#80a45b", // spruce-500
  highlight: "#cf5b30", // brandy-500
  divider:   "#3a3a5f", // indigo-700
  footerText:"#61619e", // indigo-500
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

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New message from ${safeName}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgOuter};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><![endif]-->

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:${C.bgOuter};min-width:100%;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card shell -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:560px;border-radius:12px;overflow:hidden;border:1px solid ${C.divider};">

          <!-- ── Header ─────────────────────────────── -->
          <tr>
            <td align="center" bgcolor="${C.bgHeader}"
              style="background-color:${C.bgHeader};padding:36px 32px 28px;">

              <!-- Pixel portrait -->
              <a href="${PORTFOLIO_URL}" style="display:inline-block;text-decoration:none;">
                <img
                  src="${PORTRAIT_URL}"
                  alt="Ian Skelskey pixel portrait"
                  width="75" height="75"
                  style="display:block;margin:0 auto 16px;
                         image-rendering:pixelated;image-rendering:-moz-crisp-edges;
                         border-radius:10px;border:2px solid ${C.divider};"
                />
              </a>

              <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:${C.text};
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                         letter-spacing:-0.01em;">
                Ian Skelskey
              </p>
              <p style="margin:0;font-size:11px;color:${C.textMuted};
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                         letter-spacing:0.1em;text-transform:uppercase;">
                Portfolio&nbsp;&middot;&nbsp;New&nbsp;Message
              </p>
            </td>
          </tr>

          <!-- ── Accent gradient bar ─────────────────── -->
          <!--[if !mso]><!-->
          <tr>
            <td height="3"
              style="height:3px;line-height:3px;font-size:0;
                     background:linear-gradient(90deg,${C.accent} 0%,#b3c99c 50%,${C.highlight} 100%);">
              &nbsp;
            </td>
          </tr>
          <!--<![endif]-->
          <!--[if mso]>
          <tr>
            <td height="3" bgcolor="${C.accent}" style="height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <![endif]-->

          <!-- ── Body ───────────────────────────────── -->
          <tr>
            <td bgcolor="${C.bgCard}"
              style="background-color:${C.bgCard};padding:28px 32px 32px;
                     font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

              <!-- From label -->
              <p style="margin:0 0 6px;font-size:11px;color:${C.textMuted};
                         letter-spacing:0.1em;text-transform:uppercase;">
                Message from
              </p>

              <!-- Sender name -->
              <p style="margin:0 0 2px;font-size:18px;font-weight:600;color:${C.text};">
                ${safeName}
              </p>

              <!-- Sender email -->
              <p style="margin:0 0 24px;">
                <a href="mailto:${safeEmail}"
                  style="color:${C.accent};font-size:14px;text-decoration:none;">
                  ${safeEmail}
                </a>
              </p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin:0 0 24px;">
                <tr>
                  <td height="1" bgcolor="${C.divider}"
                    style="height:1px;line-height:1px;font-size:0;background-color:${C.divider};">
                  </td>
                </tr>
              </table>

              <!-- Message label -->
              <p style="margin:0 0 10px;font-size:11px;color:${C.textMuted};
                         letter-spacing:0.1em;text-transform:uppercase;">
                Message
              </p>

              <!-- Message body -->
              <p style="margin:0;font-size:15px;color:${C.textBody};line-height:1.75;
                         white-space:pre-wrap;word-break:break-word;">
                ${safeMessage}
              </p>
            </td>
          </tr>

          <!-- ── Reply CTA ──────────────────────────── -->
          <tr>
            <td align="center" bgcolor="${C.bgCard}"
              style="background-color:${C.bgCard};padding:0 32px 32px;">
              <a href="mailto:${safeEmail}"
                style="display:inline-block;padding:10px 28px;border-radius:6px;
                       background-color:${C.accent};color:#ffffff;font-size:14px;font-weight:600;
                       text-decoration:none;letter-spacing:0.02em;
                       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                Reply to ${safeName}
              </a>
            </td>
          </tr>

          <!-- ── Footer ────────────────────────────── -->
          <tr>
            <td align="center" bgcolor="${C.bgFooter}"
              style="background-color:${C.bgFooter};padding:16px 32px;border-top:1px solid ${C.divider};">
              <p style="margin:0;font-size:12px;color:${C.footerText};
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                Sent from the contact form at
                <a href="${PORTFOLIO_URL}" style="color:${C.accent};text-decoration:none;">
                  ianskelskey.github.io
                </a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card shell -->

      </td>
    </tr>
  </table>

  <!--[if mso]></td></tr></table><![endif]-->

</body>
</html>`;
}
