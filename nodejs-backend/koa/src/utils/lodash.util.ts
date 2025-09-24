import _, { type Dictionary, type ValueIteratee } from "lodash";

import { HttpError } from "#error/http-error.ts";
import { Nanoid } from "#lib/nanoid/index.ts";
import type { Falsy, InValidValue, TemplateParams, Truthy, ValidValue } from "#types/lodash.d.ts";

const processAnswer = (content: string) => {
  return content
    .replace(/\\u000[0-9a-f]/g, "")
    .replace(/\\[trn]/g, "")
    .replace(/\\u001[0-9a-f]/g, "");
};

/**
 * 根据rank数值，计算出它对应的英文字母
 * 如：1 -> A, 26 -> Z, 27 -> AA, 53 -> BA
 */
const fromCharCode = (rank: number) => {
  let code = "";
  while (rank > 0) {
    let m = rank % 26;
    if (m === 0) {
      m = 26;
    }
    code = `${String.fromCharCode(m + 64)}${code}`;
    rank = Math.floor((rank - m) / 26);
  }
  return code;
};

const trimStem = (content: string, len: number = 10) => {
  const trimmed = content
    .replace(/\n/g, "")
    .replace(/\t/g, "")
    .replace(/&nbsp;/g, " ") // 空格
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&ldquo;/g, "“") // 中文左半双引号
    .replace(/&rdquo;/g, "”") // 中文右半双引号
    .replace(/&lsquo;/g, "‘") // 中文左半单引号
    .replace(/&rsquo;/g, "’") // 中文右半单引号
    .replace(/&middot;/g, "·")
    .replace(/&bull;/g, "•")
    .replace(/&mdash;/g, "—") // 长一点
    .replace(/&ndash;/g, "–") // 短一点
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/<img[^>]+>/g, "【图片】")
    .replace(/<[^>]+>/g, "")
    .replace(/ +/g, " ");

  if (len > 0) {
    return _.truncate(trimmed, { length: len });
  } else {
    return trimmed;
  }
};

const formatQuestionType = (type, tag = 0) => {
  //  1 单选, 2 多选, 3 是非,4 填空, 5 简答
  // 0阅读，1单选，2填空，3多选，4无答案多选，5无答案单选，
  // 6主观题，7无答案填空，8组卷，9是非 10 无标签是非题  11 简答题
  if (tag === 0) {
    let newType = 0;
    if (type === 0 || type === 11) {
      newType = 5;
    } else if (type === 1 || type === 5) {
      newType = 1;
    } else if (type === 2 || type === 7) {
      newType = 4;
    } else if (type === 9 || type === 10) {
      newType = 3;
    } else if (type === 3 || type === 4) {
      newType = 2;
    }
    return newType;
  } else {
    let newType = "";
    switch (type) {
      case 1:
        newType = "1,5";
        break;
      case 2:
        newType = "3,4";
        break;
      case 3:
        newType = "9,10";
        break;
      case 4:
        newType = "2,7";
        break;
      case 5:
        newType = "0,11";
        break;
    }
    return newType;
  }
};

const getQuestionCover = (content: string) => {
  let image = "";
  const match = content.match(/<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/);
  if (match && match.length >= 2) {
    image = match[1];
  }
  return image;
};

/**
 * 获取指定长度的随机字符
 * @param num
 */
export const getRandomStrByNum = (num = 10) => {
  return Nanoid.NumberNanoid(32).slice(0, num);
};

/**
 * mysql snake命名转驼峰命名
 * @param object
 */
export const objectToCamelCase = <T extends object>(object: T): Dictionary<T[keyof T]> => {
  return _.mapKeys<T>(object, (_v, k) => _.camelCase(k));
};

/**
 * pick / omit包装工具
 * @param object
 * @param options 类型{ isPick, fields }: { isPick: boolean, fields: string[] }
 * @example
 *   pickOrOmitWrapper({ ... }, {
 *     isPick: true, // true:提取；false：剔除（默认）
 *     fields: [
 *       "id", // courseId
 *       "teacher_id",
 *     ]
 *   })
 */
export const pickOrOmitWrapper: <T extends object, Key extends keyof T>(
  object: T,
  options: { isPick?: boolean; fields: readonly Key[] | Key[] },
) => Pick<T, Key> | Omit<T, Key> = (object, options) => {
  const { isPick, fields } = options;
  if (typeof isPick !== "boolean" || fields?.length <= 0) {
    throw HttpError.throwServerError("pickOrOmitWrapper options error");
  }
  if (isPick) {
    return _.pick(object, fields);
  } else {
    return _.omit(object, fields);
  }
};

/**
 * 数组转k-v对象
 * @param array
 * @param fieldOrCallback
 */
