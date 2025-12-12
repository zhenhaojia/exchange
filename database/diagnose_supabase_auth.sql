-- Supabase 认证问题诊断脚本
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 检查 auth.users 表状态
SELECT 
    'auth.users 表状态检查' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. 检查用户相关的触发器
SELECT 
    '触发器检查' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('auth.users', 'users');

-- 3. 检查 RLS 策略
SELECT 
    'RLS 策略检查' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users');

-- 4. 检查自定义 users 表
SELECT 
    '自定义 users 表检查' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 检查函数
SELECT 
    '函数检查' as check_type,
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname LIKE '%user%' OR proname LIKE '%auth%'
ORDER BY proname;