#!/usr/bin/env osascript -l JavaScript

ObjC.import('stdlib')                               // for exit

var args = $.NSProcessInfo.processInfo.arguments    // NSArray
var argv = []
var argc = args.count
for (var i = 4; i < argc; i++) {
    // skip 3-word run command at top and this file's name
    console.log($(args.objectAtIndex(i)).js)       // print each argument
    argv.push(ObjC.unwrap(args.objectAtIndex(i)))  // collect arguments
}

const projectName = argv[0]

/**
 * the OmniFocus application object
 *
 * @namespace
 * @property {boolean} includeStandardAdditions - if the app object can use the Standard Additions
 */
var app = Application('omnifocus');
app.includeStandardAdditions = true;
var current = Application.currentApplication();
current.includeStandardAdditions = true;

/**
 * the default document
 *
 * @namespace
 */
var doc = app.defaultDocument;

/**
 *
 * @method allTasks
 * @return {Array} Array of every task in the default document
 */
function allTasks() {
  return doc.flattenedTasks.whose({ completed: false })();
}
const list = []

allTasks().forEach(task => {
  const project = task.containingProject()
  if (project) {
    const name = task.containingProject().name()
    if (name && name === projectName) {
      list.push({
        name: task.name(),
        note: task.note(),
      })
      // task.completed = true
    }
  }
});

JSON.stringify(list, null, 2)