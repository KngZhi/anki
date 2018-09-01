#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const program = require('commander')
const marked = require('marked')
const pkg = require('./package.json')
const flow = require('lodash/flow')
const { getWords } = require('./lib/dict')
const clozeWords = require('./lib/cloze')
const { addNotes, } = require('./lib/ankiConnect')

const createMdCards = flow(
  contents => contents.split('\n===\n'),
  cards => cards.map(card => card.split('\n---\n')),
  cards => cards.map(card => card.map(filed => marked(filed).replace(/\n/g, ''))),
  cards => cards.map(card => card.join('\t')),
  cards => cards.join('\n'),
)


const createDoubleCard = (tasks) => {
  const newTasks = []
  tasks.forEach(task => {
    const words = getWords(task.name)
    words.forEach(word => newTasks.push({word, sentence: task.name, note: task.note}))
  })

  const cards = newTasks.map(task => ({
    deckName: 'big-bang',
    modelName: 'double',
    fields: {
      word: task.word,
      sentence: task.sentence,
      meaning: task.note,
    },
    tags: [],
  }))
  return cards
}

const createKeyPointCards = (tasks, deckName, modelName) => {
  const cards = tasks.map(task => ({
    deckName,
    modelName,
    fields: {
      question: marked(task.name),
      answer: marked(task.note),
    },
    tags: [],
  }))
  return cards
}


program
  .version(pkg.version)
  .description(pkg.description)
  .usage('[options] <command> [..]')

/**
 * @description
 * @argument {String} projectName the project name of omni which you want create note
 * @argument {String} modelName   anki-note type
 */
program
  .command('OmniFocus-word')
  .alias('word')
  .description('create notes directly from OmniFocus project')
  .action(() => {
    const file = path.resolve(__dirname, `./lib/jxa-omni.js word`)
    exec(file, async (err, stdout, stderr) => {
      if (err) throw err
      const result = JSON.parse(stdout)
      const cards = createDoubleCard(result)
      const res = await addNotes(cards)
      console.log(res)
    })
  })

program
  .command('erratum')
  .alias('err')
  .description('create notes directly from erratum file')
  .action(() => {
    // cat 08-22.md | aspell pipe --encoding utf-8 | pcregrep -o1 "^.*: (.*?)," | uniq > ~/Desktop/erratum | code ~/Desktop/erratum
    fs.readFile('/Users/KZhi/Desktop/erratum', 'utf8', async (err, data) => {
      const erratum = clozeWords(data)
      const cards = erratum.map(item => ({
        deckName: 'erratum',
        modelName: 'erratum',
        fields: {
          word: item.word,
          meaning: item.meaning,
          cloze: item.cloze,
        },
        tags: [],
      }))
      const res = await addNotes(cards)
      console.log(res)
    })
  })

program
  .command('OmniFocus-big-bang')
  .alias('b2')
  .description('create notes from OmniFocus know project')
  .action(() => {
    const projectName = 'big-bang'
    const file = path.resolve(__dirname, `./lib/jxa-omni.js ${projectName}` )
    exec(file, async (err, stdout, stderr) => {
      if (err) throw err
      const result = JSON.parse(stdout)
      const cards = createKeyPointCards(result, projectName, 'keypoint')
      const res = await addNotes(cards)
      console.log(res)
    })
  })

program.parse(process.argv)

if (!program.args.filter(arg => typeof arg === 'object').length) {
  program.help()
}