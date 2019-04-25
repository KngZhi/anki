const { createCloze } = require("./cloze");
const pangu = require("pangunode");
const { dump } = require('dumper.js')

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
    const tokens = text.split("\n").map(l => pangu(l)).map(l => l === '' ? '\n' : l);

    let count = 0;
    let cardIdx = -1;
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
            } else {
                noteProps.modelName = 'keypoint'
            }

            result.push({
                front,
                back,
                ...globalProps,
                ...noteProps,
            });
            cardIdx += 1;
        }
        else if (/^:::/.test(line)) {
            const noteProps = {}
            const modelName = line.replace(':::', '')
            if (modelName) {
                noteProps.modelName = modelName
            }

            let currentProp = ''
            line = tokens[++count]
            while (line !== ':::') {
                if (/^.*?::/.test(line)) {
                    const items = line.trim().split('::')
                    currentProp = items[0].toLowerCase()
                    noteProps[currentProp] = items[1].trim()
                } else {
                    noteProps[currentProp] += line
                }

                line = tokens[++count]
                if (line === undefined) {
                    break
                }
            }

            result.push({
                ...globalProps,
                ...noteProps,
            })

            cardIdx += 1
        }
        else {
            // string 的情况
            if (result[cardIdx]) {
                result[cardIdx].back += line + "\n";
            }
        }

        count++;
    }


    return result;
}

module.exports = {
    fileParse,
    getFields
};
