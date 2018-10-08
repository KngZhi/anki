const expect = require('chai').expect;
const { deepEqual } = require('chai').assert
const { getSections } = require('../lib/file-parse')

describe('task paper generate right results', () => {

    it('should return all sections of given file', () => {
        const test =
        `### erratum
        test
        - first a
        ### foo
        `
        deepEqual(
            getSections('erratum', test),
            [
                {
                    name: 'erratum',
                    content: `test\n- first a\n`,
                },
            ]
        )

        deepEqual(
            getSections(['erratum', 'foo'], test),
            [
                {
                    name: 'erratum',
                    content: `test\n- first a\n`,
                },
                {
                    name: 'foo',
                    content: '',
                },
            ]
        )
    });
});
