import dateFns from "date-fns";
import type { DateArg } from "date-fns";

export class DatetimeUtil {
  /**
   * 统一时间日期格式
   * @param date
   */
  static unifyDateTime(date: DateArg<Date>) {
    return dateFns.format(date, "yyyy-MM-dd HH:mm:ss");
  }

  /**
   * 统一格式为ISO字符串
   * @param date
   */
  static unifyDateTimeISO(date: DateArg<Date>): string {
    return dateFns.formatISO(date);
  }

  /**
   * 统一日期格式
   * @param date
   */
  static unifyDate(date: DateArg<Date>) {
    return dateFns.format(date, "yyyy-MM-dd");
  }

  /**
   * 零点的日期时间
   * @param date
   */
  static zeroPointDateTime(date: DateArg<Date>) {
    return dateFns.format(date, "yyyy-MM-dd 00:00:00");
  }

  /**
   * 活钱timestamp前n分钟的日期对象
   * @param timestamp
   * @param n
   */
  static beforeNMinute(timestamp: number | string, n = 5) {
    return dateFns.subMinutes(new Date(timestamp), n);
  }
}
