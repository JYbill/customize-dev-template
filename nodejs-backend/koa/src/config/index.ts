const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port > 65535) {
  throw new RangeError("PORT 必须是 0 到 65535 之间的整数");
}

export const config = Object.freeze({
  port,
  host: process.env.LISTEN_HOST || "127.0.0.1",
});
