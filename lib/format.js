const { deriveWord } = require('./dict')
const string = `
Part I is about getting you up to speed on Node.js 8
we have to #procure the data that we’re going to be working with.
it will be able to import documents in bulk, like the #corpus of Project Gutenberg documents produced in the preceding chapter
The #upshot of this approach is that neither the bulk file nor the response from Elasticsearch needs to be wholly resident in the Node.js process’s memory
`

function formatOmniToMd(content) {
  const format = content.split('\n')
      .filter(line => line !== '')
      .map(deriveWord)
      .map(obj => `${obj.word}\n---\n${obj.sentence}\n===\n`)

  return format
}

module.exports = formatOmniToMd


