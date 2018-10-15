const P = require('parsimmon')
const TAG = P.regex(/@([^\(\s]+(\([^\)]*\))?)/, 1)

function fileParse(text) {
    const result = []
    let note = ''
    let filedType = {}
    let count = -1
    const list = text
        .split('\n')
        .filter(line => line !== '')
        .map(line => line.trim())
        .forEach(line => {
            if (/.*?:$/.test(line)) {
                filedType = {}
                const list = line.replace(':', '').trim().split(' ').forEach(field => {
                    // @deck(x) => deck
                    let fieldName = field.replace('@', '').replace(/\(.*\)/, '')
                    // link: https://stackoverflow.com/questions/11907275/regular-expression-to-match-brackets
                    // @deck(x,y) => x,y
                    let fileValue = field.match(/\(([^)]+)\)/)[1]
                    if (fieldName === 'tags') {
                        fileValue = fileValue.split(',')
                    }
                    filedType[fieldName] = fileValue
                })
                if (!filedType.tags) {
                    filedType.tags = []
                }
                // tags = [line.replace(':', '').trim()]
                return;
            }
            if (/^- /.test(line)) {
                result.push({
                    ...filedType,
                    note,
                    name: line.replace('- ', ''),
                })
                count += 1
                return;
            }
            result[count].note += line + '\n'
        })
    return result
}

module.exports = {
    fileParse
}
