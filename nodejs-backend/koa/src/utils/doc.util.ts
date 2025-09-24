import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  type IImageOptions,
  ImageRun,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { parse } from "node-html-parser";

import UploadUtil from "#app/service/upload/util.ts";
import type { CommonDoc, QuestionDoc, RenderQuestionOption } from "#app/types/util.js";

import { isTrusty } from "./lodash.util.ts";
import UndiciUtil from "./request.util.ts";

export class DocRenderUtil {
  private baseUrl = UploadUtil.getPreviewBaseUrl();
  /**
   * 题号计数器
   */
  private questionCounter = 1;

  //题号，图片地址
  imgMap: Record<number, { name: string; url: string }[]> = {};
  //题号，文件地址；不包含图片
  fileMap: Record<number, { name: string; type: string; url: string }[]> = {};
  async renderQuestionBase<T, U>(
    questionObj: QuestionDoc<T, U>,
    renderOpts: RenderQuestionOption<T, U>,
  ) {
    this.imgMap[this.questionCounter] = [];
    this.fileMap[this.questionCounter] = [];

    const paragraphs: Paragraph[] = [];

    const titleText = `${questionObj.title}`;
    const scoreText =
      isTrusty(questionObj.userScore) || questionObj.userScore === "0"
        ? `得分: ${questionObj.userScore}`
        : undefined;

    const table = await this.renderQuestionTitleAndScore({
      title: titleText,
      alias: questionObj.alias,
      score: questionObj.score,
      userScore: scoreText,
      prefix: `${this.questionCounter}. `,
    });

    if (renderOpts.renderOptions && questionObj.options?.length) {
      await renderOpts.renderOptions(questionObj.options, this.baseUrl, paragraphs);
    }

    if (
      renderOpts.renderUserAnswer &&
      questionObj.userAnswer !== null &&
      questionObj.userAnswer !== undefined
    ) {
      await renderOpts.renderUserAnswer(questionObj.userAnswer, paragraphs);
    }

    if (
      renderOpts.renderCorrect &&
      questionObj.correctAnswer !== null &&
      questionObj.correctAnswer !== undefined
    ) {
      await renderOpts.renderCorrect(questionObj.correctAnswer, paragraphs);
    }

    if (questionObj.review) {
      await this.parseHtmlToParagraphsAsync(questionObj.review, this.baseUrl, paragraphs, {
        prefix: "解析: ",
      });
    }
    this.questionCounter++;
    return [...table, ...paragraphs];
  }
  /**
   * 单选题渲染
   */
  async createQuestionParagraphs(questionObj: QuestionDoc<{ index: number }[], number[]>) {
    return await this.renderQuestionBase(questionObj, {
      renderOptions: this.renderQuestionOptions.bind(this),
      renderUserAnswer: this.renderUserOptions.bind(this),
      renderCorrect: this.renderCorrectAnswers.bind(this),
    });
  }

  /**
   * 多选题渲染
   * @param questionObj
   * @returns
   */
  async createMultipleChoiceParagraphs(questionObj: QuestionDoc<{ index: number }[], number[]>) {
    return await this.renderQuestionBase(questionObj, {
      renderOptions: this.renderQuestionOptions.bind(this),
      renderUserAnswer: this.renderUserOptions.bind(this),
      renderCorrect: this.renderCorrectAnswers.bind(this),
    });
  }

  /**
   * 是非题渲染
   */
  async createBooleanQuestionParagraphs(questionObj: QuestionDoc<number, number>) {
    return await this.renderQuestionBase(questionObj, {
      renderOptions: (opts, baseUrl, paras) => this.renderQuestionOptions(opts, baseUrl, paras, ""),
      renderUserAnswer: async (ans, paras) =>
        await this.renderBoolQuestionAnswers(questionObj, "学生作答", ans, paras),
      renderCorrect: async (ans, paras) =>
        await this.renderBoolQuestionAnswers(questionObj, "正确答案", ans, paras),
    });
  }

