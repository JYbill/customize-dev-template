/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
    const proxyUSAList = config.proxies
      .filter(item => item.name.match(/新加坡/ig))
      .map(item => item.name);
    const proxyUSAField = "🔫和平每一天";
    config["proxy-groups"].push({
      name: proxyUSAField,
      type: "url-test",
      proxies: proxyUSAList,
      url: "https://www.anthropic.com/index/claude-2",
      interval: 86400,
    });
    config["rules"].unshift(
      `RULE-SET,applications,DIRECT`,
      `DOMAIN,clash.razord.top,DIRECT`,
      `DOMAIN,yacd.haishan.me,DIRECT`,
      `RULE-SET,private,DIRECT`,
      `RULE-SET,reject,REJECT`,
      `RULE-SET,icloud,DIRECT`,
      `RULE-SET,apple,DIRECT`,
      // RULE-SET,google,代理出口(自行修改),
      // RULE-SET,proxy,代理出口(自行修改),
      // RULE-SET,telegramcidr,代理出口(自行修改),no-resolve,
      `RULE-SET,direct,DIRECT`,
      `RULE-SET,lancidr,DIRECT,no-resolve`,
      `RULE-SET,cncidr,DIRECT,no-resolve`,
      `DOMAIN-KEYWORD,anthropic,${proxyUSAField}`,
      `DOMAIN-KEYWORD,claude,${proxyUSAField}`,
      `DOMAIN-KEYWORD,openai,${proxyUSAField}`,
      `DOMAIN-KEYWORD,chatgpt,${proxyUSAField}`,
      `DOMAIN-KEYWORD,oaistatic,${proxyUSAField}`,
      `DOMAIN-KEYWORD,gemini,${proxyUSAField}`
    )
    return config;
  }
  