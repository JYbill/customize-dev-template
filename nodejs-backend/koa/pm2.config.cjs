module.exports = {
  apps: [
    {
      name: "wzj2",
      script: "./src/index.ts",
      node_args: "--trace-warnings",
      watch: false,
      exec_interpreter: "node",
      instances: 4,
      exec_mode: "cluster",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Shanghai",
      },
    },
  ],
};
