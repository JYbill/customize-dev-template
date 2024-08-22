/**
 * @Description: 加密工具库
 * @Date: 2024/8/15 10:11
 */

/**
 * 令牌统一Hash函数：SHA-256算法
 * @param token
 */
export const hashToken256 = async (token: string) => {
    const tokenSignBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    const tokenSignHex = Buffer.from(tokenSignBuf).toString("hex");
    return tokenSignHex;
  };
  
  /**
   * 存储统一的摘要算法：SHA-256算法
   */
  export const hashStorage256 = async (txt: string) => {
    const txtBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(txt),
    );
    const txtHex = Buffer.from(txtBuf).toString("hex");
    return txtHex;
  };
  
  /**
   * 对clientSecretHex进行HMAC，拿到hex
   * @param nonce
   * @param clientSecretHex 客户端密钥摘要
   */
  export const signClientSecretHexHMAC256 = async (
    nonce: string,
    clientSecretHex: string,
  ) => {
    const secretKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(nonce),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );
    const signTxt = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      Buffer.from(clientSecretHex, "hex"),
    );
    const signHex = Buffer.from(signTxt).toString("hex");
    return signHex;
  };
  
  /**
   * 对clientSecretHex进行HMAC校验
   * @param nonce
   * @param clientSecretNonceHex 客户端密钥摘要
   * @param clientSecretHex client_secret存储的摘要
   */
  export const verifyClientSecretHexHMAC256 = async (
    nonce: string,
    clientSecretNonceHex: string,
    clientSecretHex: string,
  ) => {
    const textEncoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(nonce),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      "HMAC",
      secretKey,
      Buffer.from(clientSecretNonceHex, "hex"),
      Buffer.from(clientSecretHex, "hex"),
    );
  };
  