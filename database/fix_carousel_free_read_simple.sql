-- 修复轮播图免费阅读功能的数据库问题

-- 1. 为 reading_sessions 表添加 coins_cost 列（如果不存在）
ALTER TABLE reading_sessions ADD COLUMN IF NOT EXISTS coins_cost INTEGER DEFAULT 0;

-- 2. 删除旧的约束（如果存在）
ALTER TABLE coin_transactions DROP CONSTRAINT IF EXISTS coin_transactions_source_check;

-- 3. 添加新的约束，允许 carousel_free_read
ALTER TABLE coin_transactions 
ADD CONSTRAINT coin_transactions_source_check 
CHECK (source IN ('daily_checkin', 'purchase', 'refund', 'carousel_free_read', 'system_bonus', 'reading_reward', 'penalty'));

-- 4. 验证修复结果
SELECT '修复完成' as status;