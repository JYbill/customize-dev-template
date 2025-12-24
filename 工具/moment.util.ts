import moment from "moment";

export class MomentUtil {
  /**
   * 是否是一个合法的日期字符串、Moment对象、Date对象之一
   * Invalid Date 为 false
   * 启用了moment ISO字符串严格模式，所以数值也为false
   */
  static isValid(date: MomentDateTime) {
    if (typeof date === "number" || typeof date === "boolean" || typeof date === "symbol" || typeof date === "bigint") return false;
    if (date instanceof Date) return !Number.isNaN(date.valueOf());
    const momentDate = moment(date, moment.ISO_8601, true);
    return momentDate.isValid();
  }

  /**
   * 检查日期时间是否符合格式化参数
   * @param datetime 日期时间
   * @param formatQuery 格式化参数
   */
  static isValidByFormat(datetime: MomentDateTime, formatQuery = "HH:mm:ss.SSS") {
    return moment(datetime, formatQuery, true).isValid();
  }
  /**
   * 统一时间格式
   * @param date
   * @param format "HH:mm:ss.SSS"
   */
  static unifyTime(date: MomentDateTime, format: string) {
    return moment(date, format).format("HH:mm:ss.SSS");
  }

  /**
   * 统一时间日期格式
   */
  static unifyDateTime(date: MomentDateTime) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }
  /**
   * 0时区统一时间日期格式
   */
  static unifyUTCDateTime(date: MomentDateTime) {
    return moment(date).utc().format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * 统一日期格式
   * @param date
   */
  static unifyDate(date: MomentDateTime) {
    return moment(date).format("YYYY-MM-DD");
  }

  /**
   * 获取下一分钟最开始的时间
   * @param date
   */
  static getTimeOfEndMinute(date: MomentDateTime) {
    date = moment(date).add(1, "minute").startOf("minute");
    return MomentUtil.unifyDateTime(date);
  }

  /**
   * 将date添加指定的num时间，单位为unit
   * @param date
   * @param num
   * @param unit 参考moment时间
   */
  static addTime(date: MomentDateTime, num: number, unit: unitOfTime.DurationConstructor) {
    return moment(date).add(num, unit);
  }

  /**
   * 将date减少指定的num时间，单位为unit
   * @param date
   * @param num
   * @param unit 参考moment时间
   */
  static subtractTime(date: MomentDateTime, num: number, unit: unitOfTime.DurationConstructor) {
    return moment(date).subtract(num, unit);
  }

  /**
   * 根据格式，获取总秒数 "00:01:00"(HH:mm:ss.SSS) -> 60s
   * @param timeStr
   * @param format
   */
  static getSecondsByFormat(timeStr: string, format: string = "HH:mm:ss.SSS") {
    return moment.duration(MomentUtil.unifyTime(timeStr, format)).asSeconds();
  }

  /**
   * 获取datetime，从unit开始，"date"即为
   */
  static getDateTimeOfUnit({ datetime, unit = "date" }: { datetime: MomentDateTime; unit?: MomentStartOf }) {
    let result: Moment | null = null;
    if (datetime) {
      result = moment(datetime);
    } else {
      result = moment();
    }
    return result.startOf(unit);
  }

  /**
   * 零点的日期时间
   * @param date
   */
  static zeroPointDateTime(date: MomentDateTime) {
    return moment(date).format("YYYY-MM-DD 00:00:00");
  }

  /**
   * 从源时间给目标时间设置时、分、秒、毫秒
   * @param targetDate
   * @param originDate
   */
  static setTimeByDate(targetDate: MomentDateTime, originDate: MomentDateTime) {
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
   */
  static setDateByOriginDate(targetDate: MomentDateTime, originDate: MomentDateTime, units: MomentUnitAll[] = ["year", "month", "date"]) {
    originDate = moment(originDate);
    let resultDate = moment(targetDate);
    for (const unit of units) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call
      resultDate.set(unit, originDate[unit]());
    }
    return MomentUtil.unifyDateTime(resultDate);
  }

  /**
   * target在[startPoint, endPoint]区间范围内
   * @param target
   * @param startPoint
   * @param endPoint
   */
  static inTheDateRange(target: MomentDateTime, startPoint: MomentDateTime, endPoint: MomentDateTime) {
    target = moment(target);
    startPoint = moment(startPoint);
    endPoint = moment(endPoint);
    return target.isSameOrAfter(startPoint) && target.isSameOrBefore(endPoint);
  }

  /**
   * target在startPoint的左侧，也就是说target < startPoint时间点
   * @param target
   * @param startPoint
   */
  static inTheDateRangLeft(target: MomentDateTime, startPoint: MomentDateTime) {
    target = moment(target);
    startPoint = moment(startPoint);
    return target.isBefore(startPoint);
  }

  /**
   * target在endPoint的右侧，也就是说target > endPoint时间点
   * @param target
   * @param endPoint
   */
  static inTheDateRangRight(target: MomentDateTime, endPoint: MomentDateTime) {
    target = moment(target);
    endPoint = moment(endPoint);
    return target.isAfter(endPoint);
  }

  /**
   * 将日期时间字符串转换为从当天 00:00:00 开始计算的秒数
   * @param dateTimeStr - 日期时间字符串，格式：YYYY-MM-DD HH:MM:SS
   * @returns 从当天 00:00:00 开始的秒数
   */
  static getSecondsFromStartOfDay(dateTimeStr: string) {
    // 创建日期对象
    const date = new Date(dateTimeStr);

    // 获取当天 00:00:00 的时间戳（毫秒）
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    // 计算与当天开始的时间差（毫秒）
    const timeDiff = date.getTime() - startOfDay;

    // 转换为秒并向下取整
    return Math.floor(timeDiff / 1000);
  }

  /**
   * 秒、分钟、小时等数值，转换成指定的format格式
   */
  static numberToFormat(num: number, unit: MomentDurationUnit, format = "HH:mm:ss.SSS") {
    const duration = moment.duration(num, unit);
    const formatted = moment.utc(duration.asMilliseconds()).format(format);
    return formatted;
  }
}
