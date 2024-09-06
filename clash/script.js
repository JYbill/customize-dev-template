/**
 * 全局扩展脚本
 * @param   {[type]}  config
 * @param   {[type]}  profileName
 * @return  {[type]}
 */
function main(config, profileName) {
  // 魔戒:'🚀 节点选择'
  // TGA:'♻️ 手动切换'
  // Freecat 🐾自由猫
  const activeProfileName = "♻️ 手动切换";

  // 创建代理
  const proxyUSAList = config.proxies.filter((item) => item.name.match(/新加坡/gi)).map((item) => item.name);
  const aiProxyGroup = "🤖 AI专属"; // AI代理
  config["proxy-groups"].unshift({
    name: aiProxyGroup,
    type: "url-test",
    proxies: proxyUSAList,
    url: "https://www.anthropic.com/index/claude-2",
    interval: 86400,
  });
  config["rules"].unshift(
    // 第一层：直连
    `DOMAIN,clash.razord.top,DIRECT`,
    `DOMAIN,yacd.haishan.me,DIRECT`,
    `RULE-SET,dev-direct,DIRECT`,
    `RULE-SET,applications,DIRECT`,
    `RULE-SET,private,DIRECT`,
    `RULE-SET,reject,REJECT`,
    `RULE-SET,icloud,DIRECT`,
    `RULE-SET,apple,DIRECT`,
    `RULE-SET,direct,DIRECT`,
    `GEOSITE,CN,DIRECT`,
    // 第二层：代理
    `RULE-SET,daily-foreign,${activeProfileName}`,
    `DOMAIN-KEYWORD,gemini,${aiProxyGroup}`,
    `GEOSITE,github,${activeProfileName}`,
    `RULE-SET,google,${activeProfileName}`,
    `GEOSITE,openai,${aiProxyGroup}`,
    `GEOSITE,anthropic,${aiProxyGroup}`,
    `GEOSITE,gfw,${activeProfileName}`,
    `GEOSITE,greatfire,${activeProfileName}`,
    `RULE-SET,proxy,${activeProfileName}`, // 一定放在靠后的内容，包含openai、gemini，这些应该走专属AI代理
    // 第三层：IP分流
    `RULE-SET,lancidr,DIRECT,no-resolve`,
    `RULE-SET,cncidr,DIRECT,no-resolve`,
    `RULE-SET,telegramcidr,${activeProfileName},no-resolve`
  );
  return config;
}