export const array2Map = <T>(array: T[], fieldOrCallback: ((item: T) => string) | string) => {
  return _.keyBy(array, fieldOrCallback);
};

export const isFalsy = <T>(value: T): value is Falsy<T> => {
  // 对象
  if (_.isObjectLike(value)) {
    if (value instanceof Date) {
      return isNaN(new Date().getTime());
    }
    return _.isEmpty(value);
  } else {
    return !value;
  }
};

export const isTrusty = <T>(value: T): value is Truthy<T> => !isFalsy(value);

/**
 * 分组工具
 * @param list 数组
 * @param groupFilter 分组回掉函数（根据返回值分组） ｜ 字段
 */
export const groupBy = <T extends object>(list: T[], groupFilter: ValueIteratee<T>) => {
  return _.groupBy<T>(list, groupFilter);
};

/**
 * 根据num参数分割数组为二维数组
 * @param list
 * @param num 默认10个一组
 * @returns
 */
export const groupByNum = <T extends string | number>(list: T[], num: number = 10) => {
  const expireGroups: T[][] = [];
  let per10: T[] = [];
  const n = list.length;
  for (let i = 0; i < n; i++) {
    const el = list[i].valueOf() as T;
    if (i !== 0 && i % num === 0) {
      expireGroups.push(per10);
      per10 = [el];
      continue;
    } else if (i === n - 1) {
      per10.push(el);
      expireGroups.push(per10);
      continue;
    }
    per10.push(el);
  }
  return expireGroups;
};

export const safeJsonParse = (jsonString: string | null, returnOriginIfError: boolean = false) => {
  try {
    // JSON.parse是可以处理null类型的，所以使用了非空断言
    return JSON.parse(jsonString!) as Record<string, any> | any[];
  } catch (error) {
    console.error("JSON parse error:", error);
    if (returnOriginIfError) {
      return jsonString;
    } else {
      return null;
    }
  }
};

/**
 * 慎用，仅跳过 基本类型、数组、对象、函数、日期
 */
export const camelCase = (object: any, seen = new WeakSet()) => {
  if (_.isArray(object)) {
    // 如果是数组，递归处理每个元素
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return object.map((item) => camelCase(item, seen));
  } else if (_.isObject(object) && !_.isFunction(object) && !_.isDate(object)) {
    // 检查是否已经访问过该对象
    if (seen.has(object)) {
      return object; // 如果是循环引用，直接返回原对象
    }
    seen.add(object); // 将当前对象加入 WeakSet

    // 递归处理对象的键和值
    return _.mapKeys(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      _.mapValues(object, (value) => camelCase(value, seen)), // 递归处理值
      (_v, k) => _.camelCase(k), // 转换键为 camelCase
    );
  }
  // 如果是基本类型，直接返回
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return object;
};

function buildOrderBy(data: { orderBy?: string; order?: string }) {
  let res = "";
  if (isFalsy(data.orderBy)) return res;
  res = data.orderBy;
  if (isFalsy(data.order)) return res;
  return `${res} ${data.order}`;
}
/**
 * 随机打乱函数
 * @param {Array} array
 * @returns
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]; // 避免原地修改
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 使用对象数据替换模板字符串中的变量，支持嵌套属性访问。
 * @param template 模板字符串，如 "Hello, {{user.name}}"
 * @param data 数据对象，支持嵌套
 * @param baseUrl
 */
export function renderTemplateString<T extends string>(
  template: T,
  data: TemplateParams<T>,
  baseUrl: string = "",
): string {
  return (
    baseUrl +
    template.replace(/\{\{([\w.]+)\}\}/g, (_, rawPath: string) => {
      const keys = rawPath.trim().split(".") as Array<keyof any>;
      let result: unknown = data;

      for (const key of keys) {
        if (typeof result === "object" && result !== null && key in result) {
          result = (result as Record<string, unknown>)[key as string];
        } else {
          result = "";
          break;
        }
      }

      return result !== null ? String(result as string) : "";
    })
  );
}

/**
 * 判断value是否为合法值，只有NAN、undefined、null、Invalid Date视为无效值
 */
export function isValidValue<T>(value: T): value is ValidValue<T> {
  // 处理undefined和null
  if (value === undefined || value === null) {
    return false;
  }

  // 处理NaN
  if (typeof value === "number" && isNaN(value)) {
    return false;
  }

  // 处理Invalid Date
  if (value instanceof Date && isNaN(value.getTime())) {
    return false;
  }

  // 其他所有值都视为有效值
  return true;
}

/**
 * isValidValue 取反，语义化工具
 * @param value
 */
export function isInvalidValue<T>(value: T): value is InValidValue<T> {
  return !isValidValue(value);
}

export {
  fromCharCode,
  trimStem,
  processAnswer,
  formatQuestionType,
  getQuestionCover,
  buildOrderBy,
  shuffle,
};
