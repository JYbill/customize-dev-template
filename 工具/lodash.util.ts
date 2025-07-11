import _ from "lodash";

/**
 * mysql snake命名转驼峰命名
 * @param object
 * @returns {*}
 */
export const objectToCamelCase = (object) => {
  return _.mapKeys(object, (_v, k) => _.camelCase(k));
};

/**
 * 是为false的内容：{}、[]、false、0、'0'
 * @param value
 * @return {boolean}
 */
type Falsy<T> = T extends false | 0 | "" | null | undefined | 0n | never[] | Record<string, never>
  ? T
  : never;
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

/**
 * isFalsy的取反，目的语义化
 * @param value
 */
type Truthy<T> = T extends false | 0 | "" | null | undefined | 0n | never[] | Record<string, never>
  ? never
  : T;
export const isTrusty = <T>(value: T): value is Truthy<T> => !isFalsy(value);

/**
 * 根据omitList排除指定的字段，并返回全新的对象
 * omitObject({a: 1, b: 2, c: 3}, ['a', 'b']) -> {c: 3}
 * @param object
 * @param omitList
 */
export function omitObject<T extends object, K extends keyof T>(object: T, omitList: K[]) {
  return _.omit(object, omitList);
}

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
export const pickOrOmitWrapper = (object, options) => {
  const { isPick, fields } = options;
  if (typeof isPick !== "boolean" || fields?.length <= 0) {
    throw new Error("pickOrOmitWrapper options error");
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
 * @return {Dictionary<unknown>}
 */
export const array2Map = (array, fieldOrCallback) => {
  return _.keyBy(array, fieldOrCallback);
};
