/**
 * @description 批量异步请求
 * @param {Array} array
 * @param {Function} fn
 */
async function serialAsyncMap(collection, fn) {
  let result = [];

  for (let item of collection) {
    result.push(await fn(item));
  }

  return result;
}

module.exports = serialAsyncMap