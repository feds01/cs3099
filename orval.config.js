module.exports = {
    'iamus-api': {
        output: {
            mode: 'tags-split',
            target: './frontend/src/lib/api/iamus-api.ts',
            schemas: './frontend/src/lib/api/models',
            client: 'react-query',
            mock: true,
        },
        input: './swagger.yaml',
    },
};
