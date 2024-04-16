import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Account, Register, UserDTO } from '../dto/user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResponseUtil } from '../util/response.util';
import * as CryptoJS from 'crypto-js';
import { randomString } from '../util/ecma.util';
import { redis } from '../modules/redis/redis.service';
import { RedisKey, Role } from '../enum/app.enum';
import {
  ProjectException,
  UserExistException,
} from '../common/exception/global.expectation';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 创建账号：存储在redis内
   * @param register
   */
  async createUser(register: Register) {
    const existUser = await this.existUser(register.name, register.email);
    if (existUser) {
      throw new ProjectException('用户名或邮箱重复', 400);
    }
    const random = randomString(5);
    // 发送邮件
    await this.mailerService.sendMail({
      to: register.email, // list of receivers
      from: process.env['MAIL_USER'], // sender address
      subject: '用户注册激活码', // Subject line
      html: `<b>注册账号名：${register.name}, 激活码：${random}</b>`,
    });

    await redis.setex(
      RedisKey.Register + register.email,
      this.configService.get('MAIL_REGISTER_EXPIRE'),
      JSON.stringify({ code: random, ...register }),
    );
    return ResponseUtil.success(null, '注册成功，请访问邮箱查看激活码');
  }

  /**
   * 将redis用户注册的数据，存储在DB
   * @param code
   * @param email
   */
  async activeAccount(code: string, email: string) {
    const account = await redis.get(RedisKey.Register + email);
    if (!account) {
      throw new ProjectException('账号不存在', 400);
    }
    const {
      code: accountCode,
      name,
      password,
    } = JSON.parse(account) as Record<string, string>;
    if (accountCode !== code) {
      throw new ProjectException('激活码错误', 400);
    }

    // 拿到用户权限外键
    const userRole = await this.prismaService.$GlobalExt.role.findUnique({
      where: { key: Role.USER },
    });
    // 用户与角色绑定
    const res = await this.prismaService.$GlobalExt.user.create({
      data: {
        name,
        email,
        password: CryptoJS.SHA3(password).toString(),
        roleId: userRole.id,
      },
    });
    if (res) {
      await redis.del(RedisKey.Register + email);
    } else {
      throw new ProjectException('账号未创建成功，请检查代码', 400);
    }
    return ResponseUtil.success(null, '账号创建成功');
  }

  /**
   * 用户登录业务逻辑
   * @param emailOrName
   * @param password
   */
  async loginAccount(emailOrName: string, password: string) {
    const userTable = this.prismaService.$GlobalExt.user;
    const user = await this.getUserByNameOrEmail({ emailOrName });
    if (!user) {
      throw new ProjectException('账号或邮箱错误', 400);
    }

    const userWithPwd = await userTable.findUserWithPWD(
      { email: user.email },
      { password: true },
    );
    const inputPwd = CryptoJS.SHA3(password).toString();
    if (inputPwd !== userWithPwd.password) {
      throw new ProjectException('密码错误', 400);
    }
    // JWT token
    const jwtPayload = this.getJwtPayloadByUser(user);
    const token = await this.jwtService.signAsync(jwtPayload);
    return ResponseUtil.success(token, '登录成功');
  }

  /**
   * 更新密码
   * @param emailOrName
   * @param oldPwd
   * @param newPwd
   */
  async updatePwd(emailOrName: string, oldPwd: string, newPwd: string) {
    const userTable = this.prismaService.$GlobalExt.user;
    const user = await this.getUserByNameOrEmail({ emailOrName });
    if (!user) {
      throw new ProjectException('账号或邮箱错误', 400);
    }

    const userWithPwd = await userTable.findUserWithPWD(
      { email: user.email },
      { password: true },
    );
    const inputPwd = CryptoJS.SHA3(oldPwd).toString();
    if (inputPwd !== userWithPwd.password) {
      throw new ProjectException('原始密码错误', 400);
    }

    await userTable.update({
      where: {
        email: user.email,
      },
      data: {
        password: CryptoJS.SHA3(newPwd).toString(),
      },
    });
    const jwtPayload = this.getJwtPayloadByUser(user); // 只更改了密码，这里不用拿最新
    const token = await this.jwtService.signAsync(jwtPayload);
    return ResponseUtil.success(token, '修改密码成功');
  }

  /**
   * 忘记密码发送的邮箱验证码
   * @param email
   */
  async forgetPwdSendEmail(email: string) {
    const exist = await this.existUser(undefined, email);
    if (!exist) {
      throw new ProjectException('不存在该邮箱', 400);
    }

    const random = randomString(5);
    // 发送邮件
    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: process.env['MAIL_USER'], // sender address
      subject: '用户忘记密码', // Subject line
      html: `<b>激活码：${random}</b>`,
    });

    await redis.setex(
      RedisKey.Forget + email,
      this.configService.get('MAIL_REGISTER_EXPIRE'),
      JSON.stringify({
        isValid: false,
        code: random,
      }),
    );
    return ResponseUtil.success(null, '请于10分钟内输入邮箱验证码');
  }

  /**
   * 验证忘记密码发送的邮箱验证码
   * @param email
   * @param code
   */
  async checkForgetCode(email: string, code: string) {
    const accountStr = await redis.get(RedisKey.Forget + email);
    if (!accountStr) {
      throw new ProjectException('验证码已过期或邮箱不存在', 400);
    }

    const account: Record<string, any> = JSON.parse(accountStr);
    if (account['code'] !== code) {
      throw new ProjectException('验证码错误', 400);
    }

    account['isValid'] = true;
    await redis.setex(
      RedisKey.Forget + email,
      this.configService.get('MAIL_REGISTER_EXPIRE'),
      JSON.stringify(account),
    );
    return ResponseUtil.success(null, '激活码正确，请在10分钟内更改密码');
  }

  /**
   * 校验忘记密码的邮箱验证码成功，直接修改密码
   * @param email
   * @param password
   */
  async updateForgetPwd(email: string, password: string) {
    const forgetStr = await redis.get(RedisKey.Forget + email);
    if (!forgetStr) {
      throw new ProjectException('更改密码已超时，请重新发送忘记密码邮件', 400);
    }
    const forget: Record<string, any> = JSON.parse(forgetStr);
    if (!forget.isValid) {
      throw new ProjectException('请先输入邮箱验证码，再更改密码', 400);
    }
    await this.prismaService.$GlobalExt.user.update({
      where: {
        email,
      },
      data: {
        password: CryptoJS.SHA3(password).toString(),
      },
    });

    const user = await this.getUserByNameOrEmail({ emailOrName: email });
    const jwtPayload = this.getJwtPayloadByUser(user);
    const token = await this.jwtService.signAsync(jwtPayload);

    // 删除redis 忘记密码状态
    await redis.del(RedisKey.Forget + email);
    return ResponseUtil.success(token, '登录成功');
  }

  /**
   * 管理员创建账号
   * @param createUser
   */
  async createAccount(createUser: Account) {
    const table = this.prismaService.$GlobalExt;
    console.log(createUser);
    // 查角色id
    const { id: roleId } = await table.role.findUnique({
      where: {
        key: createUser.role,
      },
      select: {
        id: true,
      },
    });
    const user = await table.user.create({
      data: {
        name: createUser.name,
        email: createUser.email,
        password: CryptoJS.SHA3(createUser.password).toString(),
        roleId,
      },
    });
    return ResponseUtil.success(user, '创建成功');
  }

  /**
   * 判断用户是否存在
   * @param uname
   * @param email
   */
  async existUser(uname: string, email: string) {
    return this.prismaService.$GlobalExt.user.exit({
      OR: [{ name: uname }, { email }],
    });
  }

  /**
   * 邮箱或用户名获取用户
   * @param email
   * @param name
   * @param emailOrName
   */
  async getUserByNameOrEmail({
    email,
    name,
    emailOrName,
  }: {
    email?: string;
    name?: string;
    emailOrName?: string;
  }) {
    let query: Record<string, any>[];
    if (email && name) {
      query = [{ name: name }, { email: email }];
    } else {
      query = [{ name: emailOrName }, { email: emailOrName }];
    }
    const user = await this.prismaService.$GlobalExt.user.findFirst({
      where: {
        OR: query,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });
    return user;
  }

  /**
   * 获取JWT payload
   * @param user
   */
  getJwtPayloadByUser(user: UserDTO) {
    const isAdmin = user['role'].key === Role.ADMIN;
    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      role: user['role'],
      isAdmin,
    };
  }
}
