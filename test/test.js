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

const data = [
    {
        addTime: 1561272082269,
        addTime2: 1561272082000,
        beanName: "ordersDetail",
        brandId: "101000",
        cancel: 2,
        channelType: "人工点餐",
        cnt: 1,
        detailId: "c8edfcb395714c758af1b2eb5b2ca242",
        id: 6098453,
        isRefund: 0,
        isTakeOut: 0,
        itemType: "product",
        memberId: "0",
        modifyTime: 1561272878974,
        ordersId: "21c7b04354ec43578c6686210db6b105",
        originalPrice: "19.99",
        paidFee: "19.99",
        parentId: "0",
        productId: "bafa590b29a34fceb7d40b0c2d0c7e5d",
        productName: "must be 2",
        scaleId: "1559703941045",
        scaleName: "400ML",
        startTime: 0,
        storeId: "332106",
        tableName: "OrdersDetail",
        taxConfig:
            '[{"combinedRate":"9.75","id":"T807c1e65dd494f578a417642a31f24b8","name":"Sale Tax"}]',
        components: [
            {
                name: "Additions",
                items: [
                    {
                        addTime: 1561272082269,
                        beanName: "ordersDetailComponents",
                        brandId: "101000",
                        cnt: 1,
                        componentId: "0ae0ed2560654e918e1a0421181f08dd",
                        componentName: "Additions",
                        componentType: "common",
                        componentTypeId: "9f4c7b6695eb4ad0860e89b051e4e331",
                        fee: "2.00",
                        id: 1192314,
                        memberId: "0",
                        name: "milk",
                        ordersDetailId: "c8edfcb395714c758af1b2eb5b2ca242",
                        ordersId: "21c7b04354ec43578c6686210db6b105",
                        remark: "3",
                        storeId: "332106",
                        tableName: "OrdersDetailComponents",
                        price: 2,
                        cc: 1,
                        $$hashKey: "object:231"
                    },
                    {
                        addTime: 1561272082269,
                        beanName: "ordersDetailComponents",
                        brandId: "101000",
                        cnt: 1,
                        componentId: "8ad1a46eb77d4e2d8299656a05e6ab93",
                        componentName: "Additions",
                        componentType: "common",
                        componentTypeId: "9f4c7b6695eb4ad0860e89b051e4e331",
                        fee: "5.00",
                        id: 1192315,
                        memberId: "0",
                        name: "yeguo",
                        ordersDetailId: "c8edfcb395714c758af1b2eb5b2ca242",
                        ordersId: "21c7b04354ec43578c6686210db6b105",
                        remark: "3",
                        storeId: "332106",
                        tableName: "OrdersDetailComponents",
                        price: 5,
                        cc: 1,
                        $$hashKey: "object:232"
                    }
                ],
                $$hashKey: "object:229"
            }
        ],
        kitchen: {
            maxcount: 1,
            station: {
                id: "L:NOOP",
                repeatNum: 1,
                isOverall: false,
                mergeNum: 1
            }
        },
        categoryId: "7d1fd837c6084c9e989c0628d04ed21e",
        categorySortIndex: 0,
        memberdiscountunable: false,
        exPicUrl: "",
        jialiao: [
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 2,
                channelType: "人工点餐",
                cnt: 1,
                detailId: "3ddbda22ae214bfa9648d3079fce2cdd",
                id: 6098454,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272878974,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "2.00",
                paidFee: "2.00",
                parentId: "c8edfcb395714c758af1b2eb5b2ca242",
                productId: "0ae0ed2560654e918e1a0421181f08dd",
                productName: "milk",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 2,
                kitchen: {
                    maxcount: 1,
                    station: {
                        id: "L:NOOP",
                        repeatNum: 1,
                        isOverall: false,
                        mergeNum: 1
                    }
                },
                price: 2
            },
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 2,
                channelType: "人工点餐",
                cnt: 1,
                detailId: "465fd075b7264e5daa169269a6f9fa7a",
                id: 6098455,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272878974,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "5.00",
                paidFee: "5.00",
                parentId: "c8edfcb395714c758af1b2eb5b2ca242",
                productId: "8ad1a46eb77d4e2d8299656a05e6ab93",
                productName: "yeguo",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 5,
                kitchen: {
                    maxcount: 1,
                    station: {
                        id: "L:NOOP",
                        repeatNum: 1,
                        isOverall: false,
                        mergeNum: 1
                    }
                },
                price: 5
            }
        ],
        price: 19.99,
        unitPrice: 19.99,
        addon: [
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 2,
                channelType: "人工点餐",
                cnt: 1,
                detailId: "3ddbda22ae214bfa9648d3079fce2cdd",
                id: 6098454,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272878974,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "2.00",
                paidFee: "2.00",
                parentId: "c8edfcb395714c758af1b2eb5b2ca242",
                productId: "0ae0ed2560654e918e1a0421181f08dd",
                productName: "milk",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 2,
                kitchen: {
                    maxcount: 1,
                    station: {
                        id: "L:NOOP",
                        repeatNum: 1,
                        isOverall: false,
                        mergeNum: 1
                    }
                },
                price: 2
            },
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 2,
                channelType: "人工点餐",
                cnt: 1,
                detailId: "465fd075b7264e5daa169269a6f9fa7a",
                id: 6098455,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272878974,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "5.00",
                paidFee: "5.00",
                parentId: "c8edfcb395714c758af1b2eb5b2ca242",
                productId: "8ad1a46eb77d4e2d8299656a05e6ab93",
                productName: "yeguo",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 5,
                kitchen: {
                    maxcount: 1,
                    station: {
                        id: "L:NOOP",
                        repeatNum: 1,
                        isOverall: false,
                        mergeNum: 1
                    }
                },
                price: 5
            }
        ]
    },
    {
        addTime: 1561272082269,
        addTime2: 1561272082000,
        beanName: "ordersDetail",
        brandId: "101000",
        cancel: 1,
        channelType: "人工点餐",
        cnt: 0,
        detailId: "44ffd2cc542b4aa3ab212cf40c403d8d",
        id: 6098457,
        isRefund: 0,
        isTakeOut: 0,
        itemType: "product",
        memberId: "0",
        modifyTime: 1561272153344,
        ordersId: "21c7b04354ec43578c6686210db6b105",
        originalPrice: "0.00",
        paidFee: "0.00",
        parentId: "0",
        productId: "3a260db7316248d891ff54e44062fcf6",
        productName: "American Coffee",
        scaleId: "1559022406812",
        scaleName: "600ml",
        startTime: 0,
        storeId: "332106",
        tableName: "OrdersDetail",
        taxConfig:
            '[{"combinedRate":"9.75","id":"T807c1e65dd494f578a417642a31f24b8","name":"Sale Tax"}]',
        components: [
            {
                name: "Sugar",
                items: [
                    {
                        addTime: 1561272082269,
                        beanName: "ordersDetailComponents",
                        brandId: "101000",
                        cnt: 1,
                        componentId: "14a8016d612a449d85c7ab11c89bbce2",
                        componentName: "Sugar",
                        componentType: "common",
                        componentTypeId: "c75c47b2d4c84eed886db4f8f338f67d",
                        fee: "0.00",
                        id: 1192316,
                        memberId: "0",
                        name: "Half sugar",
                        ordersDetailId: "44ffd2cc542b4aa3ab212cf40c403d8d",
                        ordersId: "21c7b04354ec43578c6686210db6b105",
                        remark: "1",
                        storeId: "332106",
                        tableName: "OrdersDetailComponents",
                        price: 0,
                        cc: 1,
                        $$hashKey: "object:245"
                    }
                ],
                $$hashKey: "object:239"
            },
            {
                name: "Additions",
                items: [
                    {
                        addTime: 1561272082269,
                        beanName: "ordersDetailComponents",
                        brandId: "101000",
                        cnt: 7,
                        componentId: "c0963d4b39ae479386bfbd7daf856c3a",
                        componentName: "Additions",
                        componentType: "common",
                        componentTypeId: "1352cb3e5c474341885af9a7177b60a3",
                        fee: "7.00",
                        id: 1192317,
                        memberId: "0",
                        name: "zhenzhu",
                        ordersDetailId: "44ffd2cc542b4aa3ab212cf40c403d8d",
                        ordersId: "21c7b04354ec43578c6686210db6b105",
                        remark: "8",
                        storeId: "332106",
                        tableName: "OrdersDetailComponents",
                        price: 7,
                        cc: 1,
                        $$hashKey: "object:247"
                    }
                ],
                $$hashKey: "object:240"
            },
            {
                name: "DO NOT",
                items: [
                    {
                        addTime: 1561272082269,
                        beanName: "ordersDetailComponents",
                        brandId: "101000",
                        cnt: 1,
                        componentId: "e536d53fc1424d72847453c54c722fb4",
                        componentName: "DO NOT",
                        componentType: "common",
                        componentTypeId: "55628579b8fa411e8a5765db52c71adf",
                        fee: "0.00",
                        id: 1192318,
                        memberId: "0",
                        name: "NO",
                        ordersDetailId: "44ffd2cc542b4aa3ab212cf40c403d8d",
                        ordersId: "21c7b04354ec43578c6686210db6b105",
                        remark: "1",
                        storeId: "332106",
                        tableName: "OrdersDetailComponents",
                        price: 0,
                        cc: 1,
                        $$hashKey: "object:251"
                    }
                ],
                $$hashKey: "object:241"
            }
        ],
        jialiao: [
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 1,
                channelType: "人工点餐",
                cnt: 7,
                detailId: "044f9e5ebadd4cbc83c4f9bd8b489a2b",
                id: 6098458,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272153344,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "49.00",
                paidFee: "49.00",
                parentId: "44ffd2cc542b4aa3ab212cf40c403d8d",
                productId: "c0963d4b39ae479386bfbd7daf856c3a",
                productName: "zhenzhu",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 7,
                price: 49
            }
        ],
        price: 0,
        unitPrice: null,
        addon: [
            {
                addTime: 1561272082269,
                addTime2: 1561272082000,
                beanName: "ordersDetail",
                brandId: "101000",
                cancel: 1,
                channelType: "人工点餐",
                cnt: 7,
                detailId: "044f9e5ebadd4cbc83c4f9bd8b489a2b",
                id: 6098458,
                isRefund: 0,
                isTakeOut: 0,
                itemType: "product",
                memberId: "0",
                modifyTime: 1561272153344,
                ordersId: "21c7b04354ec43578c6686210db6b105",
                originalPrice: "49.00",
                paidFee: "49.00",
                parentId: "44ffd2cc542b4aa3ab212cf40c403d8d",
                productId: "c0963d4b39ae479386bfbd7daf856c3a",
                productName: "zhenzhu",
                scaleId: "-1",
                scaleName: "",
                storeId: "332106",
                tableName: "OrdersDetail",
                tips: "加料",
                unitPrice: 7,
                price: 49
            }
        ]
    }
];

