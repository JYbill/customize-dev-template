/**
 * @file: webpack.config.js
 * @author: xiaoqinvar
 * @desc: nx webpack通用配置
 * @dependencies:
 * @date: 2023-04-26 18:38:31
 */
const { composePlugins, withNx } = require("@nrwl/webpack");
const { withReact } = require("@nrwl/react");
const { resolve } = require("path");

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  config["resolve"].alias = {
    "@": resolve(__dirname, "src"),
    assets: resolve(__dirname, "src/assets"),
  };
  return config;
});
