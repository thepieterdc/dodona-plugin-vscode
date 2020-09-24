import ProgrammingLanguage from "./api/resources/programmingLanguage";

// TODO find a better way to do this
export function getSyntax(language: ProgrammingLanguage | null, url: string) {
    const hashtag = ["maple", "ruby", "python"];
    const slashes = ["c#", "c++", "java", "javascript"];
    const dashes = ["haskell"];
    const percentages = ["prolog"];

    if (language) {
        const languageName = language.name.toLowerCase();

        if (hashtag.includes(languageName)) {
            return `# ${url}`;
        }

        if (slashes.includes(languageName)) {
            return `// ${url}`;
        }

        if (dashes.includes(languageName)) {
            return `-- ${url}`;
        }

        if (percentages.includes(languageName)) {
            return `% ${url}`;
        }
    }
    return `/*${url}*/`;
}