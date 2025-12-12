-- 修复虚拟币交易表 - 添加 source 字段

-- 添加 source 字段
ALTER TABLE coin_transactions 
ADD COLUMN IF NOT EXISTS source TEXT 
CHECK (source IN ('register', 'daily_checkin', 'daily_read', 'exchange', 'read', 'system'));

-- 更新现有记录的 source 字段
UPDATE coin_transactions 
SET source = 'system' 
WHERE source IS NULL;

-- 添加注释
COMMENT ON COLUMN coin_transactions.source IS '交易来源：register-注册, daily_checkin-每日签到, daily_read-每日阅读, exchange-交换, read-阅读, system-系统';

-- 验证修复结果
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'coin_transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'SUCCESS: 虚拟币交易表修复完成！' as status;