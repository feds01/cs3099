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
import 'prismjs/components/prism-nasm';
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

import { HighlightWorkerResult } from '../../../worker/highlight.worker';
import { nanoid } from 'nanoid';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** This is a type that represents all of the parameters passed to the renderer */
type PrismRendererProps = {
    /** Which language should the renderer use to tokenise the input */
    language: Language;
    /** The contents of source that are to be highlighted */
    code: string;
    /** Whether or not the renderer should use a Web worker */
    worker?: Worker;
    /** Function that is passed for rendering the highlighted lines */
    children: (props: RenderProps) => ReactNode;
};

/** Type representing the state of the component */
interface HighlightState {
    /** Whether the component has highlighted the source */
    hasHighlighted: boolean;
    /** Whether the component is visible in the view port */
    isVisible: boolean;
    /** Whether the component is an erroneous state */
    isError: boolean;
    /** What language grammar the renderer should use */
    grammar?: PrismGrammar;
    /** The tokens that are generated when building the tokens */
    tokens: Token[][];
    /** Unique identifier that's used when interacting with web worker.
     * See :WebWorkerMessages for more details.
     */
    nonce: string;
}

/** High order wrapper class around the code rendering process */
class PrismRenderer extends Component<PrismRendererProps, HighlightState> {
    /** The theme dictionary to use when highlighting the source */
    themeDict: ThemeDict;
    /** Whether the component has an associated worker with the job */
    worker?: Worker;

    rendererRef: React.RefObject<HTMLPreElement>;

    observer: IntersectionObserver;

    constructor(props: PrismRendererProps) {
        super(props);
        const tokens = normalizeTokens([this.props.code] as unknown as (string | PrismToken)[]);

        this.rendererRef = React.createRef();
        const grammar = prismLanguages[this.props.language];

        this.state = {
            hasHighlighted: typeof grammar === 'undefined',
            isVisible: false,
            isError: false,
            tokens,
            grammar,
            nonce: nanoid(),
        };

        this.highlight = this.highlight.bind(this);
        this.getLineProps = this.getLineProps.bind(this);
        this.getTokenProps = this.getTokenProps.bind(this);
        this.getStyleForToken = this.getStyleForToken.bind(this);
        this.handleWorkerError = this.handleWorkerError.bind(this);
        this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
        this.handleIntersectionChange = this.handleIntersectionChange.bind(this);

        this.worker = props.worker;
        this.observer = new IntersectionObserver(this.handleIntersectionChange, {
            root: null,
            rootMargin: '0px',
            threshold: 0.01,
        });
        this.themeDict = themeToDict(theme, this.props.language);
    }

    componentDidMount() {
        if (typeof this.state.grammar !== 'undefined') {
            if (typeof this.worker !== 'undefined') {
                this.worker.addEventListener('message', this.handleWorkerMessage);
                this.worker.addEventListener('error', this.handleWorkerError);
            }
        }

        if (this.rendererRef && this.rendererRef.current !== null) {
            this.observer.observe(this.rendererRef.current);
        }
    }

    /**
     * React component life cycle function that is called when the component re-renders.
     * User this fact to schedule a 'highlight' operation onto the component if it is
     * visible in the DOM and it hasn't already highlighted the code.
     */
    componentDidUpdate() {
        if (this.state.isVisible && !this.state.hasHighlighted) {
            this.highlight();
        }
    }

    /**
     * Component clean up function, this will disconnect the component from the web worker
     * if one is registered and it will disconnect the intersection observer.
     */
    componentWillUnmount() {
        if (typeof this.worker !== 'undefined') {
            this.worker.removeEventListener('message', this.handleWorkerMessage);
            this.worker.removeEventListener('error', this.handleWorkerError);
        }

        // Cleanup the observer instance
        this.observer.disconnect();
    }

    /**
     * Function to perform a highlighting operation. In the case of a web worker, we send a message
     * to the worker to perform the operation and then use the worker message handler @see handleWorkerMessage
     * to then set the tokens and the `isHighlighted` flag to true.
     */
    highlight() {
        const { grammar } = this.state;

        if (typeof grammar !== 'undefined') {
            if (typeof this.worker !== 'undefined') {
                this.worker.postMessage({ code: this.props.code, grammar, nonce: this.state.nonce });
            } else {
                const mixedTokens = this.tokenize(this.props.code, grammar);
                const tokens = normalizeTokens(mixedTokens as unknown as (string | PrismToken)[]);

                this.setState({
                    tokens,
                    hasHighlighted: true,
                });
            }
        }
    }

    /**
     * This is a handler for working with updates from the intersection observer
     * to check if the element has entered the viewport. When the element is visible,
     * this function will set the 'isVisible' flag in the state and when the component
     * updates to isVisible, then it will begin the code highlighting process.
     *
     * @param entries - The entries that the observer has observed to be in the view port.
     */
    handleIntersectionChange(entries: IntersectionObserverEntry[]) {
        if (entries.length === 1) {
            const entry = entries[0];

            // Once we have observed the element being in view, we can set the 'isVisible' flag
            // to true and then simply just unobserve the element and finish
            if (entry.isIntersecting && !this.state.isVisible) {
                this.observer.unobserve(entry.target);

                this.setState({
                    isVisible: true,
                });
            }
        }
    }

    /**
     * Handle any messages that the worker sends. This might be events
     * from other @see PrismRenderer components, so we have to check the
     * nonce field that the worker sends to check that this message was
     * intended for us, otherwise we can ignore the message.
     *
     * @param event - The event message that the worker sends to the component
     */
    handleWorkerMessage(event: MessageEvent<HighlightWorkerResult>) {
        if (event.data.nonce !== this.state.nonce) return;

        const { tokens } = event.data;

        this.setState({
            hasHighlighted: true,
            tokens,
        });
    }

    /**
     * Simple handler for errors occurring when using a worker, in this event
     * we set the 'error' view to report that we failed to load this content.
     */
    handleWorkerError(event: ErrorEvent) {
        console.log(event);

        this.setState({ isError: true });
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
        const { tokens, isError } = this.state;

        if (isError) {
            return (
                <Box>
                    <Typography sx={{ fontWeight: 'bold' }} variant="body1">
                        Failed to load content.
                    </Typography>
                </Box>
            );
        }

        return children({
            tokens,
            ref: this.rendererRef,
            style: this.themeDict.root,
            getLineProps: this.getLineProps,
            getTokenProps: this.getTokenProps,
        });
    }
}

export default PrismRenderer;
