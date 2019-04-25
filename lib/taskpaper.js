const { createCloze } = require("./cloze");
const pangu = require("pangunode");

function getFields(line) {
    const filedType = {};
    line.replace(":", "")
        .trim()
        .split(" ")
        .filter(c => c.includes("@"))
        .forEach(field => {
            // @deck(x) => deck
            let fieldName = field.replace("@", "").replace(/\(.*\)/, "");
            // link: https://stackoverflow.com/questions/11907275/regular-expression-to-match-brackets
            // @deck(x,y) => x,y
            let fileValue = field.match(/\(([^)]+)\)/)[1];
            if (fieldName === "tags") {
                fileValue = fileValue.split(",");
            }
            filedType[fieldName] = fileValue;
        });
    return filedType;
}

function fileParse(text) {
    const result = [];
    // 新增 Note 时，必须包含 tags 属性
    let globalProps = {
        tags: []
    };
    let back = "";
    const tokens = text.split("\n").map(l => pangu(l));

    let count = 0;
    let cardIdx = -1;
    let isBlock = false;
    while (count < tokens.length) {
        let line = tokens[count];
        if (/^@.*?:$/.test(line)) {
            Object.assign(globalProps, getFields(line));
        } else if (/^- /.test(line)) {
            let front = line.replace("- ", "");
            const noteProps = getFields(line);

            if (line.includes("{{") && line.includes("}}")) {
                noteProps.modelName = 'cloze'
                front = createCloze(front)
            }

            result.push({
                front,
                back,
                ...globalProps,
                ...noteProps,
            });
            cardIdx += 1;
        } else if (/^:::/.test(line)) {

        } else {
            // string 的情况
            if (result[cardIdx]) {
                result[cardIdx].back += line + "\n";
            }
        }

        count++;
    }


    return result;
}

console.log(fileParse("- hello world {{some}} thing like this\nhello\n"));

// function fileParse(text) {
//     const result = []
//     let note = ''
//     let filedType = {}
//     let count = -1
//     text.split('\n')
//         .filter(line => line !== '')
//         .map(l => pangu(l))
//         .forEach(line => {
//             if (/^@.*?:$/.test(line)) {
//                 filedType = {}
//                 Object.assign(filedType, getFields(line))
//                 return;
//             }
//             if (/^- /.test(line)) {
//                 let name = line.replace('- ', '')

//                 if (name.includes('{{') && name.includes('}}')) {
//                     result.push({
//                        ...filedType,
//                         modelName: 'cloze',
//                         note,
//                         name: createCloze(name),
//                     })
//                 } else {
//                     result.push({
//                         ...filedType,
//                         note,
//                         name,
//                     })

//                 }

//                 count += 1
//                 return;
//             }

//             let blockStart = false

//             result[count].note += line + '\n'
//         })
//     return result
// }

module.exports = {
    fileParse,
    getFields
};
