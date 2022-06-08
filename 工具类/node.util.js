"use strict";
exports.__esModule = true;
exports.NodeUtil = void 0;
/**
 * @time 2022/5/30 16:38
 * @author xiaoqinvar
 * @desc 常用node工具封装，文件、流、buffer、crypto
 * @dependence node
 */
var crypto = require("crypto");
var NodeUtil = /** @class */ (function () {
    function NodeUtil() {
    }
    /**
     * md5盐值加密返回结果字符串
     * @param text
     * @param salt
     */
    NodeUtil.md5SlotCrypto = function (text, salt) {
        if (salt === void 0) { salt = ''; }
        return crypto.createHash('md5').update(text + salt).digest('hex');
    };
    return NodeUtil;
}());
exports.NodeUtil = NodeUtil;
