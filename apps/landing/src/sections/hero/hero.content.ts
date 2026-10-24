import type { HeroContent } from "../../common/interfaces/content.interface";

export const heroContent: HeroContent = {
    eyebrow: "Transactional SMS API",
    title: "Send SMS that actually arrives",
    description:
        "OTPs, alerts and notifications over one typed API — queued delivery, templates and per-message tracking included.",
    primaryCta: { label: "Get started", href: "#get-started" },
    secondaryCta: { label: "See features", href: "#features" },
    snippet: {
        title: "Send a message",
        code: `await sms.send({
    to: "+15551234567",
    template: "otp",
    variables: { code: "123456" },
});`,
    },
};
