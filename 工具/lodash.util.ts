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
export const isFalsy = (value) => {
  // 对象
  if (_.isObjectLike(value)) {
    return _.isEmpty(value);
  } else {
    return Boolean(value) === false;
  }
};

/**
 * isFalsy的取反，目的语义化
 * @param value
 * @return {boolean}
 */
export const isTrusty = (value) => !isFalsy(value);

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
