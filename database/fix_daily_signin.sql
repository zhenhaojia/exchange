-- 修复每日签到功能
-- 确保签到奖励正确发放和记录

-- 1. 创建简化的每日签到函数
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
    SET coins = coins + 10 
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
    
    -- 增加用户经验
    UPDATE users 
    SET exp = exp + 5 
    WHERE id = user_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建简化的阅读奖励函数
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
    
    -- 如果不是免费书籍，扣除费用
    IF coin_cost > 0 THEN
        -- 检查余额
        PERFORM 1 FROM users WHERE id = user_id_param AND coins >= coin_cost;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient coins for reading';
        END IF;
        
        -- 扣除虚拟币
        UPDATE users 
        SET coins = coins - coin_cost 
        WHERE id = user_id_param;
        
        -- 记录消费
        INSERT INTO coin_transactions (
            user_id, 
            amount, 
            type, 
            source, 
            description,
            created_at
        ) VALUES (
            user_id_param,
            coin_cost,
            'spend',
            'read_book',
            '阅读图书费用',
            NOW()
        );
    END IF;
    
    -- 记录阅读会话
    INSERT INTO reading_sessions (
        user_id, 
        book_id, 
        coins_cost,
        coins_earned,
        created_at
    ) VALUES (
        user_id_param,
        book_id_param,
        coin_cost,
        5, -- 阅读奖励
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

-- 3. 确保coin_transactions表有正确的RLS策略
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- 删除可能冲突的策略
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON coin_transactions;

-- 创建新的RLS策略
CREATE POLICY "Users can view their own coin transactions" ON coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin transactions" ON coin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'SUCCESS: 每日签到和阅读奖励函数已修复' as status;