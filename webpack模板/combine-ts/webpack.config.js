module.exports = function (env, argv) {
  return {
    module: {
      rules: [
        {
          // 整合 TS
          test: /\.m?ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true, // ts-loader用 TSC 只编译不做语法检查
              },
            },
          ],
        },
      ],
    },
  };
};
