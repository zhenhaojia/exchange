-- 检查现有表的结构
-- 这个脚本用于查看当前数据库中表的结构，避免错误

-- 1. 检查coin_transactions表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'coin_transactions' 
ORDER BY ordinal_position;

-- 2. 检查reading_sessions表结构  
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reading_sessions' 
ORDER BY ordinal_position;

-- 3. 检查users表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 4. 列出所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;