/**
 * @Description: 心跳检测,原文件src/lib/ping.js
 * @Date: 2024/6/26 18:16
 */
const ping = (client) => {
  const timeoutId = setTimeout(() => {
    client.stream.emit("error", new Error("timeout"));
  }, 3000);
  client.ping("hello").then((pong) => {
    if (pong === "hello") {
      clearTimeout(timeoutId);
    }
    setTimeout(() => {
      ping(client);
    }, 5000);
  });
};

module.exports = ping;
