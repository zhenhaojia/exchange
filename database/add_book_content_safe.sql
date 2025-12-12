-- 安全版图书内容添加脚本
-- 先获取图书ID，再插入内容

-- 1. 创建临时表存储图书ID
CREATE TEMPORARY TABLE temp_book_ids (
    book_title VARCHAR(255) PRIMARY KEY,
    book_id UUID
);

-- 2. 插入图书ID到临时表
INSERT INTO temp_book_ids (book_title, book_id)
SELECT title, id FROM books WHERE title IN ('活着', '三体', '小王子', '百年孤独');

-- 3. 显示找到的图书ID
SELECT '找到的图书ID：' as info;
SELECT book_title, book_id FROM temp_book_ids ORDER BY book_title;

-- 4. 插入图书内容（使用临时表的ID）
INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time)
SELECT 
    t.book_id,
    unnest(ARRAY[1,2]) as chapter_number,
    unnest(ARRAY[
        CASE WHEN t.book_title = '活着' THEN '第一章：少年福贵'
             WHEN t.book_title = '三体' THEN '第一章：科学边界'
             WHEN t.book_title = '小王子' THEN '第一章：画蛇'
             WHEN t.book_title = '百年孤独' THEN '第一章：世界太新'
             ELSE '第一章'
        END),
    unnest(ARRAY[
        CASE WHEN t.book_title = '活着' THEN '少年去放牛了，福贵对佃户说，他家的牛和毛驴是钱买的，现在两样畜都卖给老人了，换了两只羊。老人说，日子会好起来的。福贵相信老人说的话，他坐在田埂上，看着两只羊在田里吃草。老人告诉他，等羊下了羊羔，日子就会好起来。福贵点点头，他说要等着下羊羔。'
             WHEN t.book_title = '三体' THEN '汪淼觉得，纳米材料学家汪淼的痛苦，主要是因为他对物理学理论的伤害。科学家们虽然得到的结果是正确的，但是得到结果的过程却让人愤怒。汪淼说：我们现在的物理学基础理论，就像一栋地基已经烂掉的大楼，科学家们在这栋大楼里装修得很豪华，却随时可能坍塌。'
             WHEN t.book_title = '小王子' THEN '我六岁的时候，在一本描写原始森林的书中看到一副精彩的画。画的是一条大蟒蛇正在吞食一只野兽。这本书上说：大蟒蛇把猎物整个吞下去，嚼都不嚼，然后就去睡上六个月的觉来消化。'
             WHEN t.book_title = '百年孤独' THEN '许多年之后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。那时的马孔多是一个二十户人家的村落，全是泥巴和芦苇盖成的屋子，沿河岸一字排开，湍急的河水清澈见底，河床里卵石洁白光滑。'
             ELSE '暂无内容'
        END),
    unnest(ARRAY[500, 600, 300, 400]) as word_count,
    unnest(ARRAY[8, 10, 5, 6]) as reading_time
FROM temp_book_ids t
WHERE t.book_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. 显示插入结果
SELECT 
    b.title as book_title,
    COUNT(bc.id) as chapter_count,
    SUM(bc.word_count) as total_words
FROM books b
LEFT JOIN book_content bc ON b.id = bc.book_id
WHERE b.title IN ('活着', '三体', '小王子', '百年孤独')
GROUP BY b.id, b.title
ORDER BY b.title;

-- 6. 删除临时表
DROP TABLE temp_book_ids;

SELECT 'SUCCESS: 图书内容安全添加完成！' as status;