import type { AuthConfig } from "@auth/core" with { "resolution-mode": "import" };
import { PrismaClient } from "@prisma/client";

export async function getAuthConfig() {
  const { skipCSRFCheck }: any = await import("@auth/core");
  const { default: Nodemailer } = await import("@auth/express/providers/nodemailer");
  const { PrismaAdapter } = await import("@auth/prisma-adapter");
  const authConfig: AuthConfig = {
    debug: true,
    trustHost: true,
    skipCSRFCheck,
    providers: [
      Nodemailer({
        server: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_CODE,
          },
        },
        from: `No Reply <${process.env.MAIL_USER}>`,
      }),
    ],
    adapter: PrismaAdapter(new PrismaClient()),

    // 回调
    callbacks: {
      // 创建或更新session时即触发，默认返回params.token作为session核载
      /*async jwt(params) {
        console.log("jwt", params);
        return params.token;
      },*/
      // 每次session访问、更新时就会触发，返回值为session对象，仅在database下会更改session对象
      /*async session(params) {
        const { session } = params;
        return session;
      },*/
      // (登录前执行)返回true允许登录，返回false拒绝登录，返回字符串将将用户重定向到指定的URL
      // 未处理的错误默认以AccessDenied抛出
      // async signIn(params) {
      // console.log("callback signIn", params);
      /*
        callback signIn {
          user: {
            name: 'xqv',
            age: 21,
            email: '123@123',
            password: '******',
            id: '5304cb9d-6801-4a50-b48e-b3a29b58a934'
          },
          account: {
            providerAccountId: '5304cb9d-6801-4a50-b48e-b3a29b58a934',
            type: 'credentials',
            provider: 'credentials'
          },
          credentials: { email: '123@123', password: '123' }
        }
        */
      // return true;
      // },
    },

    // session策略
    session: {
      // jwt: 默认为基于cookie的JWE
      // database: 如果定义adapter默认为"database"，cookie仅包含session令牌值，便于在数据库中查找会话信息
      strategy: "database",

      // 仅在"database"启用，返回值作为session令牌值。默认值：randomUUID、randomBytes.toHex取决于node.js版本
      /*generateSessionToken() {
        return Math.random().toString(36).substring(2);
      },*/

      maxAge: 86400 * 5, // 默认2592000s即30天，cookie/session存活时长
      // updateAge: 0,
    },

    // 设置自定义登录页面
    pages: {},
    // page页面样式
    theme: {
      colorScheme: "dark", // 主题色: "auto" | "dark" | "light"
      logo: "https://image.jybill.top/forg.png", // logo
      brandColor: "#336AD6", // 主要颜色，默认#336AD6
      buttonText: "white", // 按钮文本颜色
    },
    // basePath: "/api/auth/",
  };
  return authConfig;
}