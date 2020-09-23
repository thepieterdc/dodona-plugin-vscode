// TODO find a better way to do this
export function getSyntax(language: string, url: string) {
    const hashtag = ["maple", "ruby", "python"];
    const slashes = ["c#", "c++", "java", "javascript"];
    const dashes = ["haskell"];
    const percentages = ["prolog"];

    language = language.toLowerCase();

    if (hashtag.includes(language)) {
        return `# ${url}`;
    }

    if (slashes.includes(language)) {
        return `// ${url}`;
    }

    if (dashes.includes(language)) {
        return `-- ${url}`;
    }

    if (percentages.includes(language)) {
        return `% ${url}`;
    }

    return `/*${url}*/`;
}