/**
 * @Description: 加密工具库
 * @Date: 2024/8/15 10:11
 */

export class CryptoUtil {
  /**
   * hash摘要
   */
  static async hash(content: string, algoName = "SHA-256") {
    const txtBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
    const txtHex = Buffer.from(txtBuf).toString("hex");
    return txtHex;
  }

  /**
   * 密码 + 盐生成加密签名
   * @param password
   * @param salt
   * @return {Promise<string>}
   */
  static async passwordSalt2Hash256(password: string, salt: string): Promise<string> {
    const secretKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(salt),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
    const signBuffer = await crypto.subtle.sign("HMAC", secretKey, Buffer.from(password));
    return Buffer.from(signBuffer).toString("hex");
  }

  /**
   * HMAC加密签名的封装
   * @param secret
   * @param content
   */
  static async hmac256(secret: string, content: string): Promise<ArrayBuffer> {
    const textEncoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    const signBuffer = await crypto.subtle.sign("HMAC", secretKey, textEncoder.encode(content));
    return signBuffer;
  }

  /**
   * 对clientSecretHex进行HMAC校验
   * @param nonce
   * @param clientSecretNonceHex 客户端密钥摘要
   * @param clientSecretHex client_secret存储的摘要
   * @return {Promise<boolean>}
   */
  static async verifyClientSecretHexHMAC256(nonce: string, clientSecretNonceHex: string, clientSecretHex: string): Promise<boolean> {
    const textEncoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(nonce),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify("HMAC", secretKey, Buffer.from(clientSecretNonceHex, "hex"), Buffer.from(clientSecretHex, "hex"));
  }
}
