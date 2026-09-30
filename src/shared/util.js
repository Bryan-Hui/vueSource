function cached(fn){
  const cache = Object.create(null);

  return (function(str){
    const hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}