-- 创建虚拟币操作相关的函数
-- 这些函数确保虚拟币操作的原子性

-- 1. 增加用户虚拟币函数
CREATE OR REPLACE FUNCTION public.add_user_coins(
    user_id UUID,
    amount INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET coins = coins + amount 
    WHERE id = user_id;
    
    -- 记录日志
    RAISE NOTICE 'Added % coins to user %', amount, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 扣除用户虚拟币函数
CREATE OR REPLACE FUNCTION public.deduct_user_coins(
    user_id UUID,
    amount INTEGER
) RETURNS VOID AS $$
DECLARE
    current_balance INTEGER;
BEGIN
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
    
    -- 记录日志
    RAISE NOTICE 'Deducted % coins from user %, new balance: %', amount, user_id, current_balance - amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 检查函数是否创建成功
SELECT 'SUCCESS: 虚拟币操作函数已创建' as status;