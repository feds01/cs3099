import * as LangIcons from 'react-icons/si';
import { IconType } from 'react-icons/lib';
import { RiHashtag } from 'react-icons/ri';
import { GrDocumentPdf, GrDocumentTxt, GrDocumentImage } from 'react-icons/gr';
import { Language } from '../../types/renderer';

/**
 * Function to get the extension from a file path. This simply splits
 * the file path by the '.' and returns the lowercase result of the last
 * item within the split contents. If the file has no extension, the
 * function returns null
 *
 * @param path - The path of the file to split
 * @returns If a file has an extension, the extension otherwise null.
 */
export function getExtension(path: string): string | null {
    const components = path.split('.');

    if (components.length < 2) return null;

    return components[components.length - 1].toLowerCase();
}

/** Map representing a mapping between language name to file extensions */
export const LanguageMap: Map<Language, string[]> = new Map([
    ['markup', ['md']],
    ['bash', ['sh']],
    ['clike', ['h']],
    ['nasm', ['S', 'asm']],
    ['c', ['c']],
    ['cpp', ['cpp']],
    ['css', ['css']],
    ['javascript', ['js']],
    ['java', ['java']],
    ['jsx', ['jsx']],
    ['coffeescript', []],
    ['actionscript', []],
    ['toml', ['toml']],
    ['css-extr', []],
    ['diff', []],
    ['git', []],
    ['go', ['go']],
    ['graphql', ['gql']],
    ['handlebars', []],
    ['haskell', ['hs']],
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
export function coerceExtensionToLanguage(extension: string): Language | null {
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
    go: LangIcons.SiGo,
    hs: LangIcons.SiHaskell,
    js: LangIcons.SiJavascript,
    java: LangIcons.SiJava,
    png: GrDocumentImage,
    jpeg: GrDocumentImage,
    jpg: GrDocumentImage,
    gif: GrDocumentImage,
    txt: GrDocumentTxt,
    pdf: GrDocumentPdf,
    md: LangIcons.SiMarkdown,
    ts: LangIcons.SiTypescript,
    py: LangIcons.SiPython,
    r: LangIcons.SiR,
    rs: LangIcons.SiRust,
    v: LangIcons.SiV,
    json: LangIcons.SiJson,
};
