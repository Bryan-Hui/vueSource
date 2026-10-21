export const emptyObject = Object.freeze({})

// 由于这些辅助函数的明确性和函数内联，它们在 JS 引擎中能生成更优的 VM 代码。
export function isUndef (v) {
  return v === undefined || v === null
}

export function isDef (v) {
  return v !== undefined && v !== null
}

export function isTrue (v) {
  return v === true
}

export function isFalse (v) {
  return v === false
}

/**
 * 检查值是否为原始类型。
 */
export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * 快速对象检查 - 主要用于在已知值是符合 JSON 类型的情况下，
 * 将对象与原始值区分开来。
 */
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * 获取值的原始类型字符串，例如 [object Object]。
 */
const _toString = Object.prototype.toString

export function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * 严格的对象类型检查。仅对纯 JavaScript 对象返回 true。
 */
export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

export function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * 检查 val 是否是有效的数组索引。
 */
export function isValidArrayIndex (val) {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

export function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * 将值转换为实际渲染的字符串。
 */
export function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * 将输入值转换为数字以便持久化。
 * 如果转换失败，返回原始字符串。
 */
export function toNumber (val) {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * 创建一个映射表并返回一个函数，用于检查键是否在该映射表中。
 */
export function makeMap (
  str,
  expectsLowerCase
) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * 检查标签是否为内置标签。
 */
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * 检查属性是否为保留属性。
 */
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * 从数组中移除一项。
 */
export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * 检查对象是否拥有该属性。
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * 为纯函数创建一个缓存版本。
 */
export function cached (fn) {
  const cache = Object.create(null)
  return (function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

/**
 * 将连字符分隔的字符串转换为驼峰式。
 */
const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * 将字符串首字母大写。
 */
export const capitalize = cached((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * 将驼峰式字符串转换为连字符分隔形式。
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str) => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * 为不支持 bind 的环境提供简单的 bind polyfill，
 * 例如 PhantomJS 1.x。从技术上讲，我们不再需要这个了，
 * 因为原生 bind 在大多数浏览器中已经足够高效。
 * 但移除它意味着会破坏那些能够在 PhantomJS 1.x 中运行的代码，
 * 所以必须保留以保证向后兼容性。
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

export const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind

/**
 * 将类数组对象转换为真正的数组。
 */
export function toArray (list, start) {
  start = start || 0
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * 将属性混合到目标对象中。
 */
export function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * 将对象数组合并为单个对象。
 */
export function toObject (arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * 不执行任何操作。
 * 为参数占位以使 Flow 满意，同时避免留下使用 ...rest 的无用转译代码
 * (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)。
 */
export function noop (a, b, c) {}

/**
 * 始终返回 false。
 */
export const no = (a, b, c) => false

/* eslint-enable no-unused-vars */

/**
 * 返回相同的值。
 */
export const identity = (_) => _

/**
 * 从编译器模块生成包含静态键的字符串。
 */
export function genStaticKeys (modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * 检查两个值是否松散相等 - 也就是说，
 * 如果它们是纯对象，它们是否具有相同的结构？
 */
export function looseEqual (a, b) {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * 返回数组中第一个与给定值松散相等的元素的索引
 * （如果值是纯对象，则数组必须包含相同结构的对象），
 * 如果不存在则返回 -1。
 */
export function looseIndexOf (arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * 确保函数只被调用一次。
 */
export function once (fn) {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}