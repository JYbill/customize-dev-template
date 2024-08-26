/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
    const activeProfileName = "🚀 节点选择";
  
    // 创建代理
    const proxyUSAList = config.proxies
      .filter(item => item.name.match(/新加坡/ig))
      .map(item => item.name);
    const proxyUSAField = "🤖 AI专属"; // AI代理
    config["proxy-groups"].push({
      name: proxyUSAField,
      type: "url-test",
      proxies: proxyUSAList,
      url: "https://www.anthropic.com/index/claude-2",
      interval: 86400,
    });
    config["rules"].unshift(
      // 第一层：指定的域名分流（优先级最高）
      `DOMAIN,clash.razord.top,DIRECT`,
      `DOMAIN,yacd.haishan.me,DIRECT`,
      `DOMAIN-KEYWORD,gemini,${proxyUSAField}`, // 这块好像没有生成成功，用域名代替
      // 第二层：geosite分流
      `GEOSITE,CN,DIRECT`,
      `GEOSITE,gfw,${activeProfileName}`,
      `GEOSITE,greatfire,${activeProfileName}`,
      `GEOSITE,github,${activeProfileName}`,
      `GEOSITE,openai,${proxyUSAField}`,
      `GEOSITE,anthropic,${proxyUSAField}`,
      // 第三层：rule-providers分流
      `RULE-SET,applications,DIRECT`,
      `RULE-SET,private,DIRECT`,
      `RULE-SET,reject,REJECT`,
      `RULE-SET,icloud,DIRECT`,
      `RULE-SET,apple,DIRECT`,
      `RULE-SET,direct,DIRECT`,
      `RULE-SET,lancidr,DIRECT,no-resolve`,
      `RULE-SET,cncidr,DIRECT,no-resolve`,
      `RULE-SET,google,${activeProfileName}`,
      `RULE-SET,proxy,${activeProfileName}`, // 一定放在靠后的内容，包含openai、gemini，这些应该走专属AI代理
      `RULE-SET,telegramcidr,${activeProfileName},no-resolve`
    )
    return config;
  }
  