/**
 * @file: Apipost.js
 * @author: xiaoqinvar
 * @desc: Apipost常用脚本
 * @dependencies:
 * @date: 2023-10-13 14:32:08
 */

/**
 * 登录后写入"authorization"变量，方便需要认证的接口使用
 */
function loginAfter() {
  const token = response.json.data.token;
  // console.log(token)
  apt.variables.set("authorization", "Bearer " + token);
}
