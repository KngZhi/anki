const expect = require("chai").expect;
const assert = require("chai").assert;
const { fileParse, getFields } = require("../lib/taskpaper");

describe("task paper generate right results", () => {
    let test = `@tags(list1,list2) @modelName(single) @deckName(test):
- exhibit
v. publicly
n. an object
- hello
v. foo
@tags(list-2) @modelName(keypoint) @deckName(test):
- foo
v. far`;
    it("should return the right task", () => {
        expect(fileParse(test)).to.be.deep.eq([
            {
                deckName: "test",
                front: "exhibit",
                back: "v. publicly\nn. an object\n",
                tags: ["list1", "list2"],
                modelName: "single",
                deckName: "test"
            },
            {
                deckName: "test",
                front: "hello",
                back: "v. foo\n",
                tags: ["list1", "list2"],
                modelName: "single",
                deckName: "test"
            },
            {
                front: "foo",
                deckName: "test",
                modelName: "keypoint",
                back: "v. far\n",
                tags: ["list-2"]
            }
        ]);
    });

    it("should return the right cloze", () => {
        test = "- hello world {{some}} thing like this\nhello\n";

        expect(fileParse(test)).to.deep.eq([
            {
                front: "hello world {{c1::some}} thing like this",
                back: "hello\n\n\n",
                modelName: "cloze",
                tags: []
            }
        ]);
    });

    it("should return the right block note", () => {
        const L0 = `:::keypoint\nfront:: this is new world to run until it hit the block\nback:: this is the need point\n:::`;

        const L1 = `:::toefl\nWord:: this\nMeaning:: hello world\n\nthis is the new world\nUsage:: this is the the test\n:::`;

        expect(fileParse(L0)).to.deep.eq([
            {
                front: "this is new world to run until it hit the block",
                back: "this is the need point",
                modelName: "keypoint",
                tags: []
            }
        ]);

        expect(fileParse(L1)).to.deep.eq([
            {
                word: "this",
                meaning: "hello world\nthis is the new world",
                modelName: "toefl",
                usage: "this is the the test",
                tags: []
            }
        ]);
    });

    it("should return the right name and value of field", () => {
        test =
            "## hello @tags(list1,list2) @modelName(single) @deckName(test):";
        expect(getFields(test)).to.be.deep.eq({
            deckName: "test",
            tags: ["list1", "list2"],
            modelName: "single"
        });

        test = "## hello @modelName(single) @deckName(test):";
        expect(getFields(test)).to.be.deep.eq({
            deckName: "test",
            modelName: "single"
        });
    });
});
