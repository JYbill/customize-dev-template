/**
 * @Description: 加密工具库
 * @Date: 2024/8/15 10:11
 */

import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { OAuthServerException } from '../exception/global.expectation';

/**
 * OAuth相关的密码工具
 */
export class OAuthCrypto {
  /**
   * 令牌统一Hash函数：SHA-256算法
   * @param token
   */
  static async hashToken256(token: string) {
    const tokenSignBuf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token),
    );
    const tokenSignHex = Buffer.from(tokenSignBuf).toString('hex');
    return tokenSignHex;
  }

  /**
   * 存储统一的摘要算法：SHA-256算法
   */
  static async hashStorage256(txt: string) {
    const txtBuf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(txt),
    );
    const txtHex = Buffer.from(txtBuf).toString('hex');
    return txtHex;
  }

  /**
   * 对clientSecretHex进行HMAC，拿到hex
   * @param nonce
   * @param clientSecretHex 客户端密钥摘要
   */
  static async signClientSecretHexHMAC256(
    nonce: string,
    clientSecretHex: string,
  ) {
    const secretKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(nonce),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['sign'],
    );
    const signTxt = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      Buffer.from(clientSecretHex, 'hex'),
    );
    const signHex = Buffer.from(signTxt).toString('hex');
    return signHex;
  }

  /**
   * 对clientSecretHex进行HMAC校验
   * @param nonce
   * @param clientSecretNonceHex 客户端密钥摘要
   * @param clientSecretHex client_secret存储的摘要
   */
  static async verifyClientSecretHexHMAC256(
    nonce: string,
    clientSecretNonceHex: string,
    clientSecretHex: string,
  ) {
    const secretKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(nonce),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      'HMAC',
      secretKey,
      Buffer.from(clientSecretNonceHex, 'hex'),
      Buffer.from(clientSecretHex, 'hex'),
    );
  }

  /**
   * OAuth校验授权码、AccessToken访问令牌的签名与返回的是否与id_token返回的一致
   * @param code 授权码
   * @param accessToken 访问令牌
   * @param idToken ID令牌
   */
  static async checkCodeAndAccessTokenSign(
    code: string,
    accessToken: string,
    idToken: string,
  ) {
    const idTokenPayload = jsonwebtoken.decode(idToken) as JwtPayload;
    const codeDigestBuf = await crypto.subtle.digest(
      'SHA-256',
      Buffer.from(code),
    );
    const codeDigest = Buffer.from(codeDigestBuf).toString('hex');
    const accessTokenDigestBuf = await crypto.subtle.digest(
      'SHA-256',
      Buffer.from(accessToken),
    );
    const accessTokenDigest = Buffer.from(accessTokenDigestBuf).toString('hex');
    if (
      codeDigest !== idTokenPayload.c_hash ||
      accessTokenDigest !== idTokenPayload.at_hash
    ) {
      throw new OAuthServerException('ID令牌数字签名不合法');
    }
  }
}
