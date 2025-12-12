-- 安全的虚拟币功能修复脚本
-- 先检查表结构，再添加缺失的部分

-- 1. 创建coin_transactions表（如果不存在）
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
    source VARCHAR(50) NOT NULL,
    description TEXT,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 为coin_transactions表添加缺失的列
DO $$
BEGIN
    -- 添加created_at列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coin_transactions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE coin_transactions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加user_id外键约束（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'coin_transactions' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'coin_transactions_user_id_fkey'
    ) THEN
        ALTER TABLE coin_transactions 
        ADD CONSTRAINT coin_transactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    RAISE NOTICE 'coin_transactions表结构检查完成';
END $$;

-- 3. 创建reading_sessions表（如果不存在）
CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL,
    coins_cost INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    is_free_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 为reading_sessions表添加缺失的列和约束
DO $$
BEGIN
    -- 添加created_at列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_sessions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE reading_sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加is_free_read列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_sessions' 
        AND column_name = 'is_free_read'
    ) THEN
        ALTER TABLE reading_sessions ADD COLUMN is_free_read BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- 添加user_id外键约束（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reading_sessions' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'reading_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE reading_sessions 
        ADD CONSTRAINT reading_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- 添加book_id外键约束（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reading_sessions' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'reading_sessions_book_id_fkey'
    ) THEN
        ALTER TABLE reading_sessions 
        ADD CONSTRAINT reading_sessions_book_id_fkey 
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
    END IF;
    
    RAISE NOTICE 'reading_sessions表结构检查完成';
END $$;

-- 5. 确保users表有必要的列
DO $$
BEGIN
    -- 添加coins列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'coins'
    ) THEN
        ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;
    END IF;
    
    -- 添加exp列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'exp'
    ) THEN
        ALTER TABLE users ADD COLUMN exp INTEGER DEFAULT 0;
    END IF;
    
    -- 添加level列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'level'
    ) THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    
    RAISE NOTICE 'users表结构检查完成';
END $$;

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON coin_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_book_date ON reading_sessions(user_id, book_id, created_at);

-- 7. 设置RLS策略
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

-- 8. 创建简化的签到函数（不依赖特定列）
CREATE OR REPLACE FUNCTION public.daily_checkin_reward_safe(
    user_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    already_checked_in BOOLEAN;
    current_coins INTEGER;
BEGIN
    -- 检查今日是否已签到
    SELECT EXISTS(
        SELECT 1 FROM coin_transactions 
        WHERE user_id = user_id_param 
        AND source = 'daily_checkin' 
        AND DATE(created_at) = today_date
    ) INTO already_checked_in;
    
    IF already_checked_in THEN
        RETURN FALSE;
    END IF;
    
    -- 获取当前虚拟币
    SELECT coins INTO current_coins 
    FROM users 
    WHERE id = user_id_param;
    
    -- 更新用户虚拟币和经验
    UPDATE users 
    SET coins = COALESCE(current_coins, 0) + 10,
        exp = COALESCE(exp, 0) + 5
    WHERE id = user_id_param;
    
    -- 记录交易
    INSERT INTO coin_transactions (
        user_id, 
        amount, 
        type, 
        source, 
        description
    ) VALUES (
        user_id_param,
        10,
        'earn',
        'daily_checkin',
        '每日签到奖励'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'SUCCESS: 安全的虚拟币功能修复完成' as status,
       '现在所有功能应该可以正常工作了' as message;