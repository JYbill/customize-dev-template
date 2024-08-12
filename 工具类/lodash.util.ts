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
export const isFalsy = (value) => _.isEmpty(value);

/**
 * 根据omitList排除指定的字段，并返回全新的对象
 * omitObject({a: 1, b: 2, c: 3}, ['a', 'b']) -> {c: 3}
 * @param object
 * @param omitList
 * @return {Pick<object, Exclude<keyof object, [undefined][number]>>}
 */
export const omitObject = (object, omitList) => _.omit(object, omitList);
