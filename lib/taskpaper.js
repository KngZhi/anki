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
    const tokens = text.split("\n").map(l => pangu(l));

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
            }

            result.push({
                front,
                back,
                ...globalProps,
                ...noteProps,
            });
            cardIdx += 1;
        } else if (/^:::/.test(line)) {
            const noteProps = {}
            const modelName = line.replace(':::', '')
            if (modelName) {
                noteProps.modelName = modelName
            }

            line = tokens[++count]
            let currentProp = ''
            while (!/^:::/.test(line)) {
                if (/^.*?::/.test(line)) {
                    const items = line.trim().split('::')
                    currentProp = items[0]
                    noteProps[currentProp] = items[1]
                    console.log(items, props)
                } else {
                    noteProps[currentProp] += line
                }

                line = tokens[++count]
                if (!line) {
                    break
                }
            }

            result.push({
                ...globalProps,
                ...noteProps,
            })

            cardIdx += 1

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



const L0 = `:::keypoint
front:: this is new world to run until it hit the block

back:: this is the need point
:::
`;

const L1 = `:::toefl
Word: this
Meaning: hello world

this is the new world
Usage: this is the the test
:::`;

console.log(fileParse(L0))
module.exports = {
    fileParse,
    getFields
};
