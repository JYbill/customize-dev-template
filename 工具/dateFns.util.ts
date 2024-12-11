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
}
