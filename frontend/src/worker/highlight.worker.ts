import { tokenize } from '../lib/prismjs';
import normalizeTokens from '../lib/utils/normalizeTokens';
import { PrismToken, Token } from '../types/renderer';

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;

export interface HighlightMessage {
    code: string;
    grammar: Prism.Grammar;
    nonce: string;
}

export interface HighlightWorkerResult {
    tokens: Token[][];
    nonce: string;
}

ctx.addEventListener('message', (event: MessageEvent<HighlightMessage>) => {
    // @ts-ignore
    const mixedTokens = tokenize(event.data.code, event.data.grammar);
    const tokens = normalizeTokens(mixedTokens as unknown as (string | PrismToken)[]);

    ctx.postMessage({ tokens, nonce: event.data.nonce });
});
