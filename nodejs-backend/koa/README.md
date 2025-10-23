## 开发环境
- nodejs v24+(👍)
- npm/pnpm(👍)
- 模块化：纯ESM
- 推荐使用mise作为nodejs包管理工具，`mise.toml`用于统一nodejs版本



## 启动命令

- `dev:debug`: 需要用chrome devtools调试nodejs程序时启动的命令
- `dev`: 普通开发时通过node --watch特性监听文件变动即restart
- `start:prod`: pm2部署形式启动，本地部署或部署测试用
- `buil`: docker构建node服务镜像（TODO）



## 目录结构规范

```
config            环境变量文件
src               项目源码
    enum          枚举常量
    library       第三方库统一配置入口
    middleware    中间件
    router        路由/controller
    service       服务/业务源码
      job         bullmq queue/worker服务
    utils         工具
    index.js      入口文件
    ws            socket.io服务  
vendor            第三方供应商，有些npm包没有放在npm仓库（因为npm不安全原因，一些极客会将包由自己管理与分发，他们一般用http或者本地文件分发）
tmp               临时文件目录
```

- 随机值工具：`library/nanoid/index.js`
- 日期时间工具：`utils/moment.util.js`
- ECMA/loadsh工具：`utils/loadsh.util.js`
- 文件操作工具：`utils/fs.util.js`
- 加密工具：`utils/crypto.util.js`
- 请求工具：`utils/request.util.js`





## node支持的TS语法

