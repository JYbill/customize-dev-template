[mysqld]
wait_timeout=86400
#default-time-zone='+00:00'
character_set_server=utf8mb4
server-id=1000

# STRICT_TRANS_TABLES: 插入或更新时有非法值（如超长字符串、超范围数值、非空字段给 null），SQL 会报错并回滚。
# NO_ZERO_IN_DATE: 禁止日期中月或日为0，否则报错
# NO_ZERO_DATE: 禁止使用全为 0 的日期 '0000-00-00'
# ERROR_FOR_DIVISION_BY_ZERO: 除法时除数为0会报错，如："SELECT 10 / 0"
# NO_ENGINE_SUBSTITUTION: 如果指定了不存在的存储引擎
# ONLY_FULL_GROUP_BY: 不允许模糊的group by
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

log-bin=mysql-bin
binlog-format=ROW
binlog_expire_logs_seconds=2592000
max_binlog_size=100M

# ------------------------------
# 内存缓冲区设置
# ------------------------------
# 每个连接的排序缓冲区
sort_buffer_size = 4M

# 排序后随机读取缓冲区
read_rnd_buffer_size = 4M

# 无索引 JOIN 缓冲区
join_buffer_size = 16M

# 内存临时表大小（超过则写磁盘）
tmp_table_size = 64M
max_heap_table_size = 64M


# ------------------------------
# 常用优化
# ------------------------------
# 避免 DNS 查询，提高连接速度
# skip-name-resolve

# 增加最大允许包大小（必要时）
max_allowed_packet = 64M

# 调整 InnoDB 缓冲池大小（可根据服务器内存调）
innodb_buffer_pool_size = 512M

# 日志和文件路径
log_error = /logs/mysql-error.log
slow_query_log = 1
slow_query_log_file = /logs/mysql-slow.log
long_query_time = 2