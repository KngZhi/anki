const { createCloze } = require("./cloze");
const pangu = require("pangunode");
const { dump } = require("dumper.js");
const { getWord } = require("./dict.js");

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
    const tokens = text
        .split("\n")
        // 过滤标题
        .filter(l => !/^#{1,}/.test(l))
        .map(l => pangu(l))
        .map(l => (l === "" ? "\n" : l))
        .map(l => l
            .replace(/(\\\()/g, '\\$1')
            .replace(/(\\\))/g, '\\$1')
            .replace(/(\\\[)/g, '\\$1')
            .replace(/(\\\])/g, '\\$1')
        )

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
                noteProps.modelName = "cloze";
                noteProps.front = createCloze(front);
                noteProps.back = back
            } else if (line.includes("`")) {
                noteProps.modelName = "toefl";
                noteProps.word = getWord(front);
                noteProps.meaning = back;
                noteProps.sentence = front.replace(/`/g, '');
            } else {
                noteProps.modelName = "keypoint";
                noteProps.front = front
                noteProps.back = back
            }

            result.push({
                // front,
                // back,
                ...globalProps,
                ...noteProps
            });
            cardIdx += 1;
        } else if (/^:::/.test(line)) {
            const noteProps = {};
            const modelName = line.replace(":::", "");
            if (modelName) {
                noteProps.modelName = modelName;
            }

            let currentProp = "front";
            line = tokens[++count];
            while (line !== ":::") {
                if (/^.*?::/.test(line)) {
                    const items = line.trim().split("::");
                    currentProp = items[0].toLowerCase();
                    noteProps[currentProp] = items[1].trim();
                    noteProps.modelName = 'toefl'
                } else if (/^--/.test(line)) {
                    currentProp = "back";
                    noteProps.modelName = "keypoint";
                } else {
                    if (noteProps[currentProp]) {
                        noteProps[currentProp] += line;
                    } else {
                        noteProps[currentProp] = line;
                    }
                }

                line = tokens[++count];
                if (line === undefined) {
                    break;
                }
            }

            result.push({
                ...globalProps,
                ...noteProps
            });

            cardIdx += 1;
        } else {
            // string 的情况
            const note = result[cardIdx]
            if (note) {
                if (note.modelName === 'toefl') {
                   note.meaning += line + "\n"
                } else {
                    note.back += line + "\n";
                }
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