- 只允许写TS类型，其他语法特性比如：`enum`、`装饰器`...nodejs官方希望V8通过提案实现
  - 不允许写的语法包括：[nodejs doc - ts feature](https://nodejs.org/docs/latest/api/typescript.html#typescript-features)



## 项目规范
### 文件目录规范
- 文件目录与命名规范
- 所有命名应该采用`驼峰命名`，除了`enum`采用`WORD_WORD`常量命名形式、`协议标准`采用`word_word`snake命名
- 文件夹命名多个单词采用`kebab-case`即`world-world`命名
- controller规范
  - `router-handler`目录定义controller处理器，便于处理`v1`、`v2`、`v3`...接口的不同处理
- service规范
  - 通用逻辑：
    - 查询：`xxx-query.ts`
    - 更新、删除、新建：`xxx-modify.ts`
    - 工具：`util.ts`（如果枚举相关的工具/辅助器，应该放置在util.ts中，而不是放在enum文件中）
  - 纯业务逻辑：`logic/${clazzName}.ts`，一个文件只允许放一个class面向对象
  
    ```ts
    // 🌰 对应的文件名为: ApplyExtraScore.ts
    export class ApplyExtraScore {
      // ...
    }
    ```
  
    > 💡 最佳实践，尽量保证子方法的不可变特性
    >
    > ```ts
    > async function main() {
    >   let result = null;
    >   const data = await dbInsertData(/*..*/);
    >   result.id = data.id;
    >   /* 处理后续逻辑 */
    > }
    > 
    > async function dbInsertData() {
    >   const result = await db.insert(/*...*/);
    >   return result;
    > }
    > ```
  - `job`目录：bullmq queue、worker的专属目录
  - `init`目录：项目初始化执行操作的专属目录
- socket.io规范
  - 事件名规范：ws服务端监听事件统一用`xxxService`、向浏览器发送统一用`xxxClient`。如果服务端监听的事件有支持加入房间的行为用`...RoomService`
- 文件级别的注释
  - 如果是很复杂的模块，应该在文件上定义注释，且注释不应该包含逻辑性，更多的是如何组织文件
  - 参考文件：[message-notification/message-modify.ts](src/service/message-notification/message-modify.ts)
  
- 文件夹、文件名使用`-`进行分割，如`ai-knowledge`



### DB规范

- DB可复用，所有service文件内前缀为`db...`的函数务必保证去JS逻辑业务
- DB如果表上有逻辑删除字段(如：`deleted`、`do_delete`)，做查询时（普通查询、关联查询）都得保证过滤掉



- 抛出异常

- 抛出异常只允许使用封装的`HttpError`

  ```ts
  // 🌰
  throw new HttpError(200, "current session is not exist", ErrorCode.FRONT_LOGIC);
  
  // 🌰
  throw HttpError.throwRequestError(
    "spoc chapter not allow enter for student",
    ErrorCode.spocChapterNotAllowEnter,
  );
  ```


### 工具规范
- 网络请求库，统一使用`utils/request.util.js`内部的请求工具，比如`retry()`默认会重试三次，且对结果做了封装。如果有特殊定制的场景，可以自行封装函数，同时写好注释
- 日志中间件减少数据展示（🚨 JS对于`JSON.parse()`高并发下会出现堵塞、卡死甚至宕机问题）
- ⚠️ `asyncLocalStroage`不要随意扔参数，最佳实践是尽量扔与业务无关的数据，比如`ctx`http上下文，也可以是某个接口需要在所有子函数中传递数据。务必不要把它当作函数传参的偷懒工具！！！**由于tx事务，已经大面积被函数参数定义，为了保持一致性，tx事务的传参不要使用asyncLocalStroage**



- ts类型文件规范

  ```
  // 通用库
  types/**/library.d.ts
  
  // 通用业务类型
  types/service/**/index.d.ts
  types/controller/**/index.d.ts
  
  // 耦合业务代码
  // 查询
  service/logic/query.ts 或 service/logic/*-query.ts
  // 增删改 
  service/logic/modify.ts 或 service/logic/*-modify.ts
  ```

  > 为了保持.ts内都是逻辑代码的干净，强制`.d.ts`与`.ts`分离
  
  - type命名约定
  
  ```ts
  // 专用给前端格式化的类型，使用Vo结尾
  export type SignActivityVo = FormatSign & {
    isExclude: boolean;
    weight: string;
  };
  
  // 专门用于扔给数据库DB得，使用DB结尾
  export type InsertUserDto = {
    name: string;
  }
  ```
  





### bullmq规范

1. 对于bullmq worker必须定义在"service/job/*.ts"下，不允许定义在内层目录
2. 如果有定义worker都应该暴露出来，支持命名导出、具名导出，但名称一定要是worker。支持只定义queue层场景

> 目的：为了保证nodejs进程优雅关闭





## 开发时规范与注意事项

### DB更改规范

1. 数据迁移需要专门写SQL

```sql
-- 🌰创建课程
INSERT INTO curriculum(term_id,CODE,NAME,cover)
    (SELECT a.term_id,a.code,a.name,'/nas/assets/covers/art1.png' AS cover FROM course a
    WHERE a.term_id != 4000002
    GROUP BY a.code );
```

2. 更改字段名需要专门写SQL（⚠️原因：diff很可能会先`del`再`add`从而导致数据丢失）

```sql
-- 🌰
alter table ref_question_library modify ref_total_times int not null default 0 comment '被复制的总共多少次';
```

3. `/alter-table`目录下

   - `modify-log.sql`：每个开发人员更改的SQL语句，类似于DB更改日志
   - `v1.x.x.sql`：最终发布版本时最终可执行SQL，内容来自于`db diff`、`数据迁移`、`更改字段名`

   > 务必保证：`v1.x.x.sql`文件能够在上一次版本的基础库上直接运行

4. 版本发布完毕后，需要保留1份当前数据库结构，并以`wzj2:{git tag}`命名。这样方便为后面的开发使用`db diff`以及备份表结构

   ```sql
   -- 假设当前版本名为"v1.0.0"，则需要创建的数据库为："wzj2:v1.0.0"
   ```

5. 每一次开发周期时，需要清空`modify-log.sql`、`v1.x.x.sql`，如果需要查看之前的文件可以通过git工具快速查看，或查看上面提及的`基础库`的不同版本





## controller相关注意点
- ResponseWrapperMiddleware会对`ctx.body`进行一次包装(如下)且会排除Buffer类型的包装。如果有特殊响应结果，可以将`ctx.state.wrapper = false`将会忽略包装
```
{
  code: ${ctx.status.code},
  body: ${ctx.body},
  message: "...",
}
```
- 对于客户端请求错误、服务器的错误，推荐直接通过`throw HttpError()`抛出错误，由全局异常处理器统一处理，参考: utils/exception.util.js


