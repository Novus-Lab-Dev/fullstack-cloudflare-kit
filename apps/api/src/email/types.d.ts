// Ambient module types for the email sender.

// `.mjml` files are imported as raw text (see the `**/*.mjml` -> Text rule in
// wrangler.jsonc).
declare module "*.mjml" {
    const source: string;
    export default source;
}

// `mjml-browser` ships no types. The call is sync in the Workers runtime but
// Promise-wrapped under Node/Bun interop, so the return type is a union.
declare module "mjml-browser" {
    type MjmlResult = { html: string; errors: unknown[] };

    function mjml2html(
        source: string,
        options?: {
            validationLevel?: "strict" | "soft" | "skip";
            softValidations?: boolean;
            beautify?: boolean;
            minify?: boolean;
        }
    ): MjmlResult | Promise<MjmlResult>;

    export default mjml2html;
}