  /**
   * 填空题渲染
   * @param questionObj
   * @returns
   */
  async renderFillQuestion(questionObj: QuestionDoc<string[], string[][]>) {
    return await this.renderQuestionBase(questionObj, {
      renderUserAnswer: async (userAnswer, paras) => {
        questionObj.correctAnswer?.forEach((correctArr, idx) => {
          const userAns = userAnswer?.[idx] ?? "";
          paras.push(
            new Paragraph({
              children: [
                new TextRun({ text: `第${idx + 1}空: `, bold: true }),
                new TextRun({
                  text: `学生答案: ${userAns} `,
                }),
                new TextRun({ text: "\t" }),
                new TextRun({
                  text: `正确答案: ${correctArr.join("；")}；`,
                  bold: true,
                  color: "#6ab04c",
                }),
              ],
            }),
          );
        });
        await Promise.resolve();
        return paras;
      },
    });
  }

  /**
   * 简答题渲染
   * @param question
   * @returns
   */
  async renderShortAnswerQuestion(
    questionObj: QuestionDoc<
      { answer: string; files?: { name: string; type: string; url: string }[] },
      string
    >,
  ) {
    return await this.renderQuestionBase(questionObj, {
      renderUserAnswer: async (userAnswer, paragraphs) => {
        const answerHtml = userAnswer.answer + buildShortAnswerFileToHtml(userAnswer.files);
        return await this.parseHtmlToParagraphsAsync(answerHtml, this.baseUrl, paragraphs, {
          prefix: "学生答案: ",
        });
      },
      renderCorrect: async (correctAnswer, paragraphs) => {
        return await this.parseHtmlToParagraphsAsync(correctAnswer, this.baseUrl, paragraphs, {
          prefix: "参考答案: ",
        });
      },
    });
  }
  /**
   * 阅读题
   * @param question
   * @returns
   */
  async renderReadingQuestion(questionObj: QuestionDoc<null, null>) {
    // 阅读题一般没有选项和答案，只显示题干
    return await this.renderQuestionBase(questionObj, {});
  }

  /**
   * 排序题
   * @param question
   * @returns
   */
  async renderSortQuestion(questionObj: QuestionDoc<number[], number[]>) {
    return await this.renderQuestionBase(questionObj, {
      renderOptions: async (options, baseUrl, paragraphs) => {
        const optionArr = Array.from({ length: 100 }, (_, i) => i + 1 + ".");
        return await this.renderQuestionOptions(options, baseUrl, paragraphs, optionArr);
      },
      renderUserAnswer: async (userAnswer, paragraphs) => {
        const arr = Array.from({ length: 100 }, (_, i) => i + 1);
        return await this.renderUserOptions(userAnswer, paragraphs, arr);
      },
      renderCorrect: async (correctAnswer, paragraphs) => {
        const arr = Array.from({ length: 100 }, (_, i) => i + 1);
        return await this.renderCorrectAnswers(correctAnswer, paragraphs, arr);
      },
    });
  }
  /**
   * 重置题号
   */
  resetQuestionCounter(number: number = 1) {
    this.questionCounter = number;
  }

  /**
   * 渲染题目得分
   * @param data
   * @returns
   */
  async renderQuestionTitleAndScore(data: {
    title: string;
    score: string;
    alias?: string;
    userScore?: string;
    prefix?: string;
  }) {
    const titleParagraphs: Paragraph[] = [];
    await this.parseHtmlToParagraphsAsync(
      data.title + `（${data.score}分）`,
      this.baseUrl,
      titleParagraphs,
      {
        prefix: data.prefix,
        alias: data.alias,
        suffix: new TextRun({
          text: data.userScore || "",
          color: "FF0000",
          bold: true,
        }),
      },
    );

    return titleParagraphs;
  }

