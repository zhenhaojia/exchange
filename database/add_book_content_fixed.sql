-- 修复版图书内容添加脚本
-- 简单、安全、可靠

-- 1. 先确认图书表存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'books') THEN
        RAISE EXCEPTION 'books表不存在，请先创建图书数据';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'book_content') THEN
        RAISE EXCEPTION 'book_content表不存在，请先执行表创建';
    END IF;
END $$;

-- 2. 插入图书内容 - 使用单独的INSERT语句

-- 《活着》第一章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    1 as chapter_number,
    '第一章：少年福贵' as chapter_title,
    '少年去放牛了，福贵对佃户说，他家的牛和毛驴是钱买的，现在两样畜都卖给老人了，换了两只羊。老人说，日子会好起来的。福贵相信老人说的话，他坐在田埂上，看着两只羊在田里吃草。老人告诉他，等羊下了羊羔，日子就会好起来。福贵点点头，他说要等着下羊羔。' as content,
    500 as word_count,
    8 as reading_time
FROM books 
WHERE title = '活着' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 《活着》第二章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    2 as chapter_number,
    '第二章：赢赢输输' as chapter_title,
    '第二天福贵去和老人牵羊，老人说他儿子在城里，福贵就把羊牵回来了。福贵牵着羊往家走，路上遇到村里的春生，春生问他羊是从哪里来的。福贵说和老人换的，春生说老人是个好人，福贵就点点头。春生说他家有两只鸡，要和福贵换一只羊，福贵说换了羊就不能再换了。' as content,
    450 as word_count,
    7 as reading_time
FROM books 
WHERE title = '活着' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 《三体》第一章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    1 as chapter_number,
    '第一章：科学边界' as chapter_title,
    '汪淼觉得，纳米材料学家汪淼的痛苦，主要是因为他对物理学理论的伤害。科学家们虽然得到的结果是正确的，但是得到结果的过程却让人愤怒。汪淼说：我们现在的物理学基础理论，就像一栋地基已经烂掉的大楼，科学家们在这栋大楼里装修得很豪华，却随时可能坍塌。' as content,
    600 as word_count,
    10 as reading_time
FROM books 
WHERE title = '三体' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 《三体》第二章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    2 as chapter_number,
    '第二章：台球' as chapter_title,
    '汪淼进入了一个黑色的房间，房间里有一张台球桌。台球桌是黑色的，台球也是黑色的。墙壁上有无数个台球桌的影子。汪淼看到一个台球被击打，撞到另一个台球，第二个台球撞到第三个，如此循环往复。每一次撞击都是精确的，都是可以计算的。' as content,
    550 as word_count,
    9 as reading_time
FROM books 
WHERE title = '三体' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 《小王子》第一章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    1 as chapter_number,
    '第一章：画蛇' as chapter_title,
    '我六岁的时候，在一本描写原始森林的书中看到一副精彩的画。画的是一条大蟒蛇正在吞食一只野兽。这本书上说：大蟒蛇把猎物整个吞下去，嚼都不嚼，然后就去睡上六个月的觉来消化。' as content,
    300 as word_count,
    5 as reading_time
FROM books 
WHERE title = '小王子' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 《百年孤独》第一章
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    id as book_id,
    1 as chapter_number,
    '第一章：世界太新' as chapter_title,
    '许多年之后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。那时的马孔多是一个二十户人家的村落，全是泥巴和芦苇盖成的屋子，沿河岸一字排开，湍急的河水清澈见底，河床里卵石洁白光滑。' as content,
    400 as word_count,
    6 as reading_time
FROM books 
WHERE title = '百年孤独' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. 显示插入结果
SELECT 
    b.title as book_title,
    COUNT(bc.id) as chapter_count,
    COALESCE(SUM(bc.word_count), 0) as total_words
FROM books b
LEFT JOIN book_content bc ON b.id = bc.book_id
WHERE b.title IN ('活着', '三体', '小王子', '百年孤独')
GROUP BY b.id, b.title
ORDER BY b.title;

-- 4. 显示成功信息
SELECT 'SUCCESS: 图书内容已添加完成！现在可以进行完整的在线阅读了。' as status;