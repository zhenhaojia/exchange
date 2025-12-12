-- 创建每日推荐表的完整脚本

-- 1. 完全重建表
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

-- 2. 插入今日推荐数据
INSERT INTO daily_recommendations (book_id, date, recommend_reason, bonus_coins)
SELECT 
    id as book_id,
    CURRENT_DATE as date,
    CASE 
        WHEN row_num = 1 THEN '今日精选推荐，优质图书不容错过！'
        WHEN row_num = 2 THEN '编辑推荐，值得一读的好书！'
        WHEN row_num = 3 THEN '热门图书，读者好评如潮！'
    END as recommend_reason,
    5 as bonus_coins
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as row_num
    FROM books 
    WHERE status = 'available'
    LIMIT 3
) ranked_books;

-- 3. 验证结果
SELECT 
    '今日推荐数据' as data_type,
    dr.id as recommendation_id,
    dr.date,
    dr.recommend_reason,
    dr.bonus_coins,
    b.title as book_title,
    b.author,
    b.category,
    CASE 
        WHEN b.cover_image IS NOT NULL THEN '✅ 有封面'
        ELSE '❌ 无封面'
    END as cover_status
FROM daily_recommendations dr
JOIN books b ON dr.book_id = b.id
WHERE dr.date = CURRENT_DATE
ORDER BY dr.created_at;

-- 4. 统计信息
SELECT 
    'SUCCESS: 每日推荐数据创建完成！' as status,
    COUNT(*) as total_recommendations,
    STRING_AGG(b.title, ', ') as recommended_books
FROM daily_recommendations dr
JOIN books b ON dr.book_id = b.id
WHERE dr.date = CURRENT_DATE;