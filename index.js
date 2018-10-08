#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const program = require('commander')
const marked = require('marked')
const chalk = require('chalk')
const { dump } = require('dumper.js')

const pkg = require('./package.json')
const log = console.log
const { createTaskByWords } = require('./lib/dict')
const clozeWords = require('./lib/cloze')
const { addNotes, } = require('./lib/anki-sdk')
const { getTasks } = require('./lib/omni-sdk')
const { fileParse } = require('./lib/taskpaper')
const { getNullResults } = require('./lib/utils')
const { askReCreate } = require('./lib/inquire')


// TODO: 应该在创建卡片完毕之后完成任务
const createWordCards = (tasks, modelName, deckName) => {
  const cards = tasks.map(task => {
    const { name, note, tags } = task
    let word
    if (!name.match(/`(.*)`/)) {
        word = name
    } else {
        word = name.match(/`(.*)`/)[1]
    }
    try {
      if (!word) {
        throw Error(`This sentence doesn't have a word to create card: ${name}`)
      }
      return {
        tags,
        deckName,
        modelName,
        fields: {
          word,
          sentence: marked(name),
          meaning: marked(note),
        },
      }
    } catch (error) {
      console.error(error)

    }
  })
  return cards
}


const createKeyPointCards = (tasks, deckName, ) => {
  const cards = tasks.map(task => ({
    deckName,
    modelName: 'keypoint',
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

program
  .command('pre-word')
  .alias('pre')
  .description('create text for further use')
  .action(async () => {
    const result = await getTasks('word')
    const preNotes = createTaskByWords(result).map(task => {
      let { word, sentence } = task
      sentence = sentence.replace(/`/g, '').replace(word, `\`${word}\``)
      return `- ${sentence}\n  \n`
    }).join('\n')
    const filepath = path.resolve(process.cwd(), 'word.md')
    fs.writeFile(filepath, preNotes, () => exec(`code ${filepath}`))
  })

/**
 * @description
 * @argument {String} projectName the project name of omni which you want create note
 * @argument {String} modelName   anki-note type
 */
program
  .command('OmniFocus-word [type] [deckName]')
  .alias('word')
  .description('create notes directly from OmniFocus project')
  .action(async (modelName = 'single', deckName = 'erratum') => {
    const result = await getTasks('word')
    const cards = createWordCards(result, modelName, deckName)
    const res = await addNotes(cards)
    console.log(res);

    if (res.filter(card => card !== null).length) {
        log(chalk.green.bold(`Cards created in deck: ${deckName} by type: ${modelName}`))
    } else {
        log(chalk.red('Something goes wrong, please check the code or OmniFocus!'))
    }
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
      exec('rm /Users/KZhi/Desktop/erratum', async (err, stdout) => {
        if (err) throw err
        console.log('delete success')
      })
    })
  })

program
    .command('file <filename> [deckName] [modelName]')
    .description('create notes directly from erratum file')
    .action((filename, deckName = 'test', modelName = 'single') => {
        const filepath = path.resolve(process.cwd(), filename)
        fs.readFile(filepath, 'utf8', async (err, data) => {
            const result = fileParse(data)
            const cards = createWordCards(result, modelName, deckName)
            const res = await addNotes(cards)
            const nullResult = getNullResults(res, cards)
            if (nullResult.length) {
                const result = await askReCreate()
                if (result.answer === 'y') {
                    const newResult = nullResult.map((item, idx) => {
                        item.fields.word += '_'
                        item.tags.push('dp')
                        return item
                    })
                    await addNotes(newResult)
                }
            }
            console.log(res)
        })
    })


program
  .command('OmniFocus-big-bang')
  .alias('b2')
  .description('create notes from OmniFocus know project')
  .action(async () => {
    const projectName = 'big-bang'
    const result = await getTasks(projectName)
    const cards = createKeyPointCards(result, projectName,)
    const res = await addNotes(cards)
    console.log(res)
  })

program
    .command('toefl')
    .description('create Anki notes from OmniFocus tofel project')
    .action(async () => {
        const projectName = 'toefl'
        const result = await getTasks(projectName)
        const cards = createKeyPointCards(result, projectName)
        const res = await addNotes(cards)
        console.log(res)
    })

program.parse(process.argv)

if (!program.args.filter(arg => typeof arg === 'object').length) {
  program.help()
}
