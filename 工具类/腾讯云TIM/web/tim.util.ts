/**
 * @time 2022/5/6 17:52
 * @author xiaoqinvar
 * @desc 腾讯云即时通讯 TIM SDK 静态工具类
 * @dependence tim-js-sdk、@techower/tim-js-sdk
 */
import {GroupMember, IMClient, TYPES} from "tim-js-sdk";

export class TimUtil {

  /**
   * 会先logout登出再断开ws连接，如果要退群用quitOrDismissGroup方法，该功能为离线功能
   * @param tim
   */
  static destroy(tim: IMClient) {
    tim.destroy();
  }

  /**
   * 静态代理：同步、异步执行，查询当前用户在群内的角色，再判断(群员)退出群、(群主)解散群，包含TIM SDK登出和销毁
   * @param tim
   * @param roomId
   * @param uid
   */
  static async quitOrDismissGroup(tim: IMClient, roomId: string, uid: string) {
    const promise = await TimUtil.quitGroup(tim, roomId, uid);
    return TimUtil.destroy(tim);
  }

  /**
   * 只进行群主解散群 or 群成员退出群
   * @param tim
   * @param roomId
   * @param uid
   */
  static async quitGroup(tim: IMClient, roomId: string, uid: string) {
    const { data } = await tim.getGroupMemberProfile({
      groupID: roomId,
      userIDList: [uid],
    });

    let promise;
    const memberList:GroupMember[]  = data.memberList;

    console.log("== debug member list", memberList);
    for (const member of memberList) {
      const role = member["role"];
      const userID = member["userID"];
      // console.log("== debug quitGroup", role);
      if (userID === uid) {
        switch (role) {
          // 群员
          case TYPES.GRP_MBR_ROLE_MEMBER:
            promise = tim.quitGroup(roomId);
            break;
          // 群主
          case TYPES.GRP_MBR_ROLE_OWNER:
            console.log("== debug member list", role, userID);
            promise = tim.dismissGroup(roomId);
            break;
        }
        break;
      }
    }

    // 不使用await，用promise异步并行提升效率
    // 即使抛出群被解散错误，同样执行销毁操作
    return promise;
  }

  /**
   * 获取并返回群内成员
   * @param tim sdk
   * @param roomId 房间id
   * @param count 一次返回的总数，最大100，100可能数据量过大返回失败
   * @param offset 偏移量
   */
  static async getMemberList(tim: IMClient, roomId: string, count: number = 30, offset: number = 0): Promise<any[]> {
    const {data} = await tim.getGroupMemberList({
      groupID: roomId, count: count, offset
    });
    return data.memberList;
  }

  /**
   * tim 发送消息给指定群内
   * @param tim
   * @param groupId
   * @param text
   */
  static async sendMsg2Group(tim: IMClient, groupId: number, text: string) {
    const createMsg = tim.createTextMessage({
      to: groupId,
      conversationType: TYPES.CONV_GROUP,
      payload: {text},
    });
    return await tim.sendMessage(createMsg)
      .catch(e => console.error("===== TIM发送消息异常 =====", e));
  }

  /**
   * 切换账号
   * @param tim
   * @param userID 登陆账号uid
   * @param userSig 登陆账号签名
   */
  static async changeUser(tim: IMClient, userID: string, userSig: string) {
    await tim.logout();
    return await tim.login({ userID, userSig });
  }
}