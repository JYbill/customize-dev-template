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
    `DOMAIN-KEYWORD,anthropic,${proxyUSAField}`,
    `DOMAIN-KEYWORD,claude,${proxyUSAField}`,
    `DOMAIN-KEYWORD,openai,${proxyUSAField}`,
    `DOMAIN-KEYWORD,chatgpt,${proxyUSAField}`,
    `DOMAIN-KEYWORD,oaistatic,${proxyUSAField}`,
    `DOMAIN-KEYWORD,gemini,${proxyUSAField}`
  )
  return config;
}
