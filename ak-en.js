'use strict'
const fs = require('fs')
const flow = require('lodash/flow')

const serialAsyncMap = require('./lib/utils')
const lookUp = require('./lib/dict')

const is = {
  empty: (item) => item === '',
  notEmpty: (item) => !is.empty(item),
  arr: (arr) => Array.isArray(arr) && arr.length,
  satisfy: (str) => str.includes('#') || str.includes('[')
}

const to = {
  json: (item) => JSON.stringify(item, null, 2),
  string: (obj, separate = '\t') => {
    let res = []
    for (const property of obj) {
      res.push(property)
    }
    return res.join(separate)
  }
}

const log = (item) => console.log(item)
const logJson = flow([to.json, log])

// interp.
// and conjunction with ;
/**
 * @desc derive the keyword which next to symbol # or contained by `[]`
 * @param {string} sentence given sentence with Signal
 * @returns {Object} { word, sentence }
 */
function deriveWord(sentence) {
  const WORD_POSITION = 1
  let word = is.satisfy(sentence)
    // 前置标识符为 # 或被 [] 包裹
    ? (sentence.match(/#([\w|-]+)/) || sentence.match(/\[(.*)\]/))[WORD_POSITION]
    : 'NOSIGNAL'
  // return `${word};${sentence};\n`
  return { word, sentence, }
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

async function main(inputFile, outFile) {
  // !!! readFile
  const sentences = fs.readFileSync(inputFile, 'utf8')
    .trim()
    .split('\n')

  //  retrieveWord
  let data = sentences
    .filter(is.notEmpty)
    .map(deriveWord)      // [{word, sentence } , {word, sentence } ]
  const wordList = data.map(item => item.word) // [ListOfWord: String]

  const requestList = await serialAsyncMap(wordList, lookUp)
  // query meanings
  let explainLists = requestList
    .map(item => item.definition) // ListOfArray
    .map(item => is.arr(item) ? retrieveMeanings(item) : ['WordNotFound']) // ListOfString

  let errorList = requestList.filter(item => item.flag)

  data = data.map((val, idx) => {
    return {
      ...val,
      sense: explainLists[idx].join('/n,'),
    }
  })
  logJson(data)

  // convert to anki format, use '\t' to separate
  data = data.map(item => `${item.word}\t${item.sense}\t${item.sentence}`).join('\n')

  // !!! write files
  fs.writeFileSync(outFile, data, (err) => {
    if (err) throw err;
  })
}

const INPUT_FIle = './words.txt'
const OUTPUT_FILE = './output.txt'

main(INPUT_FIle, OUTPUT_FILE)

module.exports = {
  deriveWord,
  retrieveMeanings
}