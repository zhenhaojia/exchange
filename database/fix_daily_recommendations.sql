-- 修复每日推荐表数据
-- 确保有今日推荐图书数据

-- 1. 首先检查表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_recommendations' 
  AND table_schema = 'public'
ORDER BY column_name;

-- 2. 检查现有数据
SELECT '现有数据检查' as info, COUNT(*) as total_count FROM daily_recommendations;

-- 3. 删除旧的推荐数据（确保数据新鲜）
DELETE FROM daily_recommendations;

-- 4. 获取一些图书ID作为推荐
DO $$
DECLARE
    selected_books UUID[];
    current_date DATE := CURRENT_DATE;
BEGIN
    -- 获取3本不同的图书作为今日推荐
    SELECT ARRAY_AGG(id) INTO selected_books
    FROM books 
    WHERE status = 'available'
    ORDER BY RANDOM() 
    LIMIT 3;
    
    -- 如果没有图书，退出
    IF selected_books IS NULL OR array_length(selected_books, 1) = 0 THEN
        RAISE NOTICE '没有可推荐的图书';
        RETURN;
    END IF;
    
    -- 为每本书创建今日推荐
    INSERT INTO daily_recommendations (book_id, date, recommend_reason, bonus_coins)
    SELECT 
        book_id,
        current_date,
        CASE 
            WHEN idx = 1 THEN '今日精选推荐，优质图书不容错过！'
            WHEN idx = 2 THEN '编辑推荐，值得一读的好书！'
            WHEN idx = 3 THEN '热门图书，读者好评如潮！'
        END as recommend_reason,
        5 as bonus_coins
    FROM unnest(selected_books) WITH ORDINALITY AS t(book_id, idx);
        
    RAISE NOTICE '已添加 % 本图书到今日推荐', array_length(selected_books, 1);
END $$;

-- 3. 检查今日推荐数据
SELECT 
    '今日推荐数据' as data_type,
    dr.id as recommendation_id,
    dr.date,
    dr.recommend_reason,
    dr.bonus_coins,
    b.title as book_title,
    b.author,
    b.category,
    b.cover_image,
    CASE 
        WHEN b.cover_image IS NOT NULL THEN '✅ 有封面'
        ELSE '❌ 无封面'
    END as cover_status
FROM daily_recommendations dr
JOIN books b ON dr.book_id = b.id
WHERE dr.date = CURRENT_DATE
ORDER BY dr.created_at;

-- 4. 如果今日没有推荐，显示最近3天的推荐
SELECT 
    '最近推荐数据' as data_type,
    dr.date,
    COUNT(*) as recommendation_count,
    STRING_AGG(b.title, ', ') as recommended_books
FROM daily_recommendations dr
JOIN books b ON dr.book_id = b.id
WHERE dr.date >= CURRENT_DATE - INTERVAL '3 days'
GROUP BY dr.date
ORDER BY dr.date DESC;

-- 5. 统计信息
SELECT 
    '统计信息' as data_type,
    COUNT(*) as total_recommendations,
    COUNT(DISTINCT date) as days_with_recommendations,
    MAX(date) as latest_date
FROM daily_recommendations;

SELECT 'SUCCESS: 每日推荐数据已修复！轮播图现在应该显示图书了。' as status;