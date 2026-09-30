// const config =  process.env.NODE_ENV
const path = require('path')
const alias = require('@rollup/plugin-alias')

const target = process.env.TARGET
const resolvePath = (_path) => path.resolve(__dirname, '../', _path)
const aliases = require('./alias')
const version = require('../package.json').version
const banner =
  '/*!\n' +
  ` * Vue.js v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
  ' * Released under the MIT License.\n' +
  ' */'


// const p1 = path.resolve('b')
// console.log('p1 == ',path.join('a','b','../c'))


const resolve = p => {
  const base = p.split('/')[0]
  if(aliases[base]){
    return path.resolve(aliases[base], p.slice(base.length + 1))
  }else{
    return path.resolve(__dirname, '../', p)
  }
}


const builds = {
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  }
}


function getConfig(name){
  const opts = builds[name]

  return {
    input: opts.entry,
    plugins: [alias(Object.assign({}, aliases, opts.alias))].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      name: 'Vue',
      banner: opts.banner
    }
  }
}



module.exports = getConfig(target)