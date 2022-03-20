import theme from './theme';
import { Component, ReactNode } from 'react';
import normalizeTokens from '../../../lib/utils/normalizeTokens';
import themeToDict, { type ThemeDict } from '../../../lib/utils/themeToDict';

import type {
    Language,
    Token,
    LineInputProps,
    LineOutputProps,
    TokenInputProps,
    TokenOutputProps,
    RenderProps,
    PrismGrammar,
    PrismToken,
} from '../../../types/renderer';

import { languages as prismLanguages, tokenize, hooks as prismHooks } from 'prismjs';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-v';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-julia';
import 'prismjs/components/prism-core';

import { Box, CircularProgress } from '@mui/material';
import { HighlightWorkerResult } from '../../../worker/highlight.worker';
import { nanoid } from 'nanoid';
import { expr } from '../../../lib/utils/expr';

type Props = {
    language: Language;
    code: string;
    worker?: Worker;
    children: (props: RenderProps) => ReactNode;
};

interface HighlightState {
    loading: boolean;
    tokens: Token[][];
    nonce: string;
}

class Highlight extends Component<Props, HighlightState> {
    themeDict: ThemeDict;
    worker?: Worker;

    constructor(props: Props) {
        super(props);

        const grammar = prismLanguages[this.props.language];

        const tokens = expr(() => {
            if (typeof grammar === 'undefined') {
                return normalizeTokens([this.props.code] as unknown as (string | PrismToken)[]);
            } else {
                return [];
            }
        });

        this.state = {
            loading: tokens.length === 0,
            tokens,
            nonce: nanoid(),
        };

        // Assign the worker to the running instance
        this.worker = props.worker;

        // Create the theme...
        this.themeDict = themeToDict(theme, this.props.language);

        this.getLineProps = this.getLineProps.bind(this);
        this.getTokenProps = this.getTokenProps.bind(this);
        this.getStyleForToken = this.getStyleForToken.bind(this);
        this.handleWorkerError = this.handleWorkerError.bind(this);
        this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
    }

    componentDidMount() {
        const grammar = prismLanguages[this.props.language];

        if (typeof this.worker !== 'undefined' && typeof grammar !== 'undefined') {
            this.worker.addEventListener('message', this.handleWorkerMessage);
            this.worker.addEventListener('error', this.handleWorkerError);

            this.worker.postMessage({ code: this.props.code, grammar, nonce: this.state.nonce });
        } else if (typeof grammar !== 'undefined') {
            const mixedTokens = grammar !== undefined ? this.tokenize(this.props.code, grammar) : [this.props.code];

            const tokens = normalizeTokens(mixedTokens as unknown as (string | PrismToken)[]);

            this.setState({
                loading: false,
                tokens,
            });
        }
    }

    componentWillUnmount() {
        if (typeof this.worker !== 'undefined') {
            this.worker.removeEventListener('message', this.handleWorkerMessage);
            this.worker.removeEventListener('error', this.handleWorkerError);
        }
    }

    handleWorkerMessage(event: MessageEvent<HighlightWorkerResult>) {
        if (event.data.nonce !== this.state.nonce) return;

        const { tokens } = event.data;

        this.setState({
            loading: false,
            tokens,
        });
    }

    handleWorkerError(event: ErrorEvent) {
        console.log(event);
    }

    getLineProps = ({ key, className, style, line, ...rest }: LineInputProps): LineOutputProps => {
        const output: LineOutputProps = {
            ...rest,
            className: 'token-line',
            style: undefined,
            key: undefined,
        };

        if (style !== undefined) {
            output.style = output.style !== undefined ? { ...output.style, ...style } : style;
        }

        if (key !== undefined) output.key = key;
        if (className) output.className += ` ${className}`;

        return output;
    };

    getStyleForToken = ({ types, empty }: Token) => {
        const typesSize = types.length;

        if (typesSize === 1 && types[0] === 'plain') {
            return empty ? { display: 'inline-block' } : undefined;
        } else if (typesSize === 1 && !empty) {
            return this.themeDict[types[0]];
        }

        const baseStyle = empty ? { display: 'inline-block' } : {};
        const typeStyles = types.map((type) => this.themeDict[type]);

        return Object.assign(baseStyle, ...typeStyles);
    };

    getTokenProps = ({ key, style, token, ...rest }: TokenInputProps): TokenOutputProps => {
        const output: TokenOutputProps = {
            ...rest,
            children: token.content,
            style: this.getStyleForToken(token),
            key: undefined,
        };

        if (typeof style !== 'undefined') {
            output.style = output.style !== undefined ? { ...output.style, ...style } : style;
        }

        if (key !== undefined) output.key = key;

        return output;
    };

    tokenize = (code: string, grammar: PrismGrammar): Array<Prism.Token | string> => {
        const env = {
            code,
            grammar,
            tokens: [] as (string | Prism.Token)[],
        };

        prismHooks.run('before-tokenize', env);
        const tokens = (env.tokens = tokenize(env.code, env.grammar));
        prismHooks.run('after-tokenize', env);

        return tokens;
    };

    render() {
        const { children } = this.props;
        const { tokens, loading } = this.state;

        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            );
        }

        return children({
            tokens,
            style: this.themeDict.root,
            getLineProps: this.getLineProps,
            getTokenProps: this.getTokenProps,
        });
    }
}

export default Highlight;
