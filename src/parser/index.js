const yaml = require('js-yaml');
const marked = require("marked");
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code) {
        return require("highlight.js").highlightAuto(code).value;
    },
    gfm: true,
    tables: true,
    breaks: true
});


const { createCloze } = require('./createModel')

const DASH = '---'

function fileParse(text) {
    const datalines = text.split('\n')
    const len = datalines.length

    let meta = {}
    let notes = []

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

            meta = yaml.safeLoad(result)
        }

        if (/^- /.test(line)) {
            const note = {
                front: [line.replace('-', '')],
                back: []
            }
            let j = i + 1
            let nextLine = datalines[j]
            while (!/^- /.test(nextLine) && j < len) {
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
            .map(note => processLine(note, meta.terms))
            .map(n => processNote(n, meta)),
    }


    return result.notes
}

// TODO: processLine and repalce Terms
function processLine(note, terms) {
    const { front, back } = note
    let Ts = Object.keys(terms).map(term => `[${term}]`)
    return {
        back,
        front,
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
    const { front, back } = note
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
        deckName: meta.deck,
        tags: meta.tags,
        options: {
            allowDuplicate: false
        },
        ...result
    }
}

module.exports = fileParse
