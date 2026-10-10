// Matches the Bootstrap theme attribute on the root <html> element.
const THEME_ATTRIBUTE = /(<html\b[^>]*?\sdata-bs-theme=)(["'])[^"']*\2/i;

// Matches the script call that applies the theme of the Dodona account, which
// would otherwise overwrite the attribute when the page loads.
const INIT_THEME = /(\binitTheme\()(["'])[^"']*\2(\))/g;

/**
 * Sets the theme of a Dodona HTML page, so it matches the editor theme.
 *
 * @param html the HTML of the page
 * @param dark whether the page should be rendered in dark mode
 * @return the HTML with the theme applied
 */
export function applyTheme(html: string, dark: boolean): string {
    const theme = dark ? "dark" : "light";

    // Replace the html attribute.
    const themed = THEME_ATTRIBUTE.test(html)
        ? html.replace(THEME_ATTRIBUTE, `$1"${theme}"`)
        : // No theme attribute present, add it to the root element.
          html.replace(/<html\b/i, `<html data-bs-theme="${theme}"`);

    // Replace the initTheme call.
    return themed.replace(INIT_THEME, `$1"${theme}"$3`);
}