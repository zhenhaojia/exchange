-- 完整的虚拟币功能修复脚本
-- 解决所有可能的数据库和功能问题

-- 1. 确保所有必要的表存在
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

CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    coins_cost INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    is_free_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建或更新虚拟币操作函数
CREATE OR REPLACE FUNCTION public.add_user_coins(
    user_id UUID,
    amount INTEGER
) RETURNS VOID AS $$
BEGIN
    IF amount > 0 THEN
        UPDATE public.users 
        SET coins = coins + amount 
        WHERE id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.deduct_user_coins(
    user_id UUID,
    amount INTEGER
) RETURNS VOID AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    IF amount <= 0 THEN
        RETURN;
    END IF;
    
    -- 获取当前余额
    SELECT coins INTO current_balance 
    FROM public.users 
    WHERE id = user_id;
    
    -- 检查余额是否足够
    IF current_balance < amount THEN
        RAISE EXCEPTION 'Insufficient coins: current balance is %, trying to deduct %', current_balance, amount;
    END IF;
    
    -- 扣除虚拟币
    UPDATE public.users 
    SET coins = coins - amount 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建或更新每日签到函数
CREATE OR REPLACE FUNCTION public.daily_checkin_reward(
    user_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    already_checked_in BOOLEAN;
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
    
    -- 发放签到奖励
    UPDATE users 
    SET coins = coins + 10,
        exp = exp + 5
    WHERE id = user_id_param;
    
    -- 记录交易
    INSERT INTO coin_transactions (
        user_id, 
        amount, 
        type, 
        source, 
        description,
        created_at
    ) VALUES (
        user_id_param,
        10,
        'earn',
        'daily_checkin',
        '每日签到奖励',
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建简化的阅读奖励函数
CREATE OR REPLACE FUNCTION public.daily_read_reward(
    user_id_param UUID,
    book_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    already_rewarded BOOLEAN;
    coin_cost INTEGER := 0; -- 轮播图图书免费阅读
BEGIN
    -- 检查今日是否已获得该书的阅读奖励
    SELECT EXISTS(
        SELECT 1 FROM reading_sessions 
        WHERE user_id = user_id_param 
        AND book_id = book_id_param 
        AND DATE(created_at) = today_date
    ) INTO already_rewarded;
    
    IF already_rewarded THEN
        RETURN FALSE;
    END IF;
    
    -- 记录阅读会话
    INSERT INTO reading_sessions (
        user_id, 
        book_id, 
        coins_cost,
        coins_earned,
        is_free_read,
        created_at
    ) VALUES (
        user_id_param,
        book_id_param,
        coin_cost,
        5, -- 阅读奖励
        TRUE, -- 标记为免费阅读
        NOW()
    );
    
    -- 发放阅读奖励
    UPDATE users 
    SET coins = coins + 5,
        exp = exp + 2
    WHERE id = user_id_param;
    
    -- 记录奖励
    INSERT INTO coin_transactions (
        user_id, 
        amount, 
        type, 
        source, 
        description,
        created_at
    ) VALUES (
        user_id_param,
        5,
        'earn',
        'daily_read',
        '阅读推荐图书奖励',
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 确保RLS策略正确
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- 删除可能冲突的策略
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Users can view their own reading sessions" ON reading_sessions;

-- 创建新的RLS策略
CREATE POLICY "Users can view their own coin transactions" ON coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin transactions" ON coin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reading sessions" ON reading_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions" ON reading_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 添加索引提高性能
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON coin_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_book_date ON reading_sessions(user_id, book_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_free_read ON reading_sessions(is_free_read);

SELECT 'SUCCESS: 虚拟币功能已完全修复' as status;