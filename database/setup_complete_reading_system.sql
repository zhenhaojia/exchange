-- 完整阅读系统设置脚本
-- 包含表创建和数据插入

-- 1. 创建图书内容表
CREATE TABLE IF NOT EXISTS book_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 5, -- 预计阅读时间（分钟）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_book_content_book_id ON book_content(book_id);
CREATE INDEX IF NOT EXISTS idx_book_content_chapter ON book_content(book_id, chapter_number);

-- 3. 更新阅读记录表，添加阅读进度（如果字段不存在）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reading_sessions' AND column_name = 'current_chapter') THEN
        RAISE NOTICE 'current_chapter 列已存在';
    ELSE
        EXECUTE 'ALTER TABLE reading_sessions ADD COLUMN IF NOT EXISTS current_chapter INTEGER DEFAULT 1';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reading_sessions' AND column_name = 'progress_percentage') THEN
        RAISE NOTICE 'progress_percentage 列已存在';
    ELSE
        EXECUTE 'ALTER TABLE reading_sessions ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0.00';
    END IF;
END $$;

-- 4. 确认图书存在，然后插入内容
DO $$
DECLARE
    living_book_id UUID;
    three_body_book_id UUID;
    little_prince_book_id UUID;
    hundred_years_book_id UUID;
    book_found_count INTEGER;
BEGIN
    -- 检查图书是否存在
    SELECT COUNT(*) INTO book_found_count FROM books WHERE title IN ('活着', '三体', '小王子', '百年孤独');
    
    IF book_found_count = 0 THEN
        RAISE EXCEPTION '未找到示例图书，请先执行 add_sample_books_fixed.sql 创建图书数据';
    END IF;
    
    -- 获取图书ID
    SELECT id INTO living_book_id FROM books WHERE title = '活着' LIMIT 1;
    SELECT id INTO three_body_book_id FROM books WHERE title = '三体' LIMIT 1;
    SELECT id INTO little_prince_book_id FROM books WHERE title = '小王子' LIMIT 1;
    SELECT id INTO hundred_years_book_id FROM books WHERE title = '百年孤独' LIMIT 1;
    
    -- 插入《活着》内容
    IF living_book_id IS NOT NULL THEN
        INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time) VALUES
        (living_book_id, 1, '第一章：少年福贵', 
        '少年去放牛了，福贵对佃户说，他家的牛和毛驴是钱买的，现在两样畜都卖给老人了，换了两只羊。老人说，日子会好起来的。福贵相信老人说的话，他坐在田埂上，看着两只羊在田里吃草。老人告诉他，等羊下了羊羔，日子就会好起来。福贵点点头，他说要等着下羊羔。',
        500, 8),
        (living_book_id, 2, '第二章：赢赢输输', 
        '第二天福贵去和老人牵羊，老人说他儿子在城里，福贵就把羊牵回来了。福贵牵着羊往家走，路上遇到村里的春生，春生问他羊是从哪里来的。福贵说和老人换的，春生说老人是个好人，福贵就点点头。春生说他家有两只鸡，要和福贵换一只羊，福贵说换了羊就不能再换了。',
        450, 7);
    END IF;
    
    -- 插入《三体》内容
    IF three_body_book_id IS NOT NULL THEN
        INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time) VALUES
        (three_body_book_id, 1, '第一章：科学边界', 
        '汪淼觉得，纳米材料学家汪淼的痛苦，主要是因为他对物理学理论的伤害。科学家们虽然得到的结果是正确的，但是得到结果的过程却让人愤怒。汪淼说：我们现在的物理学基础理论，就像一栋地基已经烂掉的大楼，科学家们在这栋大楼里装修得很豪华，却随时可能坍塌。',
        600, 10),
        (three_body_book_id, 2, '第二章：台球', 
        '汪淼进入了一个黑色的房间，房间里有一张台球桌。台球桌是黑色的，台球也是黑色的。墙壁上有无数个台球桌的影子。汪淼看到一个台球被击打，撞到另一个台球，第二个台球撞到第三个，如此循环往复。每一次撞击都是精确的，都是可以计算的。',
        550, 9);
    END IF;
    
    -- 插入《小王子》内容
    IF little_prince_book_id IS NOT NULL THEN
        INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time) VALUES
        (little_prince_book_id, 1, '第一章：画蛇', 
        '我六岁的时候，在一本描写原始森林的书中看到一副精彩的画。画的是一条大蟒蛇正在吞食一只野兽。这本书上说：大蟒蛇把猎物整个吞下去，嚼都不嚼，然后就去睡上六个月的觉来消化。',
        300, 5);
    END IF;
    
    -- 插入《百年孤独》内容
    IF hundred_years_book_id IS NOT NULL THEN
        INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time) VALUES
        (hundred_years_book_id, 1, '第一章：世界太新', 
        '许多年之后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。那时的马孔多是一个二十户人家的村落，全是泥巴和芦苇盖成的屋子，沿河岸一字排开，湍急的河水清澈见底，河床里卵石洁白光滑。',
        400, 6);
    END IF;
END $$;

-- 5. 显示设置结果
SELECT '📚 阅读系统设置完成！' as status;

-- 6. 显示插入的图书内容统计
SELECT 
    b.title as book_title,
    COUNT(bc.id) as chapter_count,
    COALESCE(SUM(bc.word_count), 0) as total_words,
    COALESCE(SUM(bc.reading_time), 0) as total_reading_time
FROM books b
LEFT JOIN book_content bc ON b.id = bc.book_id
WHERE b.title IN ('活着', '三体', '小王子', '百年孤独')
GROUP BY b.id, b.title
ORDER BY b.title;

-- 7. 显示表结构信息
SELECT 
    'book_content' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'book_content' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '🎉 恭喜！现在可以开始使用完整的在线阅读功能了！' as final_status;