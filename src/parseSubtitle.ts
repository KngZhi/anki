// 定义文本
const text = `
vamos a experimentar pero creo que está
going to experience it but I think it is

bien *contextualizar* os donde yo creo que
good to *contextualizar* where I believe

empezó este pensamiento negativo hacia
this negative thought towards

mi persona y que lo *provocó* no para eso
me began and what *caused* it, not for that

tendríamos que remontarnos al colegio
we would have to go back to school,
`;
// 将文本按空行分割成段落
// 输出处理后的段落对象数组
function parseSubtitle(text) {
  const paragraphs = text.trim().split("\n\n");

  // 创建一个数组用来存放段落对象
  const paragraphObjects = [];

  // 遍历每个段落
  paragraphs.forEach((paragraph) => {
    // 将段落按行分割
    const lines = paragraph.split("\n");
    // 检查该段落是否包含 '*'
    if (lines.some((line) => line.includes("*"))) {
      // 假定第一行是 front，第二行是 back，进行处理
      const front = lines[0]
        ? lines[0].replace(/\*(.*?)\*/g, "<u>$1</u>").trim()
        : "";
      const back = lines[1]
        ? lines[1].replace(/\*(.*?)\*/g, "<u>$1</u>").trim()
        : "";
      // 创建段落对象并添加到数组中
      paragraphObjects.push({
        deckName: 'test',
        modelName: 'keypoint-reverse',
        fields: {
          front,
          back,
        },
        options: {
          allowDuplicate: false,
        }
      });
    }
  });

  return paragraphObjects;
}

export {
  parseSubtitle
}
