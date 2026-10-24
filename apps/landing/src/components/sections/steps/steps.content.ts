import type { StepsContent } from "../../../common/interfaces/content.interface";

export const stepsContent: StepsContent = {
    eyebrow: "How it works",
    title: "Three steps to the first send",
    description: "No SDK ceremony, no provisioning calls in your request path.",
    items: [
        {
            step: "01",
            title: "Create an account",
            description: "Sign up and generate an API token scoped to the permissions your service needs.",
        },
        {
            step: "02",
            title: "Add a template",
            description: "Define the message once with named variables, then reuse it for every send.",
        },
        {
            step: "03",
            title: "Send",
            description: "POST to the messages endpoint — delivery, retries and tracking are handled downstream.",
        },
    ],
};
