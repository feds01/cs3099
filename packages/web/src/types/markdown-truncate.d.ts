declare module 'markdown-truncate' {
    function index(inputString: string, options: { limit: number; ellipsis: boolean }): string;

    export = index;
}
