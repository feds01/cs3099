import * as LangIcons from 'react-icons/si';
import { IconType } from 'react-icons/lib';
import { RiHashtag } from 'react-icons/ri';
import { Language } from 'prism-react-renderer';

export function getExtension(path: string): string | null {
    const components = path.split('.');

    if (components.length < 2) return null;
    return components[components.length - 1];
}

type ExtendedLanguages = 'v' | 'rust' | 'hash';

export const LanguageMap: Map<Language | ExtendedLanguages, string[]> = new Map([
    ['markup', ['md']],
    ['bash', ['sh']],
    ['clike', ['h']],
    ['c', ['c']],
    ['cpp', ['cpp']],
    ['css', ['css']],
    ['javascript', ['js']],
    ['jsx', ['jsx']],
    ['coffeescript', []],
    ['actionscript', []],
    ['css-extr', []],
    ['diff', []],
    ['git', []],
    ['go', ['go']],
    ['graphql', ['gql']],
    ['handlebars', []],
    ['json', ['json']],
    ['less', []],
    ['makefile', ['make']],
    ['markdown', ['md']],
    ['objectivec', []],
    ['ocaml', []],
    ['python', ['py']],
    ['reason', []],
    ['sass', []],
    ['scss', ['scss', 'sass']],
    ['sql', ['sql']],
    ['stylus', []],
    ['tsx', ['tsx']],
    ['typescript', ['ts']],
    ['wasm', []],
    ['yaml', ['yml']],
    ['v', ['v']],
    ['rust', ['rs', 'hash']], // @@Temporary
]);

/**
 * Function used to attempt to coerce a string type into a language using the
 * defined language type. In this case, the string represents a language file extension
 * that should be used for the type of the language.
 *
 * @param extension - The file extension.
 * @returns Maybe a language type, or null if no language is found.
 */
export function coerceExtensionToLanguage(extension: string): Language | ExtendedLanguages | null {
    for (const [key, value] of LanguageMap.entries()) {
        if (value.find((lang) => lang === extension)) {
            return key;
        }
    }

    return null;
}

// The Icon map is a mapping between file extension to the icons that
// are provided in the react-icons folder.
export const IconMap: { [index: string]: IconType } = {
    hash: RiHashtag,
    c: LangIcons.SiC,
    hs: LangIcons.SiHaskell,
    js: LangIcons.SiJavascript,
    java: LangIcons.SiJava,
    md: LangIcons.SiMarkdown,
    ts: LangIcons.SiTypescript,
    py: LangIcons.SiPython,
    r: LangIcons.SiR,
    rs: LangIcons.SiRust,
    v: LangIcons.SiV,
    json: LangIcons.SiJson,
};
