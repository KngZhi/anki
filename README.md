# Anki-util

## DEBUG Road

- =UnhandledPromiseRejectionWarning: TypeError: Cannot destructure property `result` of 'undefined' or 'null'.=
    可能是因为服务器的端口被占用了.
    - =lsof -i:8765= 这个是 AnkiConnect 的使用端口,查看是否被占用.
    - 如果是则杀死改进程, 然后重启 Anki 即可 =kill \${lsof -t -i:8764}=

## TODO Road Map

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
