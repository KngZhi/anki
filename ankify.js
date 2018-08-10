#!/usr/bin/env node
const fs = require('fs')
const program = require('commander')
const marked = require('marked')
const pkg = require('./package.json')
const flow = require('lodash/flow')
const formatOmniToMd = require('./lib/format')
const path = process.argv[2] || './input.md'
const { deriveWord } = require('./lib/dict')

const createCards = flow(
  contents => contents.split('\n===\n'),
  cards => cards.map(card => card.split('\n---\n')),
  cards => cards.map(card => card.map(filed => marked(filed).replace(/\n/g, ''))),
  cards => cards.map(card => card.join('\t')),
  cards => cards.join('\n'),
)


fs.stat(path, (err, stats) => {
  if (err) throw err;

})

const file = fs.readFileSync(path).toString()
// const content = formatOmniToMd(file).join('')
// fs.writeFileSync('./output.md', content, (err) => {
//   if (err) throw err;
// })
const cards = createCards(fs.readFileSync('./output.md').toString())
fs.writeFileSync('/Users/KZhi/Desktop/output.txt', cards, (err) => {
  if (err) throw err;
})

// String -> .JSON
function convertToJSON(path) {
  const file = fs.readFileSync(path).toString()
  const json = file.split('\n').map(sentence => ({
    word: deriveWord(sentence),
    sentence,
    definition: '',
  }))
  fs.writeFileSync('./data.json', JSON.stringify(json, null, 2))
}

// convertToJSON('./input.md')

const exec = require('child_process').exec
exec('./lib/jxa-omni.js word', (err, stdout, stderr) => {
  console.log(stdout)
})

// JSON -> anki type

// output