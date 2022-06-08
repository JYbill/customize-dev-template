/**
 * @time 2022/5/30 16:38
 * @author xiaoqinvar
 * @desc 常用node工具封装，文件、流、buffer、crypto
 * @dependence node
 */
import * as crypto from 'crypto';

export class NodeUtil {
  /**
   * md5盐值加密返回结果字符串
   * @param text
   * @param salt
   */
  static md5SlotCrypto(text: string, salt: string = ''): string {
    return crypto.createHash('md5').update(text + salt).digest('hex');
  }
}