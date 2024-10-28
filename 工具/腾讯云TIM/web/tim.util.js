"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TimUtil = void 0;
/**
 * @time 2022/5/6 17:52
 * @author xiaoqinvar
 * @desc 腾讯云即时通讯 TIM SDK 静态工具类
 * @dependence tim-js-sdk、@techower/tim-js-sdk
 */
var tim_js_sdk_1 = require("tim-js-sdk");
var TimUtil = /** @class */ (function () {
    function TimUtil() {
    }
    /**
     * 会先logout登出再断开ws连接，如果要退群用quitOrDismissGroup方法，该功能为离线功能
     * @param tim
     */
    TimUtil.destroy = function (tim) {
        tim.destroy();
    };
    /**
     * 静态代理：同步、异步执行，查询当前用户在群内的角色，再判断(群员)退出群、(群主)解散群，包含TIM SDK登出和销毁
     * @param tim
     * @param roomId
     * @param uid
     */
    TimUtil.quitOrDismissGroup = function (tim, roomId, uid) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TimUtil.quitGroup(tim, roomId, uid)];
                    case 1:
                        promise = _a.sent();
                        return [2 /*return*/, TimUtil.destroy(tim)];
                }
            });
        });
    };
    /**
     * 只进行群主解散群 or 群成员退出群
     * @param tim
     * @param roomId
     * @param uid
     */
    TimUtil.quitGroup = function (tim, roomId, uid) {
        return __awaiter(this, void 0, void 0, function () {
            var data, promise, memberList, _i, memberList_1, member, role, userID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tim.getGroupMemberProfile({
                            groupID: roomId,
                            userIDList: [uid]
                        })];
                    case 1:
                        data = (_a.sent()).data;
                        memberList = data.memberList;
                        console.log("== debug member list", memberList);
                        for (_i = 0, memberList_1 = memberList; _i < memberList_1.length; _i++) {
                            member = memberList_1[_i];
                            role = member["role"];
                            userID = member["userID"];
                            // console.log("== debug quitGroup", role);
                            if (userID === uid) {
                                switch (role) {
                                    // 群员
                                    case tim_js_sdk_1.TYPES.GRP_MBR_ROLE_MEMBER:
                                        promise = tim.quitGroup(roomId);
                                        break;
                                    // 群主
                                    case tim_js_sdk_1.TYPES.GRP_MBR_ROLE_OWNER:
                                        console.log("== debug member list", role, userID);
                                        promise = tim.dismissGroup(roomId);
                                        break;
                                }
                                break;
                            }
                        }
                        // 不使用await，用promise异步并行提升效率
                        // 即使抛出群被解散错误，同样执行销毁操作
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    /**
     * 获取并返回群内成员
     * @param tim sdk
     * @param roomId 房间id
     * @param count 一次返回的总数，最大100，100可能数据量过大返回失败
     * @param offset 偏移量
     */
    TimUtil.getMemberList = function (tim, roomId, count, offset) {
        if (count === void 0) { count = 30; }
        if (offset === void 0) { offset = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tim.getGroupMemberList({
                            groupID: roomId, count: count,
                            offset: offset
                        })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data.memberList];
                }
            });
        });
    };
    /**
     * tim 发送消息给指定群内
     * @param tim
     * @param groupId
     * @param text
     */
    TimUtil.sendMsg2Group = function (tim, groupId, text) {
        return __awaiter(this, void 0, void 0, function () {
            var createMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createMsg = tim.createTextMessage({
                            to: groupId,
                            conversationType: tim_js_sdk_1.TYPES.CONV_GROUP,
                            payload: { text: text }
                        });
                        return [4 /*yield*/, tim.sendMessage(createMsg)["catch"](function (e) { return console.error("===== TIM发送消息异常 =====", e); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 切换账号
     * @param tim
     * @param userID 登陆账号uid
     * @param userSig 登陆账号签名
     */
    TimUtil.changeUser = function (tim, userID, userSig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tim.logout()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tim.login({ userID: userID, userSig: userSig })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return TimUtil;
}());
exports.TimUtil = TimUtil;
