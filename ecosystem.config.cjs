module.exports = {
  apps: [
    {
      name: "data-viz-platform",
      script: "dist/server.js",
      cwd: "/opt/data-viz-platform",

      // 环境变量
      env_production: {
        NODE_ENV: "production",
        COZE_PROJECT_ENV: "PROD",
        PORT: 5000,
        DATABASE_URL: "file:/opt/data-viz-platform/data/production.db",
        // MySQL 环境变量（切换后使用）
        // DATABASE_URL: "mysql://dataviz:StrongPassword123!@localhost:3306/data_viz_platform",
      },

      // 实例配置
      // SQLite 仅支持单实例；MySQL 可改为 instances: "max" + exec_mode: "cluster"
      instances: 1,
      exec_mode: "fork",

      // 自动重启
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      max_memory_restart: "512M",

      // 日志配置
      out_file: "/var/log/data-viz-platform/access.log",
      error_file: "/var/log/data-viz-platform/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // 优雅关闭
      kill_timeout: 10000,
      listen_timeout: 30000,
      shutdown_with_message: true,
    },
  ],
};
