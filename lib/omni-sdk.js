const path = require('path')
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const OMNI_SDK = `omni-jxa.js`

async function getTasks(projectName) {
    const PATH = path.resolve(__dirname, `${OMNI_SDK} ${projectName}`)

    const { stdout, stderr } = await exec(PATH)

    return JSON.parse(stdout)
}

module.exports = {
    getTasks,
}