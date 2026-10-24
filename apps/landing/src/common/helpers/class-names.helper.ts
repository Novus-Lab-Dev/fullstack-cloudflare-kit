/**
 * Joins conditional class names. Plain function (no class syntax) so components
 * can compose utility strings without inline template concatenation.
 */
export function classNames(...values: Array<string | false | null | undefined>): string {
    return values.filter(Boolean).join(" ");
}
