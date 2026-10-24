/**
 * Shared content contracts for landing page sections.
 *
 * Every `*.content.ts` file in `src/components/sections/{section}/` is typed with one of
 * these interfaces, so section copy stays data-driven and refactorable.
 */

export interface NavItem {
    label: string;
    href: string;
}

export interface SocialLink {
    label: string;
    href: string;
}

export interface CallToAction {
    label: string;
    href: string;
}

export interface HeroContent {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: CallToAction;
    secondaryCta: CallToAction;
    snippet: {
        title: string;
        code: string;
    };
}

export interface FeatureItem {
    title: string;
    description: string;
}

export interface FeaturesContent {
    eyebrow: string;
    title: string;
    description: string;
    items: FeatureItem[];
}

export interface StepItem {
    step: string;
    title: string;
    description: string;
}

export interface StepsContent {
    eyebrow: string;
    title: string;
    description: string;
    items: StepItem[];
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface FaqContent {
    eyebrow: string;
    title: string;
    description: string;
    items: FaqItem[];
}

export interface CtaContent {
    title: string;
    description: string;
    primaryCta: CallToAction;
    secondaryCta: CallToAction;
}
