module.exports = {
    'iamus-api': {
        output: {
            mode: 'tags-split',
            target: './frontend/src/lib/api/iamus-api.ts',
            schemas: './frontend/src/lib/api/models',
            client: 'react-query',
            mock: true,
            override: {
                mutator: {
                    path: './frontend/src/lib/api/mutator/custom-instance.ts',
                    name: 'customInstance',
                    // default: true
                },
            },
        },
        input: './swagger.yaml',
    },
};
