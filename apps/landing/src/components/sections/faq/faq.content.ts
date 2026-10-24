import type { FaqContent } from "../../../common/interfaces/content.interface";

export const faqContent: FaqContent = {
    eyebrow: "FAQ",
    title: "Questions before you integrate",
    description: "Short answers to the things that block a first integration.",
    items: [
        {
            question: "Do I need a sender ID to start?",
            answer: "You can send from a sandbox sender while integrating, then attach a real sender ID before going live.",
        },
        {
            question: "What happens when a carrier rejects a message?",
            answer: "Failed sends are retried with backoff by the queue, and the final state is recorded against the message.",
        },
        {
            question: "Can message copy live outside my code?",
            answer: "Yes — templates are stored server side and referenced by name, with variables filled in per send.",
        },
        {
            question: "How do I keep credentials out of clients?",
            answer: "Tokens are scoped and permission-checked per route, so they are intended for server-to-server use only.",
        },
    ],
};
