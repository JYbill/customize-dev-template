/**
 * @time 2022/5/6 17:52
 * @author xiaoqinvar
 * @desc 腾讯云即时通讯 TIM SDK 静态工具类
 * @dependence tim-js-sdk、@techower/tim-js-sdk
 */
import { IMClient } from "tim-js-sdk";
export declare class TimUtil {
    /**
     * 会先logout登出再断开ws连接，如果要退群用quitOrDismissGroup方法，该功能为离线功能
     * @param tim
     */
    static destroy(tim: IMClient): void;
    /**
     * 静态代理：同步、异步执行，查询当前用户在群内的角色，再判断(群员)退出群、(群主)解散群，包含TIM SDK登出和销毁
     * @param tim
     * @param roomId
     * @param uid
     */
    static quitOrDismissGroup(tim: IMClient, roomId: string, uid: string): Promise<void>;
    /**
     * 只进行群主解散群 or 群成员退出群
     * @param tim
     * @param roomId
     * @param uid
     */
    static quitGroup(tim: IMClient, roomId: string, uid: string): Promise<any>;
    /**
     * 获取并返回群内成员
     * @param tim sdk
     * @param roomId 房间id
     * @param count 一次返回的总数，最大100，100可能数据量过大返回失败
     * @param offset 偏移量
     */
    static getMemberList(tim: IMClient, roomId: string, count?: number, offset?: number): Promise<any[]>;
    /**
     * tim 发送消息给指定群内
     * @param tim
     * @param groupId
     * @param text
     */
    static sendMsg2Group(tim: IMClient, groupId: number, text: string): Promise<any>;
    /**
     * 切换账号
     * @param tim
     * @param userID 登陆账号uid
     * @param userSig 登陆账号签名
     */
    static changeUser(tim: IMClient, userID: string, userSig: string): Promise<any>;
}
