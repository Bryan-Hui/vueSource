const path = require('path');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const flow = require('rollup-plugin-flow-no-whitespace');

const TARGET = process.env.TARGET || 'web-full-dev';

const resolvePath = _path => path.resolve(__dirname, '../', _path);

// 构建目标配置表
const builds = {
  // Web 平台完整版 - 开发版 (UMD)
  'web-full-dev': {
    entry: resolvePath('src/platforms/web/entry-runtime-with-compiler.js'),
    dest: resolvePath('dist/vue.js'),
    format: 'umd',
    env: 'development',
    name: 'Vue',
    banner: `/**
 * Vue.js v2.x.x
 * (c) 2014-${new Date().getFullYear()} Evan You
 * Released under the MIT License.
 */`
  },
  // Web 平台完整版 - 生产版 (UMD)
  'web-full-prod': {
    entry: resolvePath('src/platforms/web/entry-runtime-with-compiler.js'),
    dest: resolvePath('dist/vue.min.js'),
    format: 'umd',
    env: 'production',
    name: 'Vue',
    plugins: [
      require('@rollup/plugin-terser').default()
    ]
  },
  // Web 平台运行时版 - 开发版 (UMD)
  'web-runtime-dev': {
    entry: resolvePath('src/platforms/web/entry-runtime.js'),
    dest: resolvePath('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    name: 'Vue'
  },
  // Web 平台 ES Module 版
  'web-esm': {
    entry: resolvePath('src/platforms/web/entry-runtime-with-compiler.js'),
    dest: resolvePath('dist/vue.esm.js'),
    format: 'es',
    env: 'development'
  }
};

// 生成单个构建配置
function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    output: {
      file: opts.dest,
      format: opts.format,
      name: opts.name || 'Vue',
      exports: 'auto',
      banner: opts.banner || ''
    },
    plugins: [
      // 去掉 Flow 类型注解
      flow(),
      // 路径别名（Vue 2 源码大量使用）
      alias({
        entries: [
          { find: 'vue', replacement: resolvePath('src/platforms/web/entry-runtime-with-compiler.js') },
          { find: 'compiler', replacement: resolvePath('src/compiler') },
          { find: 'core', replacement: resolvePath('src/core') },
          { find: 'shared', replacement: resolvePath('src/shared') },
          { find: 'web', replacement: resolvePath('src/platforms/web') },
          { find: 'server', replacement: resolvePath('src/server') },
          { find: 'sfc', replacement: resolvePath('src/sfc') },
          { find: 'he', replacement: resolvePath('src/compiler/parser/html-entities.js') }
        ]
      }),
      // 替换环境变量
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(opts.env),
          __DEV__: opts.env === 'development' ? 'true' : 'false',
          __WEEX__: 'false',
          __VERSION__: JSON.stringify('2.x.x')
        }
      }),
      // 解析 node_modules
      resolve({
        browser: true,
        extensions: ['.js', '.json']
      }),
      // CommonJS 兼容
      commonjs()
    ].concat(opts.plugins || []),
    // 外部依赖（不打包进产物）
    external: opts.external || []
  };

  console.log(`[build] ${name} -> ${path.basename(opts.dest)} (${opts.format}, ${opts.env})`);
  return config;
}

// 支持多目标：TARGET=a,b,c
if (TARGET.includes(',')) {
  module.exports = TARGET.split(',').map(t => genConfig(t.trim()));
} else {
  module.exports = genConfig(TARGET);
}