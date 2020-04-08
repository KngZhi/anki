#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const program = require("commander");
const marked = require("marked");
const chalk = require("chalk");

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code) {
        return require("highlight.js").highlightAuto(code).value;
    },
    gfm: true,
    tables: true,
    breaks: true,
});


const pkg = require("./package.json");
const log = console.log;
const { createTaskByWords } = require("./lib/dict");
const { clozeWord, createCloze } = require("./lib/cloze");
const {
    addNotes,
    findNotes,
    getNotesInfo,
    updateNoteFields,
    addTags,
    updateNotes
} = require("./lib/anki-sdk");
const { getTasks } = require("./lib/omni-sdk");
const { fileParse } = require("./lib/taskpaper");
const { getNullResults } = require("./lib/utils");
const { askReCreate } = require("./lib/inquire");
const { chunk, take, flattenDeep } = require("lodash");

const createKeyPointCards = (tasks, deckName) => {
    const cards = tasks.map(task => ({
        deckName,
        modelName: "keypoint",
        fields: {
            question: marked(task.name),
            answer: marked(task.note)
        },
        tags: []
    }));
    return cards;
};

program
    .version(pkg.version)
    .description(pkg.description)
    .usage("[options] <command> [..]");

program
    .command("pre-word")
    .alias("pre")
    .description("create text for further use")
    .action(async () => {
        const result = await getTasks("word");
        const preNotes = createTaskByWords(result)
            .map(task => {
                let { word, sentence } = task;
                sentence = sentence
                    .replace(/`/g, "")
                    .replace(word, `\`${word}\``);
                return `- ${sentence}\n  \n`;
            })
            .join("\n");
        const filepath = path.resolve(process.cwd(), "word.md");
        fs.writeFile(filepath, preNotes, () => exec(`code ${filepath}`));
    });

/**
 * @description
 * @argument {String} projectName the project name of omni which you want create note
 * @argument {String} modelName   anki-note type
 */
program
    .command("OmniFocus-word [type] [deckName]")
    .alias("word")
    .description("create notes directly from OmniFocus project")
    .action(async (modelName = "single", deckName = "erratum") => {
        const result = await getTasks("word");
        const cards = createWordCards(result, modelName, deckName);
        const res = await addNotes(cards);
        console.log(res);

        if (res.filter(card => card !== null).length) {
            log(
                chalk.green.bold(
                    `Cards created in deck: ${deckName} by type: ${modelName}`
                )
            );
        } else {
            log(
                chalk.red(
                    "Something goes wrong, please check the code or OmniFocus!"
                )
            );
        }
    });

const createCards = data => {
    const cards = data.map(task => {
        const { tags, modelName, deckName, options, ...fields } = task;

        if (modelName !== 'toefl') {
            Object.keys(fields).forEach(key => {
                fields[key] = marked(fields[key]);
            });
        }

        return {
            tags,
            deckName,
            modelName,
            fields,
            options,
        };
    });
    return cards;
};

program
    .command("file <filename>")
    .description("create notes directly from erratum file")
    .action(async filename => {
        const filepath = path.resolve(process.cwd(), filename);
        if (!fs.lstatSync(filepath).isFile())
            return console.error("can not find the file in current directory");
        fs.readFile(filepath, "utf8", async (err, data) => {
            try {
                const cards = createCards(fileParse(data));
                const res = await addNotes(cards);
                console.log("initial result", res);
            } catch (error) {
                console.error(error);
            }
        });
    });

program
    .command("OmniFocus-big-bang")
    .alias("b2")
    .description("create notes from OmniFocus know project")
    .action(async () => {
        const projectName = "big-bang";
        const result = await getTasks(projectName);
        const cards = createKeyPointCards(result, projectName);
        const res = await addNotes(cards);
        console.log(res);
    });

program
    .command("toefl")
    .description("create Anki notes from OmniFocus tofel project")
    .action(async () => {
        const projectName = "toefl";
        const result = await getTasks(projectName);
        const cards = createKeyPointCards(result, projectName);
        const res = await addNotes(cards);
        console.log(res);
    });

program
    .command('pipe')
    .action(() => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        let result = ''
        process.stdin.on('data', function (data) {
            result += data
        });
        process.stdin.on('end', async () => {
            const json = JSON.parse(result)
            const res = await addNotes(json)
            console.log(res)
        })
    })

program
    .command("update <query>")
    .description("update notes according to the query and conditions")
    .action(async query => {
        const notesId = await findNotes(query);
        const result = await getNotesInfo(notesId);
        console.log(errorList);
        await updateNotes(list);
    });

program.parse(process.argv);

if (!program.args.filter(arg => typeof arg === "object").length) {
    program.help();
}
