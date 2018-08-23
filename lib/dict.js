const API_KEY = 'e6178e8a-9501-4ccc-9b9e-da39171998e1'
const { CollegiateDictionary, WordNotFoundError } = require('mw-dict')
const dict = new CollegiateDictionary(API_KEY)

const is = {
  empty: (item) => item === '',
  notEmpty: (item) => !is.empty(item),
  arr: (arr) => Array.isArray(arr) && arr.length,
}

/**
 * @param {String} query 查询的单词
 * @returns {Object} 返回结果中取第一项[0]
 * @example
 * "invariant" => {
 *   "word": "invariant",
    "functional_label": "adjective",
    "pronunciation": [
      "http://media.merriam-webster.com/soundc11/i/invari05.wav"
    ],
    "etymology": "",
    "definition": [
      {
        "meanings": [
          ": ",
          "specifically",
          ": unchanged by specified mathematical or physical operations or transformations "
        ],
        "synonyms": [
          "constant",
          "unchanging"
        ],
        "illustrations": [
          "invariant factor"
        ],
        "senses": []
      }
    ]
  }
 */

async function lookUp(query) {
  try {
    let res = await dict.lookup(query)
    // 返回值可能是多个数组对象，默认取第一个
    // proximity -> [{ word: 'proximity' }, { word: 'proximity fuse' }]
    if (!is.arr(res[0].definition)) {
      return { word: query, definition: [], flag: true }
    }
    return res[0]
  } catch (err) {
    if (err instanceof WordNotFoundError) {
      return { word: query, definition: [], flag: true }
    }
  }
}

/**
 * @desc derive the keyword which next to symbol # or contained by `[]`
 * @param {string} sentence given sentence with Signal
 * @returns {string}
 */
function deriveWord(sentence) {
  let words = sentence.match(/`(.*?)`/g) || ['NOSIGNAL']
  // const reg = /`(.*?)`/g
  // let words = reg.exec(sentence) || ['NOSIGNAL']
  if (words.length) {
    words = words.map(word => word.replace(/`/g, ''))
  }
  return words;
}


// ListOfObject -> ListOfString
// interp. retrieve all meaning of given array
function retrieveMeanings(loo) {
  if (!is.arr(loo)) return [];
  const [first, ...rest] = loo
  let { meanings, senses } = first
  if (is.arr(senses)) {
    return retrieveMeanings(senses)
  }
  // : xxx -> xxx

  // Meanings -> String
  meanings = meanings
    .map(meaning => meaning.replace(/:/g, '').trim())
    .join()
  return [meanings, ...retrieveMeanings(rest)]
}


module.exports = {
  lookUp,
  deriveWord,
  retrieveMeanings,
}