const expect = require("chai").expect;
const assert = require("chai").assert;
const {
    getWords,
    retrieveMeanings,
    createTaskByWords
} = require("../lib/dict");
const { getNullResults } = require("../lib/utils");

const testResult = [
    {
        noteId: 1489290687543,
        tags: [],
        fields: {
            正面: {
                value: "incline",
                order: 0
            },
            音标: {
                value:
                    "[ɪnˈklaɪn] [sound:mdxldoce6-d1e69b97-6b58b15e-57522034-ee03c034-8d60021f.mp3]",
                order: 1
            },
            sentence: {
                value: "",
                order: 2
            },
            背面: {
                value:
                    "v.（使）倾斜；（使）倾向于 [ˈɪnklaɪn] n. 斜坡，斜面（slope）<br>记　词根记忆：in（向内）＋clin（倾斜）＋e→向内斜→（使）倾斜<br>例　They have come back from their trip to Europe; they inclined to take a rest for a couple of days. 他们刚从欧洲旅行回来；这几天想休息一下。",
                order: 3
            },
            sound: {
                value: "",
                order: 4
            },
            同义: {
                value: "",
                order: 5
            }
        },
        modelName: "toefl",
        cards: [1489290687990]
    },
    {
        noteId: 1489290687531,
        tags: [],
        fields: {
            正面: {
                value: "cultivate",
                order: 0
            },
            音标: {
                value:
                    "[ˈkʌltɪveɪt] [sound:mdxldoce6-1aeb1dcd-2f594e76-cbc50bf6-786c616c-d830fb9e.mp3]",
                order: 1
            },
            sentence: {
                value: "",
                order: 2
            },
            背面: {
                value:
                    "vt. 耕种；培养（bring up, foster）<br>记　词根记忆：cult（种植；培养）＋iv＋ate（动词后缀）→耕种；培养<br>例　Expressive leaders cultivate a personal relationship with staff in the group. 富有表现力的领导能与小组成员建立一种私人关系。<br>派　cultivation（n. 耕种；培养）",
                order: 3
            },
            sound: {
                value: "",
                order: 4
            },
            同义: {
                value: "",
                order: 5
            }
        },
        modelName: "toefl",
        cards: [1489290687978]
    }
];

describe("change the Notes fields", () => {
    function changeNotes(notes) {
        return notes.map(note => {
            const { noteId, fields } = note;
            const yinbiao = fields["音标"].value.split(" ");
            const beimian = fields["背面"].value
                .split("<br>")
                .filter(text => !text.includes("例　"))
                .join("<br>");
            const sentence = fields["背面"].value
                .split("<br>")
                .filter(text => text.includes("例　"))
                .join("");
            return {
                id: noteId,
                fields: {
                    音标: yinbiao[0],
                    sound: yinbiao[1] || "",
                    sentence,
                    背面: beimian
                }
            };
        });
    }
    it("should return the changed fields", () => {
        expect(changeNotes(testResult)).to.deep.eq([
            {
                id: 1489290687543,
                fields: {
                    音标: "[ɪnˈklaɪn]",
                    sentence:
                        "例　They have come back from their trip to Europe; they inclined to take a rest for a couple of days. 他们刚从欧洲旅行回来；这几天想休息一下。",
                    背面:
                        "v.（使）倾斜；（使）倾向于 [ˈɪnklaɪn] n. 斜坡，斜面（slope）<br>记　词根记忆：in（向内）＋clin（倾斜）＋e→向内斜→（使）倾斜",
                    sound:
                        "[sound:mdxldoce6-d1e69b97-6b58b15e-57522034-ee03c034-8d60021f.mp3]"
                }
            },
            {
                id: 1489290687531,
                fields: {
                    音标: "[ˈkʌltɪveɪt]",
                    sentence:
                        "例　Expressive leaders cultivate a personal relationship with staff in the group. 富有表现力的领导能与小组成员建立一种私人关系。",
                    背面:
                        "vt. 耕种；培养（bring up, foster）<br>记　词根记忆：cult（种植；培养）＋iv＋ate（动词后缀）→耕种；培养<br>派　cultivation（n. 耕种；培养）",
                    sound:
                        "[sound:mdxldoce6-1aeb1dcd-2f594e76-cbc50bf6-786c616c-d830fb9e.mp3]"
                }
            }
        ]);
    });
});

describe("getWords()", () => {
    it("should retrieve the word from given sentence by signal", () => {
        const STR0 = "";
        const STR1 = "this is `hello` world `this`";
        const STR2 = "this is `hello world`";

        const ERR_MSG = ["NOSIGNAL"];

        expect(getWords(STR0)).to.deep.equal(ERR_MSG);
        expect(getWords(STR1)).to.deep.equal(["hello", "this"]);
        expect(getWords(STR2)).to.deep.equal(["hello world"]);
    });

    it("should destruct all meanings from the give list of object ", () => {
        const LOS0 = [];
        const LOS1 = [{ meanings: ["a"] }, { meanings: ["b"], senses: [] }];
        const LOS2 = [{ meanings: ["c"] }, { senses: LOS1 }];

        assert.deepEqual(retrieveMeanings(LOS0), []);
        assert.deepEqual(retrieveMeanings(LOS1), ["a", "b"]);
        assert.deepEqual(retrieveMeanings(LOS2), ["c", "a", "b"]);
    });

    it("should generate multi tasks according to multi key words", () => {
        const l = [];
        const l0 = [{ name: "test for some `thing`", note: "", context: "" }];
        const l1 = [{ name: "test `for` some `thing`", note: "", context: "" }];

        assert.deepEqual(createTaskByWords(l), []);
        assert.deepEqual(createTaskByWords(l0), [
            { word: "thing", sentence: l0[0].name, context: l0[0].context }
        ]);
        assert.deepEqual(createTaskByWords(l1), [
            { word: "for", sentence: l1[0].name, context: l1[0].context },
            { word: "thing", sentence: l1[0].name, context: l1[0].context }
        ]);
    });
});

describe("helper function in Utils", () => {
    it("should return the null word", () => {
        const nullList_0 = [123, null, 321];
        const nullList_1 = [null, null, 321];
        const cardList = [{ name: "hello" }, { name: "foo" }, { name: "far" }];
        assert.deepEqual(getNullResults(nullList_0, cardList), [cardList[1]]);
        assert.deepEqual(getNullResults(nullList_1, cardList), [
            cardList[0],
            cardList[1]
        ]);
    });
});
