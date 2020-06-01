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

const createCloze = (note) => {
    console.log('creating Cloze')
    const { front, back } = note
    let count = 0
    const clozes = front.map(l => l.replace(/\{\{(.*?)\}\}/g, (match, p1, offset) => {
        count++
        return `{{c${count}::${p1}}}`
    }))

    return {
        front: clozes,
        back,
    }
}

module.exports = {
    clozeWord,
    createCloze,
}
