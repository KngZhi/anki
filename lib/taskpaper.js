const P = require('parsimmon')
const TAG = P.regex(/@([^\(\s]+(\([^\)]*\))?)/, 1)

function fileParse(text) {
    const result = []
    let tags = []
    let note = ''
    let obj = {}
    const list = text
        .split('\n')
        .filter(line => line !== '')
        .map(line => line.trim())
        .forEach(line => {
            if (/.*?:$/.test(line)) {
                obj = {}
                const list = line.replace(':', '').trim().split(' ').forEach(field => {
                    // @deck(x) => deck
                    let fieldName = field.replace('@', '').replace(/\(.*\)/, '')
                    // link: https://stackoverflow.com/questions/11907275/regular-expression-to-match-brackets
                    // @deck(x,y) => x,y
                    let fileValue = field.match(/\(([^)]+)\)/)[1]
                    if (fieldName === 'tags') {
                        fileValue = fileValue.split(',')
                    }
                    obj[fieldName] = fileValue
                })
                // tags = [line.replace(':', '').trim()]
                return;
            }
            if (/^- /.test(line)) {
                obj.name = line.replace('- ', '')
                obj.note = note
                result.push(obj)
                return;
            }
            obj.note = obj.note += line + '\n'
        })
    return result
}

module.exports = {
    fileParse
}
