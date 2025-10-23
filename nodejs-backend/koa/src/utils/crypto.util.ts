import crypto, { type BinaryToTextEncoding } from "crypto";

import { HttpError } from "#error/index.ts";

export class CryptoUtil {
  /**
   * 令牌统一Hash函数：SHA-256算法
   * @param token
   */
  static async hashToken256(token: string) {
    const tokenSignBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const tokenSignHex = Buffer.from(tokenSignBuf).toString("hex");
    return tokenSignHex;
  }

  /**
   * 该工具与cryptoSignHMAC工具函数的唯一区别在于，cryptoSignHMAC web crypto不支持低安全性的sha1哈希摘要算法
   * @param secret
   * @param txt
   * @param responseFormat
   * @param algorithm
   */
  static cryptoSignHMACByNodejs(
    secret: string,
    txt: string,
    responseFormat: BinaryToTextEncoding = "hex",
    algorithm: string = "sha1",
  ) {
    return crypto.createHmac(algorithm, secret).update(txt).digest(responseFormat);
  }

  /**
   * HMAC加密签名
   * @param secret 密钥字符串
   * @param txt 加密文本 | 数值 | 二进制(Buffer、ArrayBuffer...)
   * @param options
   *  - hash 摘要算法，默认SHA-256
   *  - format 返回的加密字符串格式，默认hex
   */
  static async cryptoSignHMAC(
    secret: string,
    txt: number | string | BufferSource,
    options?: { hash?: string; format?: NodeJS.BufferEncoding },
  ) {
    const hash = options?.hash ?? "SHA-256";
    const format = options?.format ?? "hex";
    const textEncoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      { name: "HMAC", hash },
      false,
      ["sign"],
    );

    let data: BufferSource = txt as BufferSource;
    if (!ArrayBuffer.isView(txt)) {
      data = textEncoder.encode(String(txt as string | number));
    }
    const signBuffer = await crypto.subtle.sign("HMAC", secretKey, data);
    return Buffer.from(signBuffer).toString(format);
  }

  static encrypt(secret: string, text: string) {
    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = crypto.randomBytes(16); // 16字节IV
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    // 拼接IV和密文，方便解密时使用
    return iv.toString("base64") + ":" + encrypted;
  }

  static decrypt(secret: string, encryptedText: string) {
    const key = crypto.createHash("sha256").update(secret).digest();
    // 拆分IV和密文
    const [ivBase64, encrypted] = encryptedText.split(":");
    if (!ivBase64 || !encrypted) {
      throw HttpError.throwServerError("无效的密文格式");
    }
    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
