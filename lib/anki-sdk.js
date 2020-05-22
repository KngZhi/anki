const axios = require('axios')
const async = require('async')

/**
 * [resource]: https://foosoft.net/projects/anki-connect/index.html#graphical
 */

function ankiConnectInvoke({ action, version, params = {} }) {
    return axios.request({
        url: 'http://127.0.0.1:8765',
        method: 'post',
        data: { action, version, params },
        contentType: 'application/x-www-form-urlencoded'
    })
        .then(res => res.data)
        .catch(err => console.log(err))
}

// Deck Operation

async function changeDeck(cards, deck) {
    try {
        const res = await ankiConnectInvoke({
            "action": "changeDeck",
            "version": 6,
            "params": {
                cards,
                deck
            }
        })
        const { result, error } = res

        console.log(result, error)
        return
        if (error) {
            console.error('something is wrong', error)
            return;
        }
        console.log(`Target Deck is *${deck}*, and move ${result.length} cards`)
        return result
    } catch (error) {
        console.error('this note is wrong: ', cards)
        throw error
    }
}

/**
 *
 * @param {Array} notes
 * @description You MUST specifies tags property, otherwise the note will note
 *              be created.
 *              NOTICE:
 *                - Tags must be specified
 *                - The note which you want create must not be empty, you can check
 *                  by use anki empty card
 *                - the fields of card, especially front and back should has string,
 *                  otherwise the card will not be created
 * @example [
  {
    "deckName": "test",
    "modelName": "double",
    "fields": {
      "word": "front content4",
      "sentence": "back content"
    },
    "tags": [
      "yomichan"
    ]
  }
]
 */
// TODO: 多个 Note 分批传送，不要太多，不然卡住了。
async function addNotes(notes) {
    try {
        const res = await ankiConnectInvoke({
            action: 'addNotes',
            version: 6,
            params: {
                notes,
            }
        })
        const { result, error } = res
        if (error) {
            console.log(error)
            throw error
        }
        const duplicates = []
        result.forEach((l, idx) => l === null && duplicates.push(notes[idx]))
        if (duplicates.length) {
            console.log('duplicate Sections', duplicates)
        }
        const len = result.filter(l => l).length
        console.log(`Total Import Notes ${len}`)
        return result
    } catch (error) {
        throw error
    }
}

async function getModelFieldNames(modelName) {
    try {
        const res = await ankiConnectInvoke({
            action: 'modelFieldNames',
            version: 6,
            params: { modelName }
        })
        const { result, error } = res
        if (error) {
            console.log(error)
            return;
        }
        return result
    } catch (error) {
        throw error
    }
}

async function getDeckNames() {
    try {
        const res = await ankiConnectInvoke({
            action: 'deckNames',
            version: 6,
        })
        const { result, error } = res
        if (error) {
            console.log(error)
            return;
        }
        console.log(JSON.stringify(result, null, 2))
        return result
    } catch (error) {
        throw error
    }
}

async function findNotes(query) {
    try {
        const res = await ankiConnectInvoke({
            "action": "findNotes",
            "version": 6,
            "params": { query }
        })
        const { result, error } = res
        if (error) {
            console.log(error)
            return;
        }
        return result
    } catch (error) {
        throw error
    }
}

/**
 *
 * @param {Array} notes
 * @param {Number} concurrency
 * @description update bulk notes
 */
async function updateNotes(notes, concurrency = 10) {

    // 控制异步数量
    async.mapLimit(
        notes,
        concurrency,
        updateNoteFields,
        (err, result) => {
            console.log(err)
        })
}

async function updateNoteFields({ id, fields }) {

    console.log(`current update note id: ${id}`)
    try {
        const res = await ankiConnectInvoke({
            "action": "updateNoteFields",
            "version": 6,
            "params": {
                "note": {
                    id,
                    fields,
                }
            }
        })
        const { result, error } = res
        if (error) {
            console.error('this note is wrong: ', id)
            return;
        }
        console.log(`note ${id} is done`)
        return result
    } catch (error) {
        console.error('this note is wrong: ', id)
        throw error
    }
}

/**
 * get the notes info collections
 * @param {Array} notesId
 * @returns {Array} [{ noteId, fields, modelName, tags }, ...]
 */
async function getNotesInfo(notesId) {
    const res = await ankiConnectInvoke({
        "action": "notesInfo",
        "version": 6,
        "params": {
            notes: notesId
        }
    })
    const { result, error } = res
    if (error) {
        console.log(error)
        return;
    }
    return result
}

async function addTags(notesId, tags) {
    const res = await ankiConnectInvoke({
        "action": "addTags",
        "version": 6,
        "params": {
            tags,
            notes: notesId,
        }
    })
    const { result, error } = res
    if (error) {
        console.log(error)
        return;
    }
    return result
}

// Cards

async function findCards(query) {
    try {
        const res = await ankiConnectInvoke({
            "action": "findCards",
            "version": 6,
            "params": { query }
        })
        const { result, error } = res
        if (error) {
            console.log(error)
            return;
        }
        return result
    } catch (error) {
        throw error
    }
}




module.exports = {
    addNotes,
    addTags,
    getModelFieldNames,
    getDeckNames,
    findNotes,
    updateNoteFields,
    getNotesInfo,
    updateNotes,
    changeDeck,
    findCards,
}
