[mysqld]
wait_timeout=86400
default-time-zone='+00:00'
skip-name-resolve
character_set_server=utf8mb4
server-id=1000

# STRICT_TRANS_TABLES: 插入或更新时有非法值（如超长字符串、超范围数值、非空字段给 null），SQL 会报错并回滚。
# NO_ZERO_IN_DATE: 禁止日期中月或日为0，否则报错
# NO_ZERO_DATE: 禁止使用全为 0 的日期 '0000-00-00'
# ERROR_FOR_DIVISION_BY_ZERO: 除法时除数为0会报错，如："SELECT 10 / 0"
# NO_ENGINE_SUBSTITUTION: 如果指定了不存在的存储引擎
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

log-bin=mysql-bin
binlog-format=ROW
binlog_expire_logs_seconds=2592000
max_binlog_size=100M