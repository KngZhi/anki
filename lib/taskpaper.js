const { dump } = require('dumper.js');

const test =
    `list-1 :
- exhibit
v. publicly display something in an art gallery or museum 展览，展出 = show; manifest clearly a quality behavior 呈现，显出 = reveal
n. an object on public display 展览品 = exhibition
- relatively
adv. in comparison, or proportion to something else 相对来说 = comparatively; quite 相当 = fairly, rather
- realistic
adj. having or showing a sensible and practical idea of something 现实的，现实主义的 = practical; representing things in a way that is accurate and true to life 逼真的 = truthful
list-2 :
- exhibit
v. publicly display something in an art gallery or museum 展览，展出 = show; manifest clearly a quality behavior 呈现，显出 = reveal
n. an object on public display 展览品 = exhibition
- relatively
adv. in comparison, or proportion to something else 相对来说 = comparatively; quite 相当 = fairly, rather
- realistic
adj. having or showing a sensible and practical idea of something 现实的，现实主义的 = practical; representing things in a way that is accurate and true to life 逼真的 = truthful
`

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
                tags = [line.replace(':', '')]
                return;
            }
            if (/^- /.test(line)) {
                obj = {}
                obj.name = line.replace('- ', '')
                obj.tags = tags
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
