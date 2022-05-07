"use strict";
exports.__esModule = true;
exports.xiaoQinVarUtils = void 0;
/**
 * xiaoQinVar自己封装的常用工具类
 */
var xiaoQinVarUtils = /** @class */ (function () {
    function xiaoQinVarUtils() {
        this.Regex_matchAll = /.*测试.*/ig;
    }
    /**
     * 获取UUID
     * @returns
     */
    xiaoQinVarUtils.uuid = function () {
        return 'xxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    /**
     * 日期格式化
     * @param fmt
     * @param date
     * @returns
     */
    xiaoQinVarUtils.dateFormat = function (fmt, date) {
        date instanceof Date ? '' : date = new Date(date);
        var ret;
        var opt = {
            "Y+": date.getFullYear().toString(),
            "m+": (date.getMonth() + 1).toString(),
            "d+": date.getDate().toString(),
            "H+": date.getHours().toString(),
            "M+": date.getMinutes().toString(),
            "S+": date.getSeconds().toString() // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (var k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1)
                    ?
                        (opt[k])
                    :
                        (opt[k].padStart(ret[1].length, "0")));
            }
            ;
        }
        ;
        return fmt;
    };
    /**
     * 使用Ecmascript默认的时间处理格式化, 最后得到的数据是: 2022/2/23 15:38:46, 需要进一步可以转换自己
     * @param date 日期、时间戳
     * @param option 没有使用默认的, 有用自己的
     * @returns
     */
    xiaoQinVarUtils.dateFormatByEcma = function (date, option) {
        return option ?
            new Intl.DateTimeFormat('zh-CN', option).format(date)
            :
                new Intl.DateTimeFormat('zh-CN', {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false
                }).format(date);
    };
    /**
     * 文件名获取随机文件名  abc.jpg => abc_89dac30047f7.jpg
     * @param filename
     * @returns
     */
    xiaoQinVarUtils.randomFileName = function (filename) {
        var separator = '.';
        var fileNameArr = filename.split(separator);
        return fileNameArr[0] + '_' + this.uuid() + '.' + fileNameArr[1];
    };
    /**
     * 获取前一天和后一天的时间戳
     * @returns [昨天0点时间戳, 明天0点时间戳]
     */
    xiaoQinVarUtils.getBeforeAndAfterTime = function (date) {
        if (date === void 0) { date = new Date(); }
        var before = date;
        before.setMinutes(0);
        before.setSeconds(0);
        before.setMilliseconds(0);
        before.setUTCHours(0);
        var after = new Date(before);
        after.setDate(after.getDate() + 1);
        return [+new Date(before), +new Date(after)];
    };
    /**
     * 随机字符串
     * 默认10位
     */
    xiaoQinVarUtils.randomString = function (num) {
        if (num === void 0) { num = 0; }
        return Math.random().toString(36).split('.')[1].substring(num);
    };
    /**
     * 防抖函数
     * @param func 回调函数callback
     * @param delay 延迟时间ms
     * @returns
     */
    xiaoQinVarUtils.debounce = function (func, delay) {
        // 起始时间戳
        var startTimeStamp = 0;
        // 定时器
        var timer = null;
        return function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i] = arguments[_i];
            }
            // 当前的时间戳
            var nowTimeStamp = +new Date();
            if (nowTimeStamp - startTimeStamp >= delay) { // 校验 - 允许执行
                console.log('立即执行时间', new Date().getSeconds());
                // 执行函数
                func.call(func, arg);
                // 继续初始化下一个运行立即执行的时间戳
                startTimeStamp = +new Date();
            }
            else { // 校验 - 不允许执行，且重置结束时间戳
                clearTimeout(timer);
                // 重置定时器
                timer = setTimeout(function () {
                    console.log('定时器执行时间', new Date().getSeconds());
                    func.call(func, arg);
                    clearTimeout(timer);
                    startTimeStamp = +new Date();
                }, delay);
                startTimeStamp = +new Date();
            }
        };
    };
    xiaoQinVarUtils.throttle = function (time, func) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (!xiaoQinVarUtils.timer) {
            console.log('允许执行', new Date().getMilliseconds());
            // 执行到这里说明没有定时器, 执行并添加定时器
            func.call(this, args);
            xiaoQinVarUtils.timer = setTimeout(function () {
                // 清空定时器
                clearTimeout(xiaoQinVarUtils.timer);
                xiaoQinVarUtils.timer = null;
            }, time);
        }
        console.log('节流中...', new Date().getMilliseconds());
    };
    /**
     * diff工具
     * @param diffArr
     * @param i
     * @returns 返回新增之前的所有字符片段
     */
    // 得到新增前的字符串，排除removed的字符串
    xiaoQinVarUtils.diffUtil = function (diffArr, i) {
        // 排除自身
        for (var index = i - 1; index >= 0; index--) {
            if (diffArr[index].removed) {
                continue;
            }
            return diffArr[index].value;
        }
    };
    // 根据上面方法获取的字符片段插入insertStr字符串，
    xiaoQinVarUtils.prototype.str2StrByFlag = function (str, insertStr, strFlag) {
        var index; // 插入下标
        if (strFlag == '') {
            index = 0;
        }
        else {
            index = str.search(strFlag) + strFlag.length;
        }
        // console.log('str2StrByFlag:index', index);
        return str.slice(0, index) + insertStr + str.slice(index);
    };
    /**
     * 节流函数
     * @param func 回调函数
     * @param time 延迟
     */
    // 定时器
    xiaoQinVarUtils.timer = null;
    return xiaoQinVarUtils;
}());
exports.xiaoQinVarUtils = xiaoQinVarUtils;
