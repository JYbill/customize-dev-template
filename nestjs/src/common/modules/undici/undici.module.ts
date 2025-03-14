import { Global, Module } from "@nestjs/common";
import undici from "undici";

export const UNDICI = Symbol("undici");
export type UndiciType = typeof undici;
@Global()
@Module({
  providers: [
    {
      provide: UNDICI,
      useValue: undici,
    },
  ],
  exports: [UNDICI],
})
export class UndiciModule {}
