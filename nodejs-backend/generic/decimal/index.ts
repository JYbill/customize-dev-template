import { Decimal } from "decimal.js";

/**
 * @Description: 生成Decima构造函数，避免直接对Decimal原型操作污染全局环境
 * @Date: 2025/7/26 11:16
 */

/**
 * 通过decimal config配置生成一个Decima.js的构造函数
 * - 使用
 * ```ts
 * // 构造一个有效数字为5的构造函数，后续的计算操作只会保留5位有效数字，如果超过5位默认四舍五入
 * const Dec = genDecimaConstruct({ precision: 5 });
 * const dec = new Dec("10");
 * console.log(dec.div(3).toString()); // 3.3333
 * ```
 * @param config
 */
export function genDecimaConstruct(config: Decimal.Config) {
  return Decimal.clone(config);
}

/**
 * 成绩中心 - 计算学生成绩使用
 */
export const GradeDecimal = genDecimaConstruct({ precision: 10 });

/**
 * 成绩中心 - 计算每个活动的分数使用
 */
export const CalcActivityDecimal = genDecimaConstruct({
  precision: 5,
  rounding: Decimal.ROUND_DOWN,
});
