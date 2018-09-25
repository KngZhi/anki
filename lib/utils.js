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

const getNullResults = (results, cards) => {
    const nullList = []
    results.forEach((result, idx) => {
        if (result === null) {
            nullList.push(idx)
        }
    })
    const resultList = []
    cards.forEach((card, idx) => {
        if (nullList.includes(idx)) {
            resultList.push(card)
        }
    })
    return resultList
}

const logResults = () => {

}

module.exports = {
    serialAsyncMap,
    getNullResults,
}
