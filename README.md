# Anki-util

## Example about creating cards bulkly

### Using yaml as global configuration, tags and deck

```yaml
deckName: Default
tags: ['foo', 'far', 'bar']
```

### Basic note types

Most frequently(90%) note are
1. create **basic** note, which only contain front and back field
    1. **[CAVEAT]** you have to make a newline so the below part would consider as a back field. Otherwise it would belong to front side
    2. If you want create front field with multiple line, you can check [2] example
2. [3] create **cloze** note, no matter how many cloze you got
3. [4] I want *x* cloze in the same card, rather than seperately

```md
- The population of China at 2020? [1]

1.4 billion.

- Give me some reasons about why China could feed so much [2]
  people at Qing Dynasty

I dont know for sure

- there are {{1.4 billions}} people living in China at {{2020}} [3]

you can also add note for **cloze** note

- there are {{1:1.4 billions}} people living in {{China}} at {{1:2020}} [4]
```

## Road Map

- [ ] combine *taskpaper.js* and *parser/index.js*
- [ ] 用编译器创建语法，然后输出
- [ ] 批量创建 cloze 卡片
- [ ] 查询 Note 类型，储存在本地，每隔几次再批量更新
- [ ] 通过 =pangu.js= format 数据
- [ ] 将 Anki-Connection 写成一个 npm 包

- 可以直接通过网页端来创建 Note
    - 建立对定义的拆解，包括对每个部分的细化，以及 cloze
    - 也可以进行删除
    - 对定义进行引用
- 如何处理错题？
- 也可以渲染成 Markdown 进行预览

## Frequently DEBUG Questions

- =UnhandledPromiseRejectionWarning: TypeError: Cannot destructure property `result` of 'undefined' or 'null'.=
    - using `lsof -i:8765` found out whether the port of AnkiConnect is occupied
    - if it is occupied, restart Anki or `kill \${lsof -t -i:8764}`
