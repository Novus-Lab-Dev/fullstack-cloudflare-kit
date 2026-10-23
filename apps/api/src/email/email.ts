import mjml2html from "mjml-browser";
import { env } from "cloudflare:workers";
import baseTemplate from "./base.mjml";

export type EmailInput = {
    to: string | string[];
    subject: string;
    variables?: Record<string, string | number>;
    text?: string;
    from?: string;
    replyTo?: string;
};

// Minimal email helper (mirrors the ResponseHelper static-method style).
// Renders an MJML template at runtime and sends via MailChannels'
// transactional HTTP API (free tier, no API key; authenticated by the Worker).
export class EmailHelper {
    private static escapeHtml(value: string): string {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Fill the MJML template: `{{{raw}}}` inserted verbatim, `{{text}}` HTML-escaped.
    private static fillTemplate(html: string, variables: EmailInput["variables"] = {}): string {
        return html
            .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, key: string) => String(variables[key] ?? ""))
            .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => EmailHelper.escapeHtml(String(variables[key] ?? "")));
    }

    // Compile MJML -> HTML at runtime (mjml-browser runs on the Workers runtime).
    static async render(variables?: EmailInput["variables"]): Promise<string> {
        const { html } = await mjml2html(baseTemplate, { validationLevel: "skip" });
        return EmailHelper.fillTemplate(html, variables);
    }

    static async send(input: EmailInput): Promise<void> {
        const html = await EmailHelper.render(input.variables);
        const recipients = Array.isArray(input.to) ? input.to : [input.to];

        const response = await fetch(env.MAILCHANNELS_ENDPOINT, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                personalizations: [{ to: recipients.map(email => ({ email })) }],
                from: { email: input.from ?? env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
                subject: input.subject,
                content: [
                    ...(input.text ? [{ type: "text/plain", value: input.text }] : []),
                    { type: "text/html", value: html },
                ],
                ...(input.replyTo ? { reply_to: { email: input.replyTo } } : {}),
            }),
        });

        if (!response.ok) {
            const detail = await response.text().catch(() => "");
            throw new Error(`Email send failed (${response.status}): ${detail}`);
        }
    }
}
