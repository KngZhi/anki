const expect = require('chai').expect;
const assert = require('chai').assert
const { fileParse, getFields } = require('../lib/taskpaper')

describe('task paper generate right results', () => {
    let test =
        `@tags(list1,list2) @modelName(single) @deckName(test):
- exhibit
v. publicly
n. an object
- hello
v. foo
@tags(list-2) @modelName(keypoint) @deckName(test):
- foo
v. far`
    it('should return the right task', () => {
        expect(fileParse(test)).to.be.deep.eq(
            [
                { deckName: 'test', name: 'exhibit', note: 'v. publicly\nn. an object\n', tags: ['list1', 'list2'], modelName: 'single', deckName: 'test' },
                { deckName: 'test', name: 'hello', note: 'v. foo\n', tags: ['list1', 'list2'], modelName: 'single', deckName: 'test' },
                { name: 'foo', deckName: 'test', modelName: 'keypoint', note: 'v. far\n', tags: ['list-2'], }
            ]
        )


    });


    it('should return the right name and value of field', () => {
        test = '## hello @tags(list1,list2) @modelName(single) @deckName(test):'
        expect(getFields(test)).to.be.deep.eq(
            { deckName: 'test', tags: ['list1', 'list2'], modelName: 'single', }
        )

        test = '## hello @modelName(single) @deckName(test):'
        expect(getFields(test)).to.be.deep.eq(
            { deckName: 'test', tags: [], modelName: 'single', }
        )
    });

});
