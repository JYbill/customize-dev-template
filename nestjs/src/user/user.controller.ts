import { Body, Controller, Post, Req } from '@nestjs/common';
import { Account, Register } from '../dto/user.dto';
import { UserService } from './user.service';
import { Request } from 'express';
import { ProjectException } from '../common/exception/global.expectation';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() register: Register) {
    return this.userService.createUser(register);
  }

  @Post('active')
  async active(@Body() { code, email }: { code: string; email: string }) {
    return this.userService.activeAccount(code, email);
  }

  @Post('/login')
  async login(
    @Body()
    { emailOrName, password }: { emailOrName: string; password: string },
  ) {
    return this.userService.loginAccount(emailOrName, password);
  }

  @Post('/updatePwd')
  async updatePwd(
    @Body()
    {
      emailOrName,
      oldPwd,
      newPwd,
    }: {
      emailOrName: string;
      oldPwd: string;
      newPwd: string;
    },
  ) {
    return this.userService.updatePwd(emailOrName, oldPwd, newPwd);
  }

  @Post('/forgetPwd')
  async forgetPwd(@Body() { email }: { email: string }) {
    return this.userService.forgetPwdSendEmail(email);
  }

  @Post('/checkForgetCode')
  async checkForgetCode(
    @Body() { code, email }: { code: string; email: string },
  ) {
    return this.userService.checkForgetCode(email, code);
  }

  @Post('/updateForgetPwd')
  async updateForgetPwd(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return this.userService.updateForgetPwd(email, password);
  }

  @Post('/createUser')
  async createUserByAdmin(@Req() req: Request, @Body() createUser: Account) {
    const userInfo = req.user;
    const exist = await this.userService.existUser(
      createUser.name,
      createUser.email,
    );
    console.log(exist);
    if (exist) {
      throw new ProjectException('存在相同的邮箱或用户名', 400);
    }
    const userRes = await this.userService.getUserByNameOrEmail({
      email: userInfo.email,
      name: userInfo.name,
    });
    const user = this.userService.getJwtPayloadByUser(userRes);
    if (!user.isAdmin) {
      throw new ProjectException('非管理员不允许创建', 400);
    }
    return this.userService.createAccount(createUser);
  }
}
