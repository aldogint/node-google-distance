import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import replace from 'rollup-plugin-replace';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

let plugins = [
  babel(babelrc()),
  replace({
    POLYFILL_FETCH: process.env.POLYFILL_FETCH
      ? "const fetch = require('node-fetch')"
      : ''
  })
];

export default {
  entry: 'src/index.js',
  plugins: plugins,
  external: external,
  targets: [
    {
      dest: pkg.main,
      format: 'cjs',
      moduleName: 'rollupStarterProject',
      sourceMap: true
    },
    {
      dest: pkg.module,
      format: 'es',
      sourceMap: true
    }
  ]
};
