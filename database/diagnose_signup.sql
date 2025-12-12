-- 诊断注册问题的数据库脚本

-- 1. 检查 users 表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 检查是否存在注册相关的触发器
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'auth.users' OR event_object_table = 'users';

-- 3. 检查 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 4. 检查 users 表是否可以正常插入
-- 注意：这个测试可能需要根据实际的表结构调整
DO $$
BEGIN
    -- 尝试创建一个测试用户的基本结构
    BEGIN
        INSERT INTO users (id, email, username, coins, exp, created_at)
        VALUES (
            gen_random_uuid(),
            'test@example.com',
            'testuser',
            50,
            0,
            NOW()
        );
        RAISE NOTICE '✓ users 表插入测试成功';
        DELETE FROM users WHERE email = 'test@example.com';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ users 表插入测试失败: %', SQLERRM;
    END;
END $$;