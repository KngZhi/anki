import yaml from 'js-yaml'
// import marked from 'marked'

import { createCloze } from './createModel'
import { Note, Fields, DeckName, Tag } from './../types'
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

interface Metadata {
    deck: DeckName;
    deckName: DeckName;
    tags: Array<Tag>;
    abbrs: Record<string, string>;
}

const DASH = '---'

function fileParse(text: string) {
    const lines: string[] = text.split('\n')
    const len = lines.length

    let meta: Metadata
    const notes = []

    let i = 0
    while (i < len) {
        const line = lines[i]

        if (i === 0 && line === DASH) {
            let j = i + 1
            let nextLine = lines[j]
            let result = ''
            while (nextLine !== DASH) {
                result += nextLine + '\n'
                j++
                nextLine = lines[j]
            }
            i = j

            meta = yaml.load(result) as Metadata
            if (!meta.deckName) {
                meta.deckName = 'Default'
            }

            if (!meta.deck) {
                meta.deck = 'Default'
            }
        }

        if (/^- /.test(line)) {
            const front = line.replace('-', '')
            const backlines: string[] = []
            let j = i + 1
            let nextLine = lines[j]
            while (!/^(-|(#{1,})) /.test(nextLine) && j < len) {
                backlines.push(nextLine)
                j++
                nextLine = lines[j]
            }
            i = j - 1
            notes.push({ front, back: backlines.join('\n')})
        }

        i++
    }

    return notes.map(n => processNote(n, meta))
}

// TODO: dealing with abbrs
// function processLine(fields: Fields, meta: Metadata) {
//     const { front, back } = fields
//     const { abbrs } = meta

//     if (!abbrs) return fields

//     function abbrReplace(string) {
//         const rx = /\[([^\]]+)]/g;

//         // FIXME: if string has `const x = [1,2,3]` would cause error
//         return string.replace(rx, (match, p1) => {
//             return abbrs[p1] || match
//         })
//     }

//     return {
//         back: back.map(abbrReplace),
//         front: front.map(abbrReplace),
//     }
// }

// function markedFields(fields: Fields): Fields {
//     const result = fields
//     Object.keys(result).forEach(key => {
//         result[key] = marked(result[key].join('\n'));
//     });
//     return result
// }

function processNote(fields: Fields, meta: Metadata): Note {
    const { front } = fields
    let result = null

    if (/\{\{.*?\}\}/.test(front)) {
        result = {
            fields: createCloze(fields),
            modelName: 'cloze'
        }
    } else {
        result = {
            fields,
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

export default fileParse

// module.exports = fileparse
