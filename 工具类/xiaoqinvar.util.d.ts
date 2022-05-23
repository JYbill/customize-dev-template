/**
 * @time 2022/5/9 13:56
 * @author xiaoqinvar
 * @desc 常用字符串、文件/目录操作、数字工具类、常用正则表达式
 * @dependence diff.js
 */
export declare class xiaoQinVarUtil {
    private readonly Regex_matchAll;
    /**
     * 随机获取UUID
     * @returns string
     */
    static uuid(): string;
    /**
     * 日期格式化
     * @param fmt
     * @param date
     * @returns
     */
    static dateFormat(fmt: string, date: Date): string;
    /**
     * 使用Ecmascript默认的时间处理格式化, 最后得到的数据是: 2022/2/23 15:38:46, 需要进一步可以转换自己
     * @param date 日期、时间戳
     * @param option 没有使用默认的, 有用自己的
     * @returns
     */
    static dateFormatByEcma(date: Date | number, option?: any): string;
    /**
     * 文件名获取随机文件名  abc.jpg => abc_89dac30047f7.jpg
     * @param filename
     * @returns
     */
    static randomFileName(filename: String): string;
    /**
     * 获取前一天和后一天的时间戳
     * @returns [昨天0点时间戳, 明天0点时间戳]
     */
    static getBeforeAndAfterTime(date?: Date): number[];
    /**
     * 随机字符串
     * 默认10位
     */
    static randomString(num?: number): string;
    /**
     * 防抖函数
     * @param func 回调函数callback
     * @param delay 延迟时间ms
     * @returns
     */
    static debounce(func: Function, delay: number): Function;
    /**
     * 节流函数
     * @param func 回调函数
     * @param time 延迟
     */
    private static timer;
    static throttle(time: number, func: Function, ...args: any[]): void;
    /**
     * diff工具
     * @param diffArr
     * @param i
     * @returns 返回新增之前的所有字符片段
     */
    static diffUtil(diffArr: any, i: any): any;
    static str2StrByFlag(str: string, insertStr: string, strFlag: string): string;
    /**
     * 数字 + 字符组成的随机字符串
     */
    static randomNumberAndString(): string;
    /**
     * 获取随机数字字符串
     * @param length 长度
     */
    static randomNumberString(length: number): string;
}
