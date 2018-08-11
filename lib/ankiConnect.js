const axios = require('axios')

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

/**
 *
 * @param {Array} notes
 * @description You MUST specifies tags property, otherwise the note will note
 *              be created.
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
      throw error
    }
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

module.exports = {
  addNotes,
  getModelFieldNames,
}