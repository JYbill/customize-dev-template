/**
 * @file: redlock.decorator.ts
 * @author: xiaoqinvar
 * @desc: 可以作为TS装饰器使用依赖注入，这一思路的一种借鉴，下面的行为属于hack，官方并不推荐
 * @dependencies:
 * @date: 2024-12-16 15:26:55
 */
import { Inject, Logger } from "@nestjs/common";
import { RedlockService } from "./redlock.module";

export type LockOption = {
  keys: string[];
  duration: number;
};

const logger = new Logger("redlock @Lock");

export function Lock(opt: LockOption) {
  // 模拟依赖注入（hack方法）
  const injectRedlock = Inject(RedlockService);
  return (target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    // 注入redlock，等价于在其他service中进行注入
    // constructor(@Inject(RedlockService) private readonly redLock: RedlockService) {}
    injectRedlock(target, "redLock");
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const redLock: RedlockService = this.redLock;
        await redLock.using(opt.keys, opt.duration, async (_signal, _context) => {
          await originalMethod.apply(this, args);
        });
      } catch (error) {
        logger.error(error);
      }
    };
  };
}
