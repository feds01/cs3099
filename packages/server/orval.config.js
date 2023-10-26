module.exports = {
    'iamus-api': {
        output: {
            mode: 'tags-split',
            target: './../web/src/lib/api/iamus-api.ts',
            schemas: './../web/src/lib/api/models',
            client: 'react-query',
            mock: true,
            prettier: true,
            clean: ["!(*/custom-instance.ts)"],
            override: {
                mutator: {
                    path: './../web/src/lib/api/mutator/custom-instance.ts',
                    name: 'customInstance',
                },
            },
        },
        input: './swagger.yaml',
    },
};
