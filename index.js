#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const program = require("commander");
const marked = require("marked");
const chalk = require("chalk");
const stringSimilarity = require("string-similarity");
const asynces = require('async')

const asyncFile = promisify(fs.readFile);

const getFilePath = filename => path.resolve(process.cwd(), filename);

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code) {
        return require("highlight.js").highlightAuto(code).value;
    },
    gfm: true,
    tables: true,
    breaks: true
});

const pkg = require("./package.json");
const log = console.log;
const { getWords, } = require("./lib/dict");
const { queryDef } = require('./lib/query-dict')
const {
    addNotes,
    findNotes,
    getNotesInfo,
    updateNotes
} = require("./lib/anki-sdk");
const { getTasks } = require("./lib/omni-sdk");
const { fileParse } = require("./lib/taskpaper");

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
    .command("pre-word <filename>")
    .alias("pre")
    .description("create text for further use")
    .action(async filename => {
        const result = await asyncFile(getFilePath(filename), "utf8");
        const preNotes = result.split("\n\n").filter(l => !l.includes('@')).map(sentence => {
            const words = getWords(sentence);
            return words.map(word => ({ word, sentence }));
        })
            .reduce((res, val) => res.concat(val), [])
            .map(task => ({ ...task, sentence: task.sentence.replace(/`/g, '')}))
        const failedList = []
        try {
            const final = await asynces.mapSeries(preNotes, async (note) => {
                try {
                    const { word, sentence, } = note
                    console.log('current query word: ', word)
                    const shortdef = (await queryDef(word)).slice(0, 3).reduce((defs, item) => defs.concat(item.shortdef), [])
                    return { word, sentence, shortdef}
                } catch (error) {
                    console.error('something error', error)
                    failedList.push(note)
                }
            })

            const output = final.map(item => `${item.sentence}\n\n${item.shortdef.join('\n')}`).join('\n\n')
            fs.writeFile(getFilePath(filename), output, () => exec(`code ${getFilePath(filename)}`));
        } catch (error) {
           console.log(error)
        }
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

        if (modelName !== "toefl") {
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
