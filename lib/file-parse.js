// String|Array[String, ], String => Array[Object{ name, content }, Object]
const getSections = (scName, file) => {
    const result = []
    const names = []
    const contents = []
    let lines = ''
    file.split('\n')
        .filter(line => line !== '')
        .forEach(line => {
            if (line.includes('###')) {
                names.push(line.trim().replace('### ', ''))
                if (line !== '') {
                    contents.push(lines)
                }
                lines = ''
            } else {
                lines += line.trim() + '\n'
            }
        })

    names.forEach((name, idx) => {
        result.push({
            name,
            content: contents[idx + 1] || ''
        })
    })

    if (typeof scName === 'string') {
        return result.filter(s => s.name === scName)
    }
    return result

}

module.exports = {
    getSections
}
