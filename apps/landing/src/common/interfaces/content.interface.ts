/**
 * Site-level content contracts consumed by `site.config.ts`.
 * Section copy lives inside each section component, not here.
 */

export interface NavItem {
    label: string;
    href: string;
}

export interface SocialLink {
    label: string;
    href: string;
}
