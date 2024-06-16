#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import program from "commander";
import asynces from "async";
import { parseSubtitle } from "./src/parseSubtitle";

const asyncFile = promisify(fs.readFile);

// import marked from "marked"

// marked.setOptions({
//     renderer: new marked.Renderer(),
//     highlight: function(code) {
//         return require("highlight.js").highlightAuto(code).value;
//     },
//     gfm: true,
//     tables: true,
//     breaks: true
// });

// const pkg = require("./package.json");
import { getWords } from "./lib/dict";
import { queryDef } from "./lib/query-dict";
import {
  addNotes,
  findNotes,
  getNotesInfo,
  updateNotes,
  changeDeck,
  findCards,
} from "./lib/anki-sdk";
import { getTasks } from "./lib/omni-sdk";
import fileParse from "./src/parser/index";
import processOmniLeetcode from "./lib/note-processor";

import { Note, Tags, OmniFocusData } from "./src/types";

program
  // .version(pkg.version)
  // .description(pkg.description)
  .usage("[options] <command> [..]");

// program
//     .command("pre-word <filename>")
//     .alias("pre")
//     .description("create text for further use")
//     .action(async filename => {
//         const result = await asyncFile(getFilePath(filename), "utf8");
//         const preNotes = result.split("\n\n").filter(l => !l.includes('@')).map(sentence => {
//             const words = getWords(sentence);
//             return words.map(word => ({ word, sentence }));
//         })
//             .reduce((res, val) => res.concat(val), [])
//             .map(task => ({ ...task, sentence: task.sentence.replace(/`/g, '') }))
//         const failedList = []
//         try {
//             const final = await asynces.mapSeries(preNotes, async (note) => {
//                 try {
//                     const { word, sentence, } = note
//                     console.log('current query word: ', word)
//                     const shortdef = (await queryDef(word)).slice(0, 3).reduce((defs, item) => defs.concat(item.shortdef), [])
//                     return { word, sentence, shortdef }
//                 } catch (error) {
//                     console.error('something error', error)
//                     failedList.push(note)
//                 }
//             })

//             const output = final.map(item => `${item.sentence}\n\n${item.shortdef.join('\n')}`).join('\n\n')
//             fs.writeFile(getFilePath(filename), output, () => exec(`code ${getFilePath(filename)}`));
//         } catch (error) {
//             console.log(error)
//         }
//     });

program
  .command("om <type> <scope> [deckname]")
  .description("create notes directly from OmniFocus")
  .action(async (type, scope, deckName = "big-bang") => {
    const result = await getTasks(type, scope);
    const cards = result.map((data: OmniFocusData) => {
      if (data.tags.includes("lc")) {
        return processOmniLeetcode(data);
      } else {
        return {
          modelName: "keypoint",
          fields: {
            front: data.name,
            back: data.note,
          },
          tags: data.tags,
          deckName,
        };
      }
    });
    const res = await addNotes(cards);
    console.log(res);
  });

program
  .command("file <filepath>")
  .description("create notes directly from erratum file")
  .action(async (filename) => {
    const filepath: string = path.resolve(process.cwd(), filename);
    if (!fs.lstatSync(filepath).isFile())
      return console.error("can not find the file in current directory");
    fs.readFile(filepath, "utf8", async (err, data) => {
      if (err) throw err;
      try {
        const notes = fileParse(data);
        const res = await addNotes(notes);
        console.log(res);
      } catch (error) {
        console.error(error);
      }
    });
  });

program
  .command("subtitle <filepath>")
  .description("将字幕文件分割成所需要的 Anki 卡片")
  .action(async (filename) => {
    const filepath: string = path.resolve(process.cwd(), filename);
    if (!fs.lstatSync(filepath).isFile())
      return console.error("can not find the file in current directory");
    fs.readFile(filepath, "utf8", async (err, data) => {
      if (err) throw err;
      try {
        const notes = parseSubtitle(data);
        console.log(notes);

        const res = await addNotes(notes);
        console.log(res);
      } catch (error) {
        console.error(error);
      }
    });
  });

program.command("pipe").action(() => {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  let result = "";
  process.stdin.on("data", function (data) {
    result += data;
  });
  process.stdin.on("end", async () => {
    const json = JSON.parse(result);
    const res = await addNotes(json);
    console.log(res);
  });
});

program
  .command("update <query>")
  .description("update notes according to the query and conditions")
  .action(async (query) => {
    const notesId = await findNotes(query);
    const result = getNotesInfo(notesId);
    console.log(result);
    await updateNotes(notesId);
  });

program
  .command("daily [query] [amount] [target]")
  .description("move card from query to target deck")
  .action(async (query, amount = 20, target) => {
    if (!query) {
      console.error("missing query");
      return;
    }
    const notesId = (await findCards(query)).slice(0, amount);
    await changeDeck(notesId, target);
  });

program.parse(process.argv);

if (!program.args.filter((arg) => typeof arg === "object").length) {
  program.help();
}
