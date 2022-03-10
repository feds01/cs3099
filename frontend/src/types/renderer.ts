import type { Key } from 'react';

export type Language = string;

export type PrismGrammar = {
    [key: string]: any;
};

type LanguagesDict = {
    [lang: Language]: PrismGrammar;
};

export type PrismToken = {
    type: string | string[];
    alias: string | string[];
    content: Array<PrismToken | string> | string;
};

export type Token = {
    types: string[];
    content: string;
    empty?: boolean;
};

export type PrismLib = {
    languages: LanguagesDict;
    tokenize: (code: string, grammar: PrismGrammar, language: Language) => Array<PrismToken | string>;
    highlight: (code: string, grammar: PrismGrammar, language: Language) => string;
    hooks: {
        run: (name: string, env: { code: string; grammar: PrismGrammar; language: Language }) => void;
    };
};

export type StyleObj = {
    [key: string]: string | number | null;
};

export type LineInputProps = {
    key?: Key;
    style?: StyleObj;
    className?: string;
    line: Token[];
    [key: string]: any;
};

export type LineOutputProps = {
    key?: Key;
    style?: StyleObj;
    className: string;
    [key: string]: any;
};

export type TokenInputProps = {
    key?: Key;
    style?: StyleObj;
    className?: string;
    token: Token;
    [key: string]: any;
};

export type TokenOutputProps = {
    key?: Key;
    style?: StyleObj;
    children: string;
    [key: string]: any;
};

export type RenderProps = {
    tokens: Token[][];
    style?: StyleObj;
    getLineProps: (input: LineInputProps) => LineOutputProps;
    getTokenProps: (input: TokenInputProps) => TokenOutputProps;
};

// export interface PrismThemeEntry {
//   color?: string,
//   backgroundColor?: string,
//   fontStyle?: "normal" | "italic",
//   fontWeight?:
//     | "normal"
//     | "bold"
//     | "100"
//     | "200"
//     | "300"
//     | "400"
//     | "500"
//     | "600"
//     | "700"
//     | "800"
//     | "900",
//   textDecorationLine?:
//     | "none"
//     | "underline"
//     | "line-through"
//     | "underline line-through",
//   opacity?: number,
//   [styleKey: string]: string | number,
// };
export type PrismThemeEntry = {};

export type PrismTheme = {
    plain: PrismThemeEntry;
    styles: Array<{
        types: string[];
        style: PrismThemeEntry;
        languages?: Language[];
    }>;
};
