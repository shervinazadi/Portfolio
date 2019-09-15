module.exports = {
    resolve: {
        alias: {
        'three-examples': path.join(__dirname, './node_modules/three/examples/js')
        },
    },
    module: {
        rules: [
        {
            test: /three\/examples\/js/,
            use: 'imports-loader?THREE=three'
        },
        ]
    }
};