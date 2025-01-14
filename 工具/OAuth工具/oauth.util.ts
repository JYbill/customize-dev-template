class OAuthService {
  /**
   * 生成OAuth RPC服务的请求头
   * @param idToken
   * @param accessToken
   */
  static async generateOAuthHeader(idToken, accessToken) {
    const nonce = Nanoid.UrlAlphabetNanoid();
    const clientId = oauthConfig.clientId;
    const clientSecret = oauthConfig.clientSecret;
    const userInfo = jsonwebtoken.decode(idToken);
    const hex = await CryptoUtil.hashToken256(clientSecret);
    const clientSecretHex = await CryptoUtil.signClientSecretHexHMAC256(nonce, hex);
    return {
      userInfo,
      headers: {
        "client-id": clientId,
        "account-id": userInfo.sub,
        nonce,
        authorization: btoa(accessToken),
        "client-secret-hex": clientSecretHex,
      },
    };
  }

  /**
   * RPC：OAuth服务，如果遇到错误后，调用刷新令牌接口并在200ms后重试一次（仅重试一次）
   * @param method 请求方法
   * @param url 请求路径
   * @param data 扩展body
   * @param extendHeader 扩展header
   * @param session ctx.session对象
   * @return {Promise<void>}
   * @constructor
   */
  static async RPCOAuthService({ method = "GET", url, data = {}, extendHeader = {}, session }) {
    let retryCount = 0;
    let retryTimer = null;

    // 刷新令牌后再重试的逻辑
    return new Promise((resolve, reject) => {
      const retry = () => {
        const payload = method.toUpperCase() === "GET" ? { params: data } : { data };
        this.generateOAuthHeader(session.id_token, session.access_token)
          .then(({ headers }) =>
            axios({
              method,
              url,
              headers: { ...headers, ...extendHeader },
              ...payload,
            })
          )
          .then((result) => {
            resolve(result.data);
          })
          .catch((err) => {
            logger.error("RPC OAuth error: %s", err.response?.data);
            if (retryCount >= 1) {
              reject(new HttpError(500, "RPC OAuth Error"));
            }
            retryCount += 1;
            this.postRefreshToken(session.refresh_token)
              .then((oauthData) => {
                session.access_token = oauthData.access_token;
                session.refresh_token = oauthData.refresh_token;
                setTimeout(retry, 200);
              })
              .catch(reject);
          });
      };
      retry();
    });
  }

  /**
   * 这是一个调用上面服务的模板
   * RPC OAuth服务：生成临时token
   * @param session
   * @param targetSystem 目标子系统枚举值
   * @return {Promise<void>}
   */
  static async requestGenerateTempToken(session, targetSystem) {
    const { id_token: idToken, access_token: accessToken, refresh_token: refreshToken } = session;
    if (!idToken || !accessToken || !refreshToken) {
      throw new HttpError(400, "当前session不存在oauth凭证");
    }

    const data = await OAuthService.RPCOAuthService({
      method: "POST",
      url: oauthConfig.tempUrl,
      session,
      data: {
        from: SubSystemEnum.WZJ,
        to: targetSystem,
        module: `${targetSystem}:AIReport:read`,
      },
    }).catch((err) => {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error("生成临时令牌错误 %s", err);
      throw new HttpError(500, "生成临时令牌失败");
    });
    return data;
  }
}
