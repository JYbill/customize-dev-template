module.exports = {
  apps: [
    {
      name: 'resource-partal-and-manage', // 名称
      script: './dist/main.js', // nest入口文件
      cwd: './', // 工作目录
      // instances: -1, // 默认 -1：cup - 1
      exec_mode: 'cluster',
      autorestart: true, // 发生异常自动重启
      watch: false, // 不启用监听
      max_restarts: 1, // 最大重启次数
      max_memory_restart: '2G', // 超出内存即重启
      env: {
        // 环境变量
        ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
