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

function formatLeetcodeNote(data) {
    return {
        modelName: 'keypoint',
        fields: {
            front: (data.name),
            back: (data.note),
            note: data.links || ''
        },
        tags: data.tags,
        deckName: 'Default',
    }
}

// Object Notetype
function processOmniLeetcode(data) {
    const { name, tags, note } = data
    if (tags.indexOf('lc') > -1 && /^\d+\..*/.test(name)) {
        const linkUs = 'https://leetcode.com/problems'
        const linkCn = 'https://leetcode-cn.com/problems'
        let newName = name.split('.').map(s => s.trim())
        let newNote = note.replace(newName[1], '').trim()
        const link = newName[1].toLowerCase().replace(/ /g, '-')
        const linkString = `\[[leetcode](${linkUs}/${link}/)\] [[ltcn](${linkCn}/${link}/)]`
        data.name = newName.join(' ')
        data.note = newNote
        data.links = marked(linkString)
    }
    return formatLeetcodeNote(data)
}

module.exports = processOmniLeetcode
