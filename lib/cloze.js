const clozeWord = (word) => {
    return word.split('').map((char, idx, word) => {
        if (idx === 0 || idx === word.length - 1) {
            return char
        }
        return '_'
    }).join('')
}


function clozeWords(text) {
    const list = text.split('\n').filter(line => line !== '').map(line => {
        const fields = line.split(' ')
        return {
            word: fields[0],
            cloze: clozeWord(fields[0]),
            meaning: fields[1] || ''
        }
    })
    return list
}

const createCloze = (line) => {
    if (line.includes('{{') && line.includes('}}')) {
        let count = 0
        return line.replace(/\{\{(.*?)\}\}/g, (match, p1, offset) => {
            count++
            return `{{c${count}::${p1}}}`
        })
    } else {
        return line
    }
}

module.exports = {
    clozeWord,
    createCloze,
}
