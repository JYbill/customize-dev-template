/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { UserDTO } from '../../dto/user.dto';
import { DBExpectation } from '../../exception/global.expectation';
import {
    Inject,
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as CryptoJS from 'crypto-js';

import {
    OptionType,
    PRISMA_MODULE_INJECT_ID,
    PRISMA_OTHER_OPT_INJECT_ID,
} from './prisma.builder';
import { Role } from '../../enum/app.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
    extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private $customExtends: ReturnType<typeof extendsFactory>;

    constructor(
        @Inject(PRISMA_MODULE_INJECT_ID)
        private readonly prismaOpt: Prisma.PrismaClientOptions,
        @Inject(PRISMA_OTHER_OPT_INJECT_ID)
        private readonly opt: OptionType,
        private readonly configService: ConfigService<IEnv>,
    ) {
        super(prismaOpt);

        // debug详细内容
        if (opt.debugging) {
            this.$on('query', (event: Prisma.QueryEvent) => {
                console.log(1);
                const date = new Date(event.timestamp);
                this.logger.debug('请求时间: ', date.toLocaleTimeString());
                this.logger.debug('耗时: ', event.duration + 'ms');
                this.logger.debug('DB SQL: ', event.query);
                if (!event.target.includes('mongodb')) {
                    this.logger.debug('SQL 参数: ', event.params);
                }
            });
        }
    }

    get $GlobalExt() {
        if (!this.$customExtends) {
            this.$customExtends = extendsFactory(this);
        }
        return this.$customExtends;
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.init(); // 初始化
            this.logger.log('Prisma Connected');
        } catch (err) {
            this.logger.error('Nest onModuleInit Error');
            console.log(err);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Prisma Disconnected');
    }

    /**
     * DB初始化
     */
    async init() {
        const roleTable = await this.$GlobalExt.role;
        let admin = await roleTable.findFirst({
            where: {
                key: Role.ADMIN,
            },
        });
        if (!admin) {
            admin = await roleTable.create({
                data: { name: '管理员', key: Role.ADMIN },
            });
        }

        const user = await roleTable.findFirst({
            where: {
                key: Role.USER,
            },
        });
        if (!user) {
            await roleTable.create({
                data: { name: '普通用户', key: Role.USER },
            });
        }

        // 创建ROOT账号
        const adminRoleId = admin.id;
        const rootUser = await this.$GlobalExt.user.findFirst({
            where: {
                name: this.configService.get('ROOT_USER'),
            },
        });
        if (!rootUser) {
            await this.$GlobalExt.user.create({
                data: {
                    name: this.configService.get('ROOT_USER'),
                    email: this.configService.get('MAIL_USER'),
                    password: CryptoJS.SHA3(
                        this.configService.get('ROOT_PWD'),
                    ).toString(),
                    roleId: adminRoleId,
                },
            });
        }
    }
}

/**
 * 扩展Prisma $extends 工厂函数
 * @param prisma
 */
function extendsFactory(prisma: PrismaService) {
    const $extends = prisma.$extends({
        name: 'GlobalExtends',
        model: {
            $allModels: {
                /**
                 * 根据条件查询是否存在
                 */
                async exit<Module>(
                    this: Module,
                    where: Prisma.Args<Module, 'findFirst'>['where'],
                ): Promise<boolean> {
                    const context = Prisma.getExtensionContext(this) as Module;
                    const data = await context['findFirst']({
                        where,
                        select: { id: true },
                    });
                    return !!data;
                },

                /**
                 * 对象排除
                 * @param payload
                 * @param keys
                 */
                exclude<T, Key extends keyof T>(payload: T, keys: Key[]): Omit<T, Key> {
                    for (const key of keys) {
                        delete payload[key];
                    }
                    return payload;
                },

                /**
                 * 数组排除
                 * @param payloadList
                 * @param keys
                 */
                excludeAll<T, Key extends keyof T>(
                    payloadList: T[],
                    keys: Key[],
                ): Omit<T, Key>[] {
                    for (const payload of payloadList) {
                        for (const key of keys) {
                            delete payload[key];
                        }
                    }
                    return payloadList;
                },
            },

            user: {
                /**
                 * 查找用户带明文密码
                 * @param where
                 * @param select
                 */
                async findUserWithPWD<Module>(
                    this: Module,
                    where: Prisma.Args<Module, 'findFirst'>['where'],
                    select?: Prisma.Args<Module, 'findFirst'>['select'],
                ) {
                    const context = Prisma.getExtensionContext(this) as Module;
                    const res = await context['findFirst']({
                        where,
                        select,
                        showPWD: true,
                    });
                    return res as UserDTO;
                },
            },
        },
        query: {
            $allModels: {
                /**
                 * 自定义Prisma异常
                 * @param params
                 */
                async $allOperations(params) {
                    const { args, query, operation } = params;
                    try {
                        if (operation.includes('create')) {
                            return await query(args);
                        }

                        // 所有判断条件都必须满足有逻辑删除条件
                        // 有where条件但没有isDelete就默认加上
                        if (args['where']) {
                            if (!args['where']['isDelete']) {
                                args['where']['isDelete'] = false;
                            }
                        } else {
                            // 完全没有where条件，直接设置isDelete
                            args['where'] = {
                                isDelete: false,
                            };
                        }
                        return await query(args);
                    } catch (err) {
                        const error = err as Error;
                        if (error instanceof PrismaClientKnownRequestError) {
                            throw new DBExpectation(error.message);
                        } else {
                            console.error('Prisma Query Error', error);
                        }
                    }
                },
            },
            user: {
                /**
                 * 所有用户的返回值，都将"password"字段混淆
                 * @param args
                 * @param query
                 */
                async $allOperations(params) {
                    const { args, query, operation } = params;
                    try {
                        if (operation.includes('create')) {
                            return await query(args);
                        }

                        // 所有判断条件都必须满足有逻辑删除条件
                        // 有where条件但没有isDelete就默认加上
                        if (args['where']) {
                            if (!args['where']['isDelete']) {
                                args['where']['isDelete'] = false;
                            }
                        } else {
                            // 完全没有where条件，直接设置isDelete
                            args['where'] = {
                                isDelete: false,
                            };
                        }
                        return await query(args);
                    } catch (err) {
                        const error = err as Error;
                        if (error instanceof PrismaClientKnownRequestError) {
                            throw new DBExpectation(error.message);
                        } else {
                            console.error('Prisma Query Error', error);
                        }
                    }
                },
            },
        },
    });
    return $extends;
}
