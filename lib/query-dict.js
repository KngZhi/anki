const fetch = require('async-request')

const isArray = (param) => Array.isArray(param) && param.length

const filterInfo = (info) => {
    const { meta: { id }, hwi: { hw, prs }, fl, def } = info
    let audioSrc =''

    if (isArray(prs)) {
        audioSrc = audioUrl(prs[0].sound.audio)
    } else {
        audioSrc = ''
    }

    return {
        id,
        hw,
        // prs: isArray(prs) ? prs[0] : [],
        audioSrc,
    }
}

const audioUrl = (audio) => {
    let subdirectory = ''
    if (/^bix/.test(audio)) {
        subdirectory = 'bix'
    } else if (/^gg/.test(audio)) {
        subdirectory = 'gg'
    } else if (/^\d/.test(audio) || /^[.,\/#!$%\^&\*;:{}=\-_`~()]/.test(audio)) {
        subdirectory = 'number'
    } else {
        subdirectory = audio.split('')[0]
    }

    return `https://media.merriam-webster.com/soundc11/${subdirectory}/${audio}.wav`
}

async function queryDef(word) {
    const KEY = 'f39d6a50-9c83-40db-ba2f-518b4d99fb56 '
    const ROOT = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${KEY}`
    const result = JSON.parse((await fetch(ROOT)).body)
    if (isArray(result)) {
        return result
            .filter(col => {
                    if (!col.meta) return;
                    const { meta: { id } } = col
                    return !/[ \-]/g.test(id)
                })
            .map(filterInfo)
    } else {
        return []
    }
}

module.exports = {
    queryDef,
}
