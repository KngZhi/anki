const path = require('path')
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const OMNI_SDK = `omni-jxa.js`

async function getTasks(type, scope) {
    const PATH = path.resolve(__dirname, `${OMNI_SDK} ${type} ${scope}`)

    const { stdout, stderr } = await exec(PATH)

    return JSON.parse(stdout)
}

export {
    getTasks,
}
