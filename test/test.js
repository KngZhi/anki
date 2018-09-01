const expect = require('chai').expect;
const assert = require('chai').assert
const { getWords, retrieveMeanings } = require('../lib/dict')


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
});

describe('retrieveMeanings()', () => {
  it('should destruct all meanings from the give list of object ', () => {
    const LOS0 = []
    const LOS1 = [{ meanings: ['a'] }, { meanings: ['b'], senses: [] }]
    const LOS2 = [{ meanings: ['c'] }, { senses: LOS1 }]

    assert.deepEqual(retrieveMeanings(LOS0), [])
    assert.deepEqual(retrieveMeanings(LOS1), ['a', 'b'])
    assert.deepEqual(retrieveMeanings(LOS2), ['c', 'a', 'b'])
  });

});