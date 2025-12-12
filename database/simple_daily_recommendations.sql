-- 简化版每日推荐数据修复

-- 1. 首先检查现有表结构
SELECT '检查表结构' as step,
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_recommendations' 
  AND table_schema = 'public'
ORDER BY column_name;

-- 2. 重新创建表（确保字段正确）
DROP TABLE IF EXISTS daily_recommendations CASCADE;

CREATE TABLE daily_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    recommend_reason TEXT NOT NULL,
    bonus_coins INTEGER DEFAULT 5 CHECK (bonus_coins >= 0),
    is_read BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, date)
);

-- 3. 检查新表结构
SELECT '新表结构' as step,
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_recommendations' 
  AND table_schema = 'public'
ORDER BY column_name;

-- 4. 插入今日推荐数据
(
    (SELECT id FROM books WHERE status = 'available' ORDER BY RANDOM() LIMIT 1),
    CURRENT_DATE,
    '今日精选推荐，优质图书不容错过！',
    5
),
(
    (SELECT id FROM books WHERE status = 'available' AND id NOT IN (
        SELECT book_id FROM daily_recommendations
    ) ORDER BY RANDOM() LIMIT 1),
    CURRENT_DATE,
    '编辑推荐，值得一读的好书！',
    5
),
(
    (SELECT id FROM books WHERE status = 'available' AND id NOT IN (
        SELECT book_id FROM daily_recommendations
    ) ORDER BY RANDOM() LIMIT 1),
    CURRENT_DATE,
    '热门图书，读者好评如潮！',
    5
);

-- 4. 检查结果
SELECT 
    dr.date,
    dr.recommend_reason,
    dr.bonus_coins,
    b.title as book_title,
    b.author,
    CASE 
        WHEN b.cover_image IS NOT NULL THEN '✅ 有封面'
        ELSE '❌ 无封面'
    END as cover_status
FROM daily_recommendations dr
JOIN books b ON dr.book_id = b.id
WHERE dr.date = CURRENT_DATE
ORDER BY dr.created_at;

-- 5. 统计
SELECT 
    'SUCCESS: 已创建今日推荐数据！' as status,
    COUNT(*) as total_recommendations
FROM daily_recommendations 
WHERE date = CURRENT_DATE;