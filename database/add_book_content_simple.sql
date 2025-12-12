-- 简化版图书内容添加脚本
-- 先确认图书存在，然后插入内容

-- 1. 确认图书存在
DO $$
DECLARE
    book_count INTEGER;
BEGIN
    -- 检查图书是否存在
    SELECT COUNT(*) INTO book_count FROM books WHERE title IN ('活着', '三体', '小王子', '百年孤独');
    
    IF book_count = 0 THEN
        RAISE EXCEPTION '没有找到示例图书，请先执行 add_sample_books.sql';
    END IF;
END $$;

-- 2. 使用具体ID插入内容（假设已存在）
-- 如果您的图书ID不同，请先查询 SELECT id, title FROM books; 获取正确的ID

INSERT INTO book_content (book_id, chapter_number, chapter_title, content, word_count, reading_time) VALUES
-- 《活着》- 请替换为实际的book_id
('your-living-book-id-here', 1, '第一章：少年福贵', 
'少年去放牛了，福贵对佃户说，他家的牛和毛驴是钱买的，现在两样畜都卖给老人了，换了两只羊。
老人说，日子会好起来的。福贵相信老人说的话，他坐在田埂上，看着两只羊在田里吃草。
老人告诉他，等羊下了羊羔，日子就会好起来。福贵点点头，他说要等着下羊羔。',
500, 8),

-- 《三体》- 请替换为实际的book_id  
('your-three-body-book-id-here', 1, '第一章：科学边界', 
'汪淼觉得，纳米材料学家汪淼的痛苦，主要是因为他对物理学理论的伤害。
科学家们虽然得到的结果是正确的，但是得到结果的过程却让人愤怒。
汪淼说：我们现在的物理学基础理论，就像一栋地基已经烂掉的大楼，
科学家们在这栋大楼里装修得很豪华，却随时可能坍塌。',
600, 10),

-- 《小王子》- 请替换为实际的book_id
('your-little-prince-book-id-here', 1, '第一章：画蛇', 
'我六岁的时候，在一本描写原始森林的书中看到一副精彩的画。
画的是一条大蟒蛇正在吞食一只野兽。
这本书上说：大蟒蛇把猎物整个吞下去，嚼都不嚼，然后就去睡上六个月的觉来消化。',
300, 5),

-- 《百年孤独》- 请替换为实际的book_id
('your-hundred-years-book-id-here', 1, '第一章：世界太新', 
'许多年之后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。
那时的马孔多是一个二十户人家的村落，全是泥巴和芦苇盖成的屋子，
沿河岸一字排开，湍急的河水清澈见底，河床里卵石洁白光滑。',
400, 6)

ON CONFLICT DO NOTHING;

-- 3. 显示插入结果和提示
SELECT 
    b.title as book_title,
    COUNT(bc.id) as chapter_count
FROM books b
LEFT JOIN book_content bc ON b.id = bc.book_id
WHERE b.title IN ('活着', '三体', '小王子', '百年孤独')
GROUP BY b.id, b.title
ORDER BY b.title;

SELECT 'SUCCESS: 图书内容添加完成！如果使用了占位符ID，请根据实际图书ID更新。' as status;