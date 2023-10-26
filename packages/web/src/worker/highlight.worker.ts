import { tokenize } from '../lib/prismjs';
import normalizeTokens from '../lib/utils/normalizeTokens';
import { PrismToken, Token } from '../types/renderer';
import type Prism from 'prismjs';

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;

/**
 * This type represents messages that are sent from requesters for
 * code to be highlighted. A requester should send the contents, the
 * desired grammar and a nonce.
 *
 * The nonce is an important ID that is used to differentiate between
 * requests since multiple requesters maybe relying on the same worker
 * instance to perform highlighting jobs. So, they all register event
 * listeners on the worker and wait for their turn to be highlighted.
 * However, this is problematic because it might not be their source
 * that is being highlighted. To solve this problem, requesters send
 * a unique nonce and ignore messages that don't have the same nonce
 * as their initial request.
 */
export interface HighlightMessage {
    /** The contents that are to be highlighted */
    code: string;
    /** The grammar to use when highlighting a source */
    grammar: Prism.Grammar;
    /** Unique request ID */
    nonce: string;
}

/** Data that is returned from the worker */
export interface HighlightWorkerResult {
    /** Generated tokens */
    tokens: Token[][];
    /** Unique request ID */
    nonce: string;
}

/**
 * This is the worker handler, in here we essentially wait for messages that come from
 * the @see CodeRenderer component or any other syntax highlighting service to send
 * some source to be rendered with an included grammar and unique identifying string
 * per highlight request.
 *
 * The worker will tokenise the input, and convert the tokens into a readable format and
 * finally return the generated tokens with the nonce.
 */
ctx.addEventListener('message', (event: MessageEvent<HighlightMessage>) => {
    // @ts-ignore
    const mixedTokens = tokenize(event.data.code, event.data.grammar);
    const tokens = normalizeTokens(mixedTokens as unknown as (string | PrismToken)[]);

    ctx.postMessage({ tokens, nonce: event.data.nonce });
});
