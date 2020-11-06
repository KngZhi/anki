const { lowerCase } = require("lodash")

// Object Notetype
function processOmniLeetcode(data) {
    const { name, tags, note } = data
    if (tags.indexOf('lc') > -1 && /^\d+\..*/.test(name)) {
        const link = 'https://leetcode.com/problems'
        let newName = name.split('. ')
        let newNote = note.replace(newName[1], '')
            .replace('- LeetCode', `[leetcode](${link}/${newName[1].split(' ').map(lowerCase).join('-')}/)`)

        data.name = newName.join(' ')
        data.note = newNote
    }
    return data
}

module.exports = processOmniLeetcode