const convertToVoidPrintData = list => {
    const componentSection = (components) => components
        .map(component =>
            component.items
                .map(({ cnt, name }) => cnt > 1 ? `${name}*${cnt}` : name)
                .join(`、`)
        )
        .join(`、`);

    const convertProduct = product =>  {
        const {
            scaleName,
            cancel,
            paidFee,
            discount,
            startTime,
            isRefund,
            isTakeOut,
            productName,
            components = [],
        } = product;
        const nameSection = [scaleName, componentSection(components)]
            .filter(item => item !== '')
            .map(item => `(${item})`)
            .join('')
        return {
            paidFee,
            startTime,
            isTakeOut,
            discount: discount || "",
            name: `${productName}${nameSection}`,
            cnt: cancel,
            isRefund: isRefund || 0,
        };
    }
    return list.map(item => {
        const { itemType, products } = item
        if (itemType === 'taocan' || itemType === 'zixuan') {
            const itemResult = convertProduct(item)
            const itemProductsResult = products.map(convertProduct)
            return [].concat(itemResult, itemProductsResult)
        } else {
            return convertProduct(item)
        }

    })
};

const { deepEqual } = assert;

describe("return the right printer Data", () => {
    it("should return the right ", () => {
        deepEqual(convertToVoidPrintData(data), [
            {
                name: "must be 2(400ML)(milk、yeguo)",
                cnt: "1",
                isRefund: 0,
                isTakeOut: 0,
                startTime: 0,
                discount: "",
                paidFee: "19.99"
            },
            {
                name: "大幅",
                cnt: "1",
                isRefund: 0,
                isTakeOut: 0,
                startTime: 0,
                discount: "",
                paidFee: "12.00"
            }
        ]);
    });

    it('should return the taocan printer Data', () => {
        const dataSource =[{"addTime":1561274043026,"addTime2":1561274043000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":0,"detailId":"fae3a5ed074c49e4bf9c9e52c3e3757b","id":6098462,"isRefund":0,"isTakeOut":0,"itemType":"taocan","memberId":"0","modifyTime":1561274120142,"ordersId":"f7d271b56a164ec49de288f70033aec5","originalPrice":"0.00","paidFee":"0.00","parentId":"0","productId":"01c3695acd3c497a82a1e1195488c8d7","productName":"optional combo","scaleId":"-1","scaleName":"","startTime":0,"storeId":"332106","tableName":"OrdersDetail","products":[{"addTime":1561274043026,"addTime2":1561274043000,"beanName":"ordersDetail","brandId":"101000","cancel":2,"channelType":"人工点餐","cnt":0,"detailId":"a209f583790d4700826e719ba42286db","id":6098463,"isRefund":null,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274120142,"ordersId":"f7d271b56a164ec49de288f70033aec5","originalPrice":"0.00","paidFee":"","parentId":"fae3a5ed074c49e4bf9c9e52c3e3757b","productId":"900eb93b8b124cd78e4892138b839bb9","productName":"option to9  option to9  option to9  option to9","scaleId":"0","scaleName":"200ML","startTime":0,"storeId":"332106","tableName":"OrdersDetail","taxConfig":"[{\"combinedRate\":\"9.75\",\"id\":\"T807c1e65dd494f578a417642a31f24b8\",\"name\":\"Sale Tax\"}]","cc":null,"$$hashKey":"object:596"},{"addTime":1561274043026,"addTime2":1561274043000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":0,"detailId":"9d1a26aab37a4fbab7baf2597b3e3704","id":6098464,"isRefund":null,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274120142,"ordersId":"f7d271b56a164ec49de288f70033aec5","originalPrice":"0.00","paidFee":"","parentId":"fae3a5ed074c49e4bf9c9e52c3e3757b","productId":"900eb93b8b124cd78e4892138b839bb9","productName":"option to9  option to9  option to9  option to9","scaleId":"1559707724914","scaleName":"300ML","startTime":0,"storeId":"332106","tableName":"OrdersDetail","taxConfig":"[{\"combinedRate\":\"9.75\",\"id\":\"T807c1e65dd494f578a417642a31f24b8\",\"name\":\"Sale Tax\"}]","cc":null,"$$hashKey":"object:597"}],"price":0,"unitPrice":null}]
        const org = [{"name":"optional combo","cnt":"1","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"--9","paidFee":"35.00"},{"name":"2 option to9  option to9  option to9  option to9(200ML)","cnt":"","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"","paidFee":""},{"name":"1 option to9  option to9  option to9  option to9(300ML)","cnt":"","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"","paidFee":""}]
        deepEqual(
            org,
            convertToVoidPrintData(dataSource)
        )

        // 包含加料
        const dataSource_1 = [{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":0,"detailId":"fed9e86645b944df8f81758d6399cb60","id":6098465,"isRefund":0,"isTakeOut":0,"itemType":"taocan","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"0.00","paidFee":"0.00","parentId":"0","productId":"01c3695acd3c497a82a1e1195488c8d7","productName":"optional combo","scaleId":"-1","scaleName":"","startTime":0,"storeId":"332106","tableName":"OrdersDetail","products":[{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":2,"channelType":"人工点餐","cnt":0,"detailId":"84f8c4a6f300468aaa2bab63c4c1f914","id":6098466,"isRefund":null,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"0.00","paidFee":"","parentId":"fed9e86645b944df8f81758d6399cb60","productId":"900eb93b8b124cd78e4892138b839bb9","productName":"option to9  option to9  option to9  option to9","scaleId":"0","scaleName":"200ML","startTime":0,"storeId":"332106","tableName":"OrdersDetail","taxConfig":"[{\"combinedRate\":\"9.75\",\"id\":\"T807c1e65dd494f578a417642a31f24b8\",\"name\":\"Sale Tax\"}]","components":[{"name":"Not have","items":[{"addTime":1561274233537,"beanName":"ordersDetailComponents","brandId":"101000","cnt":6,"componentId":"700c57abd34e45318314303b633fd9ad","componentName":"Not have","componentType":"common","componentTypeId":"88e2959b04f04a49abdd1cc93c166b1d","fee":"0.00","id":1192319,"memberId":"0","name":"green onion","ordersDetailId":"84f8c4a6f300468aaa2bab63c4c1f914","ordersId":"be822065e81f4357b3df568390278b63","remark":"6","storeId":"332106","tableName":"OrdersDetailComponents","price":0,"cc":1,"$$hashKey":"object:1048"}],"$$hashKey":"object:1044"},{"name":"Add exam","items":[{"addTime":1561274233537,"beanName":"ordersDetailComponents","brandId":"101000","cnt":7,"componentId":"8570394984864ccb8b8eb07c15ab294d","componentName":"Add exam","componentType":"common","componentTypeId":"66750c5273cd4ffd8ab563495f376bf4","fee":"4.00","id":1192320,"memberId":"0","name":"Recommendation","ordersDetailId":"84f8c4a6f300468aaa2bab63c4c1f914","ordersId":"be822065e81f4357b3df568390278b63","remark":"8","storeId":"332106","tableName":"OrdersDetailComponents","price":4,"cc":1,"$$hashKey":"object:1050"},{"addTime":1561274233537,"beanName":"ordersDetailComponents","brandId":"101000","cnt":5,"componentId":"31773abcb8ec479289689440ccb740a3","componentName":"Add exam","componentType":"common","componentTypeId":"66750c5273cd4ffd8ab563495f376bf4","fee":"5.00","id":1192321,"memberId":"0","name":"Espresso","ordersDetailId":"84f8c4a6f300468aaa2bab63c4c1f914","ordersId":"be822065e81f4357b3df568390278b63","remark":"6","storeId":"332106","tableName":"OrdersDetailComponents","price":5,"cc":1,"$$hashKey":"object:1051"}],"$$hashKey":"object:1045"}],"jialiao":[{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":7,"detailId":"103e357c9939418fae96f762244f1121","id":6098468,"isRefund":0,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"28.00","paidFee":"28.00","parentId":"84f8c4a6f300468aaa2bab63c4c1f914","productId":"8570394984864ccb8b8eb07c15ab294d","productName":"Recommendation","scaleId":"-1","scaleName":"","storeId":"332106","tableName":"OrdersDetail","tips":"加料","unitPrice":4,"price":28},{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":5,"detailId":"04b368185f5248eb9522bbe5b914e4fd","id":6098469,"isRefund":0,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"25.00","paidFee":"25.00","parentId":"84f8c4a6f300468aaa2bab63c4c1f914","productId":"31773abcb8ec479289689440ccb740a3","productName":"Espresso","scaleId":"-1","scaleName":"","storeId":"332106","tableName":"OrdersDetail","tips":"加料","unitPrice":5,"price":25}],"cc":null,"$$hashKey":"object:1039"},{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":0,"detailId":"938ca80286844315b824f93550b6a3dd","id":6098467,"isRefund":null,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"0.00","paidFee":"","parentId":"fed9e86645b944df8f81758d6399cb60","productId":"900eb93b8b124cd78e4892138b839bb9","productName":"option to9  option to9  option to9  option to9","scaleId":"1559707724914","scaleName":"300ML","startTime":0,"storeId":"332106","tableName":"OrdersDetail","taxConfig":"[{\"combinedRate\":\"9.75\",\"id\":\"T807c1e65dd494f578a417642a31f24b8\",\"name\":\"Sale Tax\"}]","cc":null,"$$hashKey":"object:1040"}],"price":53,"unitPrice":null,"addon":[{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":7,"detailId":"103e357c9939418fae96f762244f1121","id":6098468,"isRefund":0,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"28.00","paidFee":"28.00","parentId":"84f8c4a6f300468aaa2bab63c4c1f914","productId":"8570394984864ccb8b8eb07c15ab294d","productName":"Recommendation","scaleId":"-1","scaleName":"","storeId":"332106","tableName":"OrdersDetail","tips":"加料","unitPrice":4,"price":28},{"addTime":1561274233537,"addTime2":1561274233000,"beanName":"ordersDetail","brandId":"101000","cancel":1,"channelType":"人工点餐","cnt":5,"detailId":"04b368185f5248eb9522bbe5b914e4fd","id":6098469,"isRefund":0,"isTakeOut":0,"itemType":"product","memberId":"0","modifyTime":1561274301362,"ordersId":"be822065e81f4357b3df568390278b63","originalPrice":"25.00","paidFee":"25.00","parentId":"84f8c4a6f300468aaa2bab63c4c1f914","productId":"31773abcb8ec479289689440ccb740a3","productName":"Espresso","scaleId":"-1","scaleName":"","storeId":"332106","tableName":"OrdersDetail","tips":"加料","unitPrice":5,"price":25}]}]
        const org_1 = [
            {"name":"optional combo","cnt":"1","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"--9","paidFee":"35.00"},
            {"name":"2 option to9  option to9  option to9  option to9(200ML)(green onion*6、Recommendation*8、Espresso*6)","cnt":"","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"","paidFee":""},
            {"name":"1 option to9  option to9  option to9  option to9(300ML)","cnt":"","isRefund":0,"isTakeOut":0,"startTime":0,"discount":"","paidFee":""}]
    });
});
