import type { FeaturesContent } from "../../../common/interfaces/content.interface";

export const featuresContent: FeaturesContent = {
    eyebrow: "Features",
    title: "Everything around the send",
    description: "The plumbing that usually gets rebuilt badly in-house, handled once.",
    items: [
        {
            title: "Queued delivery",
            description: "Bursts are absorbed by a queue, so traffic spikes never block your request path.",
        },
        {
            title: "Message templates",
            description: "Define a template once and pass variables per send — no string concatenation in app code.",
        },
        {
            title: "Delivery tracking",
            description: "Follow each message through queued, sent and failed states with an auditable record.",
        },
        {
            title: "Typed payloads",
            description: "Every request is validated against a schema and inferred end to end in TypeScript.",
        },
        {
            title: "Scoped access",
            description: "Token-based auth with per-route permissions, so integrations only get what they need.",
        },
        {
            title: "Scheduled sends",
            description: "Reminders and campaigns are driven by schedules instead of hand-rolled cron jobs.",
        },
    ],
};