  /**
   * 渲染题目选项（带 HTML 内容），按 index 排序 A、B、C…
   * @param options 题目选项数组，每项 { content: string, index: number }
   * @param baseUrl 用于解析相对路径图片/视频
   */
  async renderQuestionOptions(
    options: { content: string; index: number }[],
    baseUrl: string,
    paragraphs: Paragraph[],
    renderPrefix?: string | Array<string | number>, // 是否渲染前缀 A、B、C…
  ): Promise<Paragraph[]> {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (const opt of options) {
      const prefix = String(
        renderPrefix === undefined ? `${letters[opt.index]}、 ` : renderPrefix[opt.index] || "",
      ); // 如 "A、 "
      const optionParagraphs: Paragraph[] = [];

      // ✅ 把前缀交给 this.parseHtmlToParagraphsAsync 去塞进第一个非空段落
      await this.parseHtmlToParagraphsAsync(opt.content, baseUrl, optionParagraphs, {
        prefix,
      });

      paragraphs.push(...optionParagraphs);
    }

    return paragraphs;
  }
  /**
   * 正确答案（只显示字母 A、B、C…）
   * @param correctIndices 正确答案数组，例如 [0,2]
   * @returns Paragraph[]
   */
  async renderCorrectAnswers(
    correctIndices: number[],
    paragraphs: Paragraph[],
    disPlayText?: string | Array<string | number>,
  ) {
    if (disPlayText === undefined) disPlayText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (!correctIndices?.length) return paragraphs;

    const correctLetters = correctIndices.map((i) => disPlayText[i] || "?");

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `正确答案: ${correctLetters.join(", ")}`,
            bold: true,
            color: "#6ab04c",
          }),
        ],
        spacing: { after: 100 },
      }),
    );
    await Promise.resolve();
    return paragraphs;
  }
  /**
   * 学生选项
   * @param userOptions 学生作答数组 [{ index: number }]
   * @param optionTexts 题目选项文本数组，对应 index 顺序
   * @returns Paragraph[]
   */
  async renderUserOptions(
    userOptions: { index: number }[] | number[],
    paragraphs: Paragraph[],
    disPlayText?: string | Array<string | number>,
  ) {
    if (disPlayText === undefined) disPlayText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (!userOptions?.length) return paragraphs;

    // 将学生作答的 index 转为字母 + 文本
    const selectedOptions = userOptions.map((u: number | { index: number }) => {
      let index = typeof u === "number" ? u : u.index;
      const letter = disPlayText[index] || "?";

      return letter;
    });

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `学生作答: ${selectedOptions.join(", ")}` })],
        spacing: { after: 100 },
      }),
    );
    await Promise.resolve();
    return paragraphs;
  }

  /**
   * 是非题回答渲染
   * @param questionObj
   * @param name
   * @param index
   * @param paragraphs
   */
  async renderBoolQuestionAnswers(
    questionObj: QuestionDoc<number, number>,
    name: string,
    index: number,
    paragraphs: Paragraph[],
  ) {
    const option = questionObj.options?.find((o) => o.index === index);
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${name}: ${option?.content}`,
            bold: true,
          }),
        ],
        spacing: { after: 100 },
      }),
    );
    await Promise.resolve();
    return paragraphs;
  }

  /**
   * 将 HTML 转换为 Word 段落，支持图片、视频、文件(PDF/TXT)
   * @param html HTML 内容
   * @param baseUrl 用于拼接相对路径
   * @param paragraphs 输出段落数组
   */
  async parseHtmlToParagraphsAsync(
    html: string,
    baseUrl: string,
    paragraphs: Paragraph[],
    data?: {
      prefix?: string;
      alias?: string;
      suffix?: TextRun;
    },
  ) {
    try {
      const root = parse(html);

      let children: (ExternalHyperlink | ImageRun | TextRun)[] = [];

      // 1️⃣ 处理文本节点和其他 HTML
      const prefixRun = new TextRun({ text: data?.prefix, bold: true });
      children.push(prefixRun);
      if (data?.alias) children.push(createTag(data?.alias));
      children.push(new TextRun({ text: extractText(root.innerHTML) }));
      if (data?.suffix) {
        children.push(new TextRun({ text: "\t" }));
        children.push(data?.suffix);
      }
      paragraphs.push(
        new Paragraph({
          children: [...children],
          spacing: { after: 100 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
        }),
      );
      // 3️⃣ 处理所有附件 <span class="file-span">
      const fileList = root.querySelectorAll("span.file-span");
      if (fileList.length > 0) {
        let children: (ExternalHyperlink | TextRun)[] = [];
        for (const node of fileList) {
          const name = node.getAttribute("name");
          const type = node.getAttribute("data-type");
          let url = node.getAttribute("data-url");

          if (url) {
            if (!/^https?:\/\//.test(url)) {
              url = new URL(url, baseUrl).toString();
            }
            this.fileMap[this.questionCounter].push({
              name: name || "",
              type: type || "",
              url: url,
            });
          }

          const relativePath = `./附件/${name}`;
          children.push(
            new ExternalHyperlink({
              link: relativePath,
              children: [
                new TextRun({
                  text: name,
                  style: "Hyperlink",
                }),
              ],
            }),
          );
          children.push(new TextRun({ text: "      " })); // 添加空格分隔
        }
        paragraphs.push(
          new Paragraph({
            children,
          }),
        );
      }

      // 2️⃣ 处理所有 <img>
      const imgs = root.querySelectorAll("img");
      if (imgs.length > 0) {
        let children: ImageRun[] = [];
        for (const img of imgs) {
          const src = img.getAttribute("src");
          if (!src) continue;
          const imgRun = await createImageRun(src, baseUrl);
          if (imgRun) children.push(imgRun);

          let url = src;
          if (!/^https?:\/\//.test(src)) {
            url = new URL(src, baseUrl).toString();
          }
          this.imgMap[this.questionCounter].push({ name: img.getAttribute("alt") || "image", url });
        }
        if (children.length > 0)
          paragraphs.push(
            new Paragraph({
              children,
            }),
          );
      }
    } catch (e) {
      console.log(e);
    }
    return paragraphs;
  }
}

/**
 * 通用doc文档渲染
 * @param docObj
 * @returns
 */
export async function renderCommonDoc(docObj: CommonDoc) {
  const { name, teacherName, totalScore, finalScore, studentName, studentNumber, courseName } =
    docObj;
  const titleParagraph = new Paragraph({
    children: [new TextRun({ text: name, size: 36, bold: true })],
    alignment: AlignmentType.CENTER,
  });
  const yearAndTeacherParagraph = new Paragraph({
    children: [
      new TextRun({ text: `班级：${courseName}` }),
      new TextRun({ text: "\t" }), // 单独的 tab
      new TextRun({ text: `教师：${teacherName}` }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
  });

  const scoreParagraph = new Paragraph({
    children: [
      new TextRun({ text: `满分：${totalScore}分` }),
      new TextRun({ text: "\t" }), // 单独的 tab
      new TextRun({ text: "总得分：" }),
      new TextRun({ text: `${finalScore}`, color: "FF0000", bold: true }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
  });
  const studentParagraph = new Paragraph({
    children: [
      new TextRun({ text: "名称：" }),
      new TextRun({ text: `${studentName}` }),
      new TextRun({ text: "\t" }), // 单独的 tab
      new TextRun({ text: studentNumber ? "学号：" : "" }),
      new TextRun({ text: `${studentNumber || ""}` }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      },
    ],
  });
  const { paragraphs: questionSections, render } = await renderQuestion(docObj.questions);
  const sections = [
    titleParagraph,
    yearAndTeacherParagraph,
    scoreParagraph,
    studentParagraph,
    ...questionSections,
  ];
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  return { buffer, imgMap: render.imgMap, fileMap: render.fileMap };
}
/**
 * 题目渲染方法
 * @param questions 题目数组
 * @returns
 */
async function renderQuestion(questions: QuestionDoc<any, any>[]) {
  // - 按题目数组依次渲染并收集所有段落/表格
  // - 通过题目类型(type)或标题(title)匹配对应的渲染函数
  // - 返回最终用于生成 docx 的段落/表格集合
  const render = new DocRenderUtil();
  let paragraphs: Paragraph[] = [];
  const typeMap: Record<number, (q: any) => Promise<Paragraph[]>> = {
    1: render.createQuestionParagraphs.bind(render),
    2: render.createMultipleChoiceParagraphs.bind(render),
    3: render.createBooleanQuestionParagraphs.bind(render),
    4: render.renderFillQuestion.bind(render),
    5: render.renderShortAnswerQuestion.bind(render),
    0: render.renderReadingQuestion.bind(render),
    6: render.renderSortQuestion.bind(render),
  };
  paragraphs.push(new Paragraph({})); // 题目间空一行
  for (const question of questions) {
    if (typeMap[question.type]) {
      paragraphs.push(...(await typeMap[question.type](question)));
      paragraphs.push(new Paragraph({})); // 题目间空一行
    }
  }
  return { paragraphs, render };
}

/**
 * 提取Html的文本内容
 * @param content HTML内容
 * @returns
 */
function extractText(content: string): string {
  let result = content;
  const excludeTags = ["img", "span", "pre"];
  // 1️⃣ 先去掉排除标签及其内容
  excludeTags.forEach((tag) => {
    const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    result = result.replace(re, "");
  });

  // 2️⃣ 再去掉所有 HTML 标签
  result = result.replace(/<[^>]+>/g, "");

  //去除&nbsp;
  result = result.replace(/&nbsp;/g, "");

  // 3️⃣ 转换多个空格、换行为一个空格，去首尾空格
  result = result.replace(/\s+/g, " ").trim();

  return result;
}
/**
 * 下载网络图片并生成 ImageRun
 * @param src 图片 URL 或相对路径
 * @param baseUrl 基础 URL，用于解析相对路径
 * @param width 图片宽度
 * @param height 图片高度
 * @returns ImageRun 实例
 */
export async function createImageRun(
  src: string,
  baseUrl: string,
  width = 300,
  height = 200,
): Promise<ImageRun | null> {
  try {
    const res = await UndiciUtil.retry({
      url: baseUrl + src,
      method: "GET",
      headers: { "Content-Type": "application/octet-stream" },
    });

    const imgBuffer = Buffer.from(await res.body.arrayBuffer());
    const type = getImageType(src);

    const options: IImageOptions = {
      data: imgBuffer,
      transformation: { width, height },
      type,
    };
    return new ImageRun(options);
  } catch (err) {
    console.error(`图片下载异常: ${src}`, err);
    return null;
  }
}

/**
 * 根据图片 URL 后缀返回 docx 支持的类型
 */
function getImageType(url: string) {
  const ext = url.substring(url.lastIndexOf(".")).toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "gif":
      return "gif";
    case "bmp":
      return "bmp";

    default:
      return "png"; // 默认 png
  }
}

export function createTag(text: string, color = "616161", background = "EBEBEB") {
  return new TextRun({
    text: `[${text}]`,
    color, // 文字颜色
    bold: true, // 加粗
    // shading: {
    //   // 背景色
    //   type: 'clear',

    //   fill: background,
    // },
  });
}

/**
 * 将简答题的文件列表渲染为 HTML 字符串，供parseHtmlToParagraphsAsync解析
 * @param files 文件列表
 * @returns
 */
export function buildShortAnswerFileToHtml(files?: { url: string; name: string; type: string }[]) {
  if (!files?.length) return "";
  const imageTypes = [
    "jpg",
    "jpeg",
    "jfif",
    "png",
    "gif",
    "bmp",
    "dib",
    "tif",
    "tiff",
    "webp",
    "svg",
    "wmf",
    "emf",
    "ico",
  ];

  const filesHtml = files
    .map((file) => {
      if (imageTypes.includes(file.type.toLowerCase())) {
        // 图片直接用 <img>
        return `<img src="${file.url}" alt="${file.name}" class="file-image" />`;
      } else {
        // 其他文件用 <span>
        return `<span name="${file.name}.${file.type}" data-url="${file.url}" data-type="${file.type}" class="file-span file-${file.type}"></span>`;
      }
    })
    .join(" ");
  return filesHtml;
}
