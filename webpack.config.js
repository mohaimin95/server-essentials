/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production', // or 'development' for development mode
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()],
    entry: './index.ts', // entry file of your project
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs',

    },
    resolve: {
        extensions: ['.ts', '.js'], // resolve these extensions
        plugins: [
            new TsconfigPathsPlugin(), // resolve path aliases using tsconfig.json
        ],
    },
    module: {
        rules: [
            {
                test: /\.ts$/, // handle TypeScript files
                use: 'ts-loader', // use ts-loader for TypeScript compilation
                exclude: /node_modules/,
            },
        ],
    },
};
