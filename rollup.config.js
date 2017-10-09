import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import replace from 'rollup-plugin-replace';
let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

let plugins = [
  replace({
    POLYFILL_FETCH: process.env.polyfill
      ? "const fetch = require('node-fetch')"
      : ''
  })
];

const targets = [{
    dest: pkg.main,
    format: 'cjs',
    moduleName: 'rollupStarterProject',
    sourceMap: true
}];

if (process.env.babel){
  plugins.push(babel(babelrc()));
} else {
  // it will never make sense to babel an es6 module... to es5.
  targets.push({
    dest: pkg.module,
    format: 'es',
    sourceMap: true
  });
}

export default {
  entry: 'src/index.js',
  plugins: plugins,
  external: external,
  targets
};
