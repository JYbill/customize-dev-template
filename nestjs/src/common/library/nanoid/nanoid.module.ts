import { Global, Module } from "@nestjs/common";
export const NANOID = Symbol("nanoid");

export type NanoidUtil = Awaited<ReturnType<typeof nanoidFactory.useFactory>>;

const nanoidFactory = {
  provide: NANOID,
  useFactory: async () => {
    const { customAlphabet, urlAlphabet } = await import("nanoid");
    return class Nanoid {
      /**
       * 适用于URL编码的字母数字随机
       */
      static UrlAlphabetNanoid = customAlphabet(urlAlphabet);

      /**
       * a-e,0-9,-组成的36位随机值
       */
      static NumberAlphabet36Nanoid = customAlphabet("abcde1234567890-", 36);

      /**
       * 0-9,a-z的6位随机值
       */
      static NumAlphabet6Nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);
    };
  },
};

@Global()
@Module({
  providers: [nanoidFactory],
  exports: [NANOID],
})
export class NanoidModule {}
