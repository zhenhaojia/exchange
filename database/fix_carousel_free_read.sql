-- 修复轮播图免费阅读功能的数据库问题

-- 1. 为 reading_sessions 表添加 coins_cost 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_sessions' 
        AND column_name = 'coins_cost'
    ) THEN
        ALTER TABLE reading_sessions ADD COLUMN coins_cost INTEGER DEFAULT 0;
        RAISE NOTICE '已为 reading_sessions 表添加 coins_cost 列';
    ELSE
        RAISE NOTICE 'reading_sessions 表的 coins_cost 列已存在';
    END IF;
END $$;

-- 2. 更新 coin_transactions 表的检查约束，允许 carousel_free_read 作为 source
-- 先删除旧约束
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'coin_transactions_source_check'
    ) THEN
        ALTER TABLE coin_transactions DROP CONSTRAINT coin_transactions_source_check;
        RAISE NOTICE '已删除旧的 source_check 约束';
    END IF;
END $$;

-- 添加新的更宽松的约束
ALTER TABLE coin_transactions 
ADD CONSTRAINT coin_transactions_source_check 
CHECK (source IN ('daily_checkin', 'purchase', 'refund', 'carousel_free_read', 'system_bonus', 'reading_reward', 'penalty'));

DO $$
BEGIN
    RAISE NOTICE '已更新 coin_transactions 表的 source 约束';
END $$;

-- 3. 验证表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('reading_sessions', 'coin_transactions') 
    AND column_name IN ('coins_cost', 'source')
ORDER BY table_name, column_name;