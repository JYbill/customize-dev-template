export default {
  displayName: 'api', // 测试名称

  // jest转换器
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { useEsm: true, tsconfig: './tsconfig.spec.json' }],
  },

  // 指定匹配的测试文件
//   testMatch: [
//     "./**/*.test.ts"
//   ],
};
