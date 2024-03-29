module.exports = function (env, argv) {
  return {
    module: {
      rules: [
        {
          // 整合 babel
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },

    resolve: {
      extensions: [".ts", ".mts", ".js"],
    },
  };
};
