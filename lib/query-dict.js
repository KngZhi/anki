const fetch = require('async-request')

const isArray = (param) => Array.isArray(param) && param.length

const filterInfo = (info) => {
    const { meta: { id }, hwi: { hw, prs }, } = info
    let audioUrl =''

    if (isArray(prs) && prs[0].sound) {
        audioUrl = getAudioUrl(prs[0].sound.audio)
    } else {
        audioUrl = ''
    }

    return {
        id,
        hw,
        audioUrl,
        prs: isArray(prs) ? prs[0] : [],
        ...info,
    }
}

const getAudioUrl = (audio) => {
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
    try {
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
    } catch (error) {
        return []
    }
}

module.exports = {
    queryDef,
}
