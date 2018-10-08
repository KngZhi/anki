const inquirer = require('inquirer');

const askReCreate = () => {
    const questions = [
        {
            name: 'answer',
            type: 'list',
            choices: ['y', 'n'],
            message: 'Do you want recreate the card which has already been found in anki:',
            validate: function (value) {
                return true
            }
        },
    ];
    return inquirer.prompt(questions);
}

module.exports = {
    askReCreate,
}
