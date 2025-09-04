import { Global, Module } from "@nestjs/common";
import { UndiciService } from "@/common/modules/undici/undici.service";

@Global()
@Module({
  providers: [UndiciService],
  exports: [UndiciService],
})
export class UndiciModule {}
