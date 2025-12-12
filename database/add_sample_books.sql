-- 添加示例图书数据，丰富首页内容
-- 这些图书将展示在首页的精选推荐和统计数据中

-- 1. 首先检查是否有用户，如果没有就创建一个示例用户
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- 检查是否有用户，如果没有就使用一个示例ID
  IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    SELECT id INTO sample_user_id FROM users LIMIT 1;
  ELSE
    -- 使用一个固定的UUID作为示例用户ID
    sample_user_id := '00000000-0000-0000-0000-000000000001';
    
    -- 插入示例用户
    INSERT INTO users (id, email, username, coins, level, exp)
    VALUES (
      sample_user_id,
      'demo@example.com',
      'demo_user',
      200,
      3,
      150
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 2. 插入多样化的示例图书
  INSERT INTO books (title, author, category, description, owner_id, exchange_coins, read_coins, condition, tags, status) VALUES
  -- 文学小说类
  ('活着', '余华', '文学小说', '讲述了一个人的一生，从地主少爷到贫苦农民的经历。这是一部感人至深的作品，展现了人生的坚韧与希望。', sample_user_id, 25, 5, 'good', ARRAY['经典', '感人', '人生'], 'available'),
  ('百年孤独', '加西亚·马尔克斯', '文学小说', '魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的传奇故事。', sample_user_id, 30, 5, 'good', ARRAY['魔幻', '拉美文学', '经典'], 'available'),
  ('挪威的森林', '村上春树', '文学小说', '一部关于青春、爱情与成长的经典作品，深深影响了一代人。', sample_user_id, 20, 5, 'new', ARRAY['日本文学', '青春', '爱情'], 'available'),
  
  -- 科技教育类
  ('三体', '刘慈欣', '科技教育', '中国科幻文学的里程碑作品，讲述了地球文明与三体文明的宇宙史诗。', sample_user_id, 35, 5, 'new', ARRAY['科幻', '宇宙', '硬科幻'], 'available'),
  ('人工智能：一种现代方法', 'Stuart Russell', '科技教育', '人工智能领域的经典教材，全面介绍了AI的理论基础和实际应用。', sample_user_id, 40, 8, 'good', ARRAY['AI', '计算机', '教材'], 'available'),
  ('代码大全', 'Steve McConnell', '科技教育', '软件开发的经典指南，涵盖了编程的方方面面，是每个程序员的必读之作。', sample_user_id, 45, 8, 'good', ARRAY['编程', '软件开发', '经典'], 'available'),
  
  -- 历史传记类
  ('史记', '司马迁', '历史传记', '中国第一部纪传体通史，记录了从黄帝到汉武帝的历史。', sample_user_id, 25, 6, 'good', ARRAY['古典', '历史', '经典'], 'available'),
  ('乔布斯传', '沃尔特·艾萨克森', '历史传记', '苹果公司创始人史蒂夫·乔布斯的官方传记，展现了这位改变世界的人物的传奇一生。', sample_user_id, 30, 6, 'new', ARRAY['传记', '商业', '创新'], 'available'),
  
  -- 儿童读物类
  ('小王子', '安托万·德·圣-埃克苏佩里', '儿童读物', '一部写给大人的童话，用纯真的视角探讨爱与责任的深刻主题。', sample_user_id, 15, 3, 'good', ARRAY['童话', '经典', '哲理'], 'available'),
  ('哈利·波特与魔法石', 'J.K.罗琳', '儿童读物', '魔法世界的冒险故事，开启了一个奇幻的文学时代。', sample_user_id, 20, 4, 'new', ARRAY['魔法', '冒险', '奇幻'], 'available'),
  
  -- 生活艺术类
  ('生活的艺术', '林语堂', '生活艺术', '用幽默风趣的语言讲述如何享受生活的美好，是东方生活智慧的结晶。', sample_user_id, 22, 5, 'good', ARRAY['生活', '哲学', '东方'], 'available'),
  ('瓦尔登湖', '亨利·戴维·梭罗', '生活艺术', '记录了作者在瓦尔登湖畔两年的独居生活，倡导简单自然的生活方式。', sample_user_id, 18, 4, 'good', ARRAY['自然', '简约', '哲学'], 'available'),
  
  -- 职业技能类
  ('原则', '瑞·达利欧', '职业生涯', '桥水基金创始人的人生和工作原则，帮助读者建立自己的原则体系。', sample_user_id, 32, 7, 'new', ARRAY['商业', '投资', '管理'], 'available'),
  ('高效能人士的七个习惯', '史蒂芬·柯维', '职业生涯', '个人成长领域的经典之作，提供了改变人生的七个习惯。', sample_user_id, 28, 6, 'good', ARRAY['自我提升', '管理', '心理学'], 'available')
  
  ON CONFLICT DO NOTHING;
  
  -- 3. 更新一些统计数据（增加浏览量和点赞数）
  UPDATE books 
  SET 
    view_count = floor(random() * 200) + 50,
    like_count = floor(random() * 50) + 10
  WHERE view_count = 0 OR view_count IS NULL;
  
END $$;

-- 4. 创建一些每日推荐记录
INSERT INTO daily_recommendations (book_id, recommended_at, bonus_coins)
SELECT id, CURRENT_DATE, 5
FROM books 
WHERE tags && ARRAY['经典']
LIMIT 3
ON CONFLICT DO NOTHING;

-- 5. 查看插入结果
SELECT 
  '图书数据' as table_name,
  COUNT(*) as count
FROM books

UNION ALL

SELECT 
  '用户数据' as table_name,
  COUNT(*) as count
FROM users

UNION ALL

SELECT 
  '每日推荐' as table_name,
  COUNT(*) as count
FROM daily_recommendations;

-- 6. 展示一些示例图书
SELECT 
  title,
  author,
  category,
  exchange_coins,
  condition,
  view_count,
  like_count
FROM books 
ORDER BY view_count DESC, like_count DESC
LIMIT 10;

SELECT 'SUCCESS: 示例图书数据添加完成！首页现在应该更加丰富多彩了。' as status;