import type { NavItem, SocialLink } from "../interfaces/content.interface";

export const siteConfig = {
    name: "SMS",
    tagline: "Transactional SMS API",
    description:
        "Send OTPs, alerts and notifications over a typed API with queued delivery, templates and delivery tracking.",
    url: "https://example.com",
    nav: [
        { label: "Features", href: "/#features" },
        { label: "How it works", href: "/#how-it-works" },
        { label: "FAQ", href: "/#faq" },
    ] satisfies NavItem[],
    socials: [
        { label: "GitHub", href: "https://github.com" },
        { label: "Status", href: "https://status.example.com" },
    ] satisfies SocialLink[],
    primaryCta: { label: "Get started", href: "/#get-started" },
} as const;

export type SiteConfig = typeof siteConfig;
