import yaml from 'js-yaml'
import marked from 'marked'

// import highlight = require('highlight');
// marked.setOptions({
//     renderer: new marked.Renderer(),
//     highlight: function(code) {
//         return highlight.highlight(code)
//     },
//     gfm: true,
//     tables: true,
//     breaks: true
// });


import { createCloze } from './createModel'

const DASH = '---'

function fileParse(text: string) {
    const datalines = text.split('\n')
    const len = datalines.length

    let meta = {}
    const notes = []

    let i = 0
    while (i < len) {
        const line = datalines[i]

        if (i === 0 && line === DASH) {
            let j = i + 1
            let nextLine = datalines[j]
            let result = ''
            while (nextLine !== DASH) {
                result += nextLine + '\n'
                j++
                nextLine = datalines[j]
            }
            i = j

            const meta = yaml.load(result)
            if (!meta.deckName) {
                meta.deckName = 'Default'
            }

            if (!meta.deck) {
                meta.deck = 'Default'
            }
        }

        if (/^- /.test(line)) {
            const note = {
                front: [line.replace('-', '')],
                back: []
            }
            let j = i + 1
            let nextLine = datalines[j]
            while (!/^(-|(#{1,})) /.test(nextLine) && j < len) {
                note.back.push(nextLine)
                j++
                nextLine = datalines[j]
            }
            i = j - 1
            notes.push(note)
        }

        i++
    }

    let result = {
        meta,
        notes: notes
            .map(note => processLine(note, meta))
            .map(n => processNote(n, meta)),
    }


    return result.notes
}

function processLine(note, meta) {
    const { front, back } = note
    const { abbrs } = meta

    if (!abbrs) return note

    function abbrReplace(string) {
        const rx = /\[([^\]]+)]/g;

        // FIXME: if string has `const x = [1,2,3]` would cause error
        return string.replace(rx, (match, p1) => {
            return abbrs[p1] || match
        })
    }

    return {
        back: back.map(abbrReplace),
        front: front.map(abbrReplace),
    }
}

function markedFields(fields) {
    const result = fields
    Object.keys(result).forEach(key => {
        result[key] = marked(result[key].join('\n'));
    });
    return result
}

function processNote(note, meta) {
    const { front } = note
    let result = null

    if (/\{\{.*?\}\}/.test(front)) {
        result = {
            fields: markedFields(createCloze(note)),
            modelName: 'cloze'
        }
    } else {
        result = {
            fields: markedFields(note),
            modelName: 'keypoint'
        }
    }

    return {
        deckName: meta.deck || meta.deckName,
        tags: meta.tags,
        options: {
            allowDuplicate: false
        },
        ...result
    }
}

module.exports = fileParse
