import ProgrammingLanguage from "../api/resources/programmingLanguage";

// Comment functions.
const dashes = (text: string) => `-- ${text}`;
const exclamation = (text: string) => `<!-- ${text} -->`;
const hashtag = (text: string) => `# ${text}`;
const percentage = (text: string) => `% ${text}`;
const slashes = (text: string) => `// ${text}`;

// Language to comment function mapping.
const commentMapping: { [key: string]: CallableFunction } = {
    c: slashes,
    "c++": slashes,
    "c#": slashes,
    haskell: dashes,
    html: exclamation,
    java: slashes,
    javascript: slashes,
    maple: hashtag,
    prolog: percentage,
    python: hashtag,
    ruby: hashtag,
    sql: dashes,
};

/**
 * Generates a comment for the given message in the given programming language.
 *
 * @param text the message to comment
 * @param language the programming language
 */
export function comment(
    text: string,
    language: ProgrammingLanguage | null = null,
): string {
    // Get the name of the language.
    const name = language && language.name && language.name.toLowerCase();

    // Use the comment function if it exists.
    if (name && commentMapping[name]) {
        return commentMapping[name](text);
    }

    // Default to /* */.
    return `/* ${text} */`;
}
