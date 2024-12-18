import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import { TokenException, TokenMissed } from '../exception/global.expectation';

/**
 * @Description: passport-jwt校验中间件
 * @Author: 小钦var
 * @Date: 2024/5/11 14:37
 */
@Injectable()
export default class JwtMiddleware {
  constructor(private readonly configService: ConfigService) {
    passport.use(
      'jwt',
      new JWTStrategy(
        {
          // 1. 获取Token的方法
          jwtFromRequest: (req: Request) => {
            if (!req.headers.authorization?.includes('Bearer ')) {
              return ''; // passport.error() -> 认证回调
            }
            // 这里可以自定义，但是返回的结果一定是JWT，否则passport-jwt进行校验，失败则抛出异常
            // 抛出异常就会执行passport.fail() -> 下一个策略，调用next(error)
            return req.headers['authorization'].split('Bearer ')[1];
          },
          ignoreExpiration: false,
          secretOrKey: this.configService.get('JWT_SECRET'),
          passReqToCallback: true, // 钩子传入Request参数
        },

        // 2. 此策略的校验钩子（此时代表jwt校验是成功的，可以自己进行二次其他的校验）
        // TIP:
        // 这里最好写同步写法，不要async/await，因为passport-jwt中并未对异步做支持，要用异步就用Promise
        // done(err) -> passport.error() -> 认证回调()
        // done(null, payload) -> passport.success() -> 认证回调()
        (req: Request, payload: IPayload, done: VerifiedCallback) => {
          if (!payload.email || !payload.name) {
            done(new TokenException('伪造JWT'), null);
            return;
          }

          // 此处调用passport.success()的回调函数，即下面的`authCallback()`
          done(null, payload);
        },
      ),
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'jwt',
      {
        session: false,
      },
      // 3. 认证完成回调
      function authCallback(err: Error, user: IPayload, info: { message: string }) {
        // 错误处理
        const forbidden = err || info;
        if (forbidden) {
          let tip = '';
          if (info) {
            tip = info.message;
          } else {
            tip = err.message;
          }
          next(new TokenException(tip));
        }
        req.user = user;
        next();
      },
    )(req, res, next);
  }
}
