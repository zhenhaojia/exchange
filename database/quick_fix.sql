-- 快速修复数据库问题
-- 这个脚本用于快速修复当前数据库中缺少的功能

-- 1. 确保必要的表存在
DO $$
BEGIN
    -- 创建 coin_transactions 表（如果不存在）
    CREATE TABLE IF NOT EXISTS coin_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
        source VARCHAR(50) NOT NULL,
        description TEXT,
        related_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 创建 reading_sessions 表（如果不存在）
    CREATE TABLE IF NOT EXISTS reading_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        coins_cost INTEGER DEFAULT 0,
        coins_earned INTEGER DEFAULT 0,
        is_free_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 添加 is_free_read 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_sessions' 
        AND column_name = 'is_free_read'
    ) THEN
        ALTER TABLE reading_sessions ADD COLUMN is_free_read BOOLEAN DEFAULT FALSE;
    END IF;

    RAISE NOTICE '数据库表结构检查完成';
END $$;

-- 2. 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON coin_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_book_date ON reading_sessions(user_id, book_id, created_at);

-- 3. 确保RLS策略正确
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- 删除可能冲突的策略
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Users can insert their own coin transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Users can view their own reading sessions" ON reading_sessions;
DROP POLICY IF EXISTS "Users can insert their own reading sessions" ON reading_sessions;

-- 创建新的RLS策略
CREATE POLICY "Users can view their own coin transactions" ON coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin transactions" ON coin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reading sessions" ON reading_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions" ON reading_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. 测试数据插入（可选）
-- 注意：这只在开发环境中使用
-- INSERT INTO coin_transactions (user_id, amount, type, source, description)
-- SELECT 
--     id, 
--     50, 
--     'earn', 
--     'register', 
--     '注册奖励'
-- FROM users 
-- WHERE NOT EXISTS (
--     SELECT 1 FROM coin_transactions 
--     WHERE user_id = users.id AND source = 'register'
-- )
-- LIMIT 10;

SELECT 'SUCCESS: 数据库快速修复完成' as status,
       '现在签到功能应该可以正常工作了' as message;