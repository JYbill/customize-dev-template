export default {
  displayName: "api", // 测试名称

  // jest转换器
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { useEsm: true, tsconfig: "./tsconfig.spec.json" }],
  },

  // jest解析模块时可以识别哪些文件后缀
  /*
    import { AppService } from './app.service';
    会找
    ./app.service.js
    ./app.service.json
    ./app.service.ts
  */
  moduleFileExtensions: ["js", "json", "ts"],

  // 哪些后缀的文件要按 ESM 模块处理，只有 jest 处于 ESM 模块化下才应该指定
  extensionsToTreatAsEsm: [".ts"],

  // coverage覆盖率同级哪些文件
  collectCoverageFrom: ["src/**/*.(t|j)s"],

  // 忽略指定的源文件，不进行覆盖率统计
  coveragePathIgnorePatterns: ["src/debug/*.(t|j)s"]],

  // 指定匹配的测试文件
  //   testMatch: [
  //     "./**/*.test.ts"
  //   ],
};
