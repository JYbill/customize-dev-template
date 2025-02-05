import { Global, Module } from "@nestjs/common";
export const GOT = Symbol("got");

export type GotUtil = Awaited<ReturnType<typeof gotFactory.useFactory>>;

const gotFactory = {
  provide: GOT,
  useFactory: async () => {
    const { got } = await import("got");
    return got;
  },
};

@Global()
@Module({
  providers: [gotFactory],
  exports: [GOT],
})
export class NanoidModule {}
