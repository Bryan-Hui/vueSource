// const config =  process.env.NODE_ENV
const path = require('path')
const alias = require('@rollup/plugin-alias')

const target = process.env.TARGET
const resolvePath = (_path) => path.resolve(__dirname, '../', _path)

console.log('target ',target)




const builds = {
  'web-full-dev': {
    entry: 'src/platforms/web/entry-runtime-with-compiler.js',
    dest: 'dist/vue.js',
    format: 'umd',
    banner: ''
  }
}


function getConfig(name){
  const build = builds[name]

  return {
    input: resolvePath(build.entry),
    output: {
      file: build.dest,
      format: build.format,
      name: 'Vue',
      banner: build.banner
    }
  }
}



module.exports = getConfig(target)