#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { promisify } = require('util')
const { exec } = require("child_process");
const program = require("commander");
const chalk = require("chalk");
const stringSimilarity = require("string-similarity");
const asynces = require('async')

const asyncFile = promisify(fs.readFile);

const getFilePath = filename => path.resolve(process.cwd(), filename);

const marked = require("marked");
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
    updateNotes,
    changeDeck,
    findCards,
} = require("./lib/anki-sdk");
const { getTasks } = require("./lib/omni-sdk");
const fileParse = require("./src/parser/index");
const processOmniLeetcode = require('./lib/note-processor')

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
            .map(task => ({ ...task, sentence: task.sentence.replace(/`/g, '') }))
        const failedList = []
        try {
            const final = await asynces.mapSeries(preNotes, async (note) => {
                try {
                    const { word, sentence, } = note
                    console.log('current query word: ', word)
                    const shortdef = (await queryDef(word)).slice(0, 3).reduce((defs, item) => defs.concat(item.shortdef), [])
                    return { word, sentence, shortdef }
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

program
    .command("om <type> <scope> [deckname]")
    .description("create notes directly from OmniFocus")
    .action(async (type, scope, deckName = 'big-bang') => {
        const result = await getTasks(type, scope);
        const cards = result.map(processOmniLeetcode).map(data => ({
            modelName: 'keypoint',
            fields: {
                front: marked(data.name),
                back: marked(data.note),
            },
            tags: data.tags,
            deckName,
        }))
        console.log(cards)
        const res = await addNotes(cards);
        console.log(res)
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
                const notes = fileParse(data)
                console.log(notes)
                const res = await addNotes(notes);
            } catch (error) {
                console.error(error);
            }
        });
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

program
    .command("daily [query] [amount]")
    .description("move card from big-stack to big-bang")
    .action(async (query, amount = 20) => {
        if (!query) {
            console.error('missing query')
            return
        }
        const notesId = (await findCards(query)).slice(0, amount)
        await changeDeck(notesId, 'big-bang');
    });

program.parse(process.argv);

if (!program.args.filter(arg => typeof arg === "object").length) {
    program.help();
}
