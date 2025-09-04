import { customAlphabet, urlAlphabet } from "nanoid";

export class Nanoid {
  /**
   * 适用于URL编码的字母数字随机
   */
  static UrlAlphabetNanoid = customAlphabet(urlAlphabet);

  /**
   * a-e,0-9,-组成的36位随机值
   */
  static NumberAlphabet36Nanoid = customAlphabet("abcde1234567890-", 36);

  /**
   * 0-9组成的36位随机值
   * 长度默认18
   */
  static NumberNanoid(num = 18) {
    return customAlphabet("1234567890", num)();
  }

  /**
   * 0-9,a-z的6位随机值
   */
  static NumAlphabet6Nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);
}
