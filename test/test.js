const expect = require('chai').expect;
const assert = require('chai').assert
const { getWords, retrieveMeanings, createTaskByWords } = require('../lib/dict')
const { fileParse } = require('../lib/taskpaper')
const { getNullResults } = require('../lib/utils')



describe('getWords()', () => {
    it('should retrieve the word from given sentence by signal', () => {
        const STR0 = '';
        const STR1 = 'this is `hello` world `this`';
        const STR2 = 'this is `hello world`';

        const ERR_MSG = ['NOSIGNAL'];

        expect(getWords(STR0)).to.deep.equal(ERR_MSG)
        expect(getWords(STR1)).to.deep.equal(['hello', 'this'])
        expect(getWords(STR2)).to.deep.equal(['hello world'])

    });

    it('should destruct all meanings from the give list of object ', () => {
        const LOS0 = []
        const LOS1 = [{ meanings: ['a'] }, { meanings: ['b'], senses: [] }]
        const LOS2 = [{ meanings: ['c'] }, { senses: LOS1 }]

        assert.deepEqual(retrieveMeanings(LOS0), [])
        assert.deepEqual(retrieveMeanings(LOS1), ['a', 'b'])
        assert.deepEqual(retrieveMeanings(LOS2), ['c', 'a', 'b'])
    });

    it('should generate multi tasks according to multi key words', () => {
        const l = []
        const l0 = [{ name: 'test for some `thing`', note: '', context: '' }]
        const l1 = [{ name: 'test `for` some `thing`', note: '', context: '' }]

        assert.deepEqual(createTaskByWords(l), [])
        assert.deepEqual(createTaskByWords(l0), [
            { word: 'thing', sentence: l0[0].name, context: l0[0].context },
        ])
        assert.deepEqual(createTaskByWords(l1), [
            { word: 'for', sentence: l1[0].name, context: l1[0].context },
            { word: 'thing', sentence: l1[0].name, context: l1[0].context },
        ])
    });
});

describe('generate right context', () => {
    const test =
        `list-1 :
- exhibit
v. publicly display something in an art gallery or museum 展览，展出 = show; manifest clearly a quality behavior 呈现，显出 = reveal
n. an object on public display 展览品 = exhibition
- relatively
adv. in comparison, or proportion to something else 相对来说 = comparatively; quite 相当 = fairly, rather
- realistic
adj. having or showing a sensible and practical idea of something 现实的，现实主义的 = practical; representing things in a way that is accurate and true to life 逼真的 = truthful
list-2 :
- exhibit
v. publicly display something in an art gallery or museum 展览，展出 = show; manifest clearly a quality behavior 呈现，显出 = reveal
n. an object on public display 展览品 = exhibition
- relatively
adv. in comparison, or proportion to something else 相对来说 = comparatively; quite 相当 = fairly, rather
- realistic
adj. having or showing a sensible and practical idea of something 现实的，现实主义的 = practical; representing things in a way that is accurate and true to life 逼真的 = truthful
`
    it('should return the null word', () => {
        const nullList_0 = [123, null, 321]
        const nullList_1 = [null, null, 321]
        const cardList = [{ name: 'hello' }, { name: 'foo' }, { name: 'far' }]
        assert.deepEqual(getNullResults(nullList_0, cardList), [cardList[1]])
        assert.deepEqual(getNullResults(nullList_1, cardList), [cardList[0],cardList[1]])
    });
});
