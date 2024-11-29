import moment from "moment";

export class MomentUtil {
  /**
   * 统一时间日期格式
   */
  static unifyDateTime(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * 统一日期格式
   * @param date
   * @return {string}
   */
  static unifyDate(date) {
    return moment(date).format("YYYY-MM-DD");
  }

  /**
   * 零点的日期时间
   * @param date
   * @return {string}
   */
  static zeroPointDateTime(date) {
    return moment(date).format("YYYY-MM-DD 00:00:00");
  }

  /**
   * 从源时间给目标时间设置时、分、秒、毫秒
   * @param targetDate
   * @param originDate
   */
  static setTimeByDate(targetDate, originDate) {
    originDate = moment(originDate);
    const resultDate = moment(targetDate)
      .set("hour", originDate.hour())
      .set("minute", originDate.minute())
      .set("second", originDate.second())
      .set("millisecond", originDate.millisecond());
    return MomentUtil.unifyDateTime(resultDate);
  }

  /**
   * 从源日期目标设置年、月、日时间并格式化返回
   * @param targetDate
   * @param originDate
   * @param units 默认需要设置的单位["year", "month", "date"]
   * @return {string}
   */
  static setDateByOriginDate(
    targetDate,
    originDate,
    units = ["year", "month", "date"],
  ) {
    originDate = moment(originDate);
    let resultDate = moment(targetDate);
    for (const unit of units) {
      resultDate.set(unit, originDate[unit]());
    }
    return MomentUtil.unifyDateTime(resultDate);
  }

  /**
   * 获取下一分钟最开始的时间
   * @param date
   * @return {string}
   */
  static getTimeOfEndMinute(date) {
    date = moment(date).add(1, "minute").startOf("minute");
    return MomentUtil.unifyDateTime(date);
  }

  /**
   * target在[startPoint, endPoint]区间范围内
   * @param target
   * @param startPoint
   * @param endPoint
   * @return {boolean}
   */
  static inTheDateRange(target, startPoint, endPoint) {
    target = moment(target);
    startPoint = moment(startPoint);
    endPoint = moment(endPoint);
    return target.isSameOrAfter(startPoint) && target.isSameOrBefore(endPoint);
  }

  /**
   * target在startPoint的左侧，也就是说target < startPoint时间点
   * @param target
   * @param startPoint
   * @return {boolean}
   */
  static inTheDateRangLeft(target, startPoint) {
    target = moment(target);
    startPoint = moment(startPoint);
    return target.isBefore(startPoint);
  }

  /**
   * target在endPoint的右侧，也就是说target > endPoint时间点
   * @param target
   * @param endPoint
   * @return {boolean}
   */
  static inTheDateRangRight(target, endPoint) {
    target = moment(target);
    endPoint = moment(endPoint);
    return target.isAfter(endPoint);
  }
}
