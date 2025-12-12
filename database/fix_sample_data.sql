-- 修复示例数据插入问题
-- 这个脚本会安全地创建示例数据

-- 方法1：先创建一个示例用户，然后创建图书
DO $$
DECLARE
  sample_user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- 检查是否有任何用户
  SELECT EXISTS(SELECT 1 FROM users LIMIT 1) INTO user_exists;
  
  IF user_exists THEN
    -- 使用现有用户
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- 插入示例图书（如果图书表为空）
    INSERT INTO books (title, author, category, description, owner_id, exchange_coins, condition)
    SELECT '活着', '余华', '文学小说', '讲述了一个人的一生，从地主少爷到贫苦农民的经历。', sample_user_id, 25, 'good'
    WHERE NOT EXISTS (SELECT 1 FROM books LIMIT 1);
    
    INSERT INTO books (title, author, category, description, owner_id, exchange_coins, condition)
    SELECT '百年孤独', '加西亚·马尔克斯', '文学小说', '魔幻现实主义文学的代表作。', sample_user_id, 30, 'good'
    WHERE (SELECT COUNT(*) FROM books) = 1;
    
    INSERT INTO books (title, author, category, description, owner_id, exchange_coins, condition)
    SELECT '三体', '刘慈欣', '科技教育', '中国科幻文学的里程碑作品。', sample_user_id, 35, 'new'
    WHERE (SELECT COUNT(*) FROM books) = 2;
    
    RAISE NOTICE '示例图书创建成功，使用现有用户ID: %', sample_user_id;
  ELSE
    -- 没有用户时，不创建图书（等待用户注册后通过触发器创建）
    RAISE NOTICE '暂无用户，跳过示例图书创建。用户注册后会自动创建相关数据。';
  END IF;
END $$;

-- 方法2：或者直接跳过示例数据（推荐）
-- 等待真实用户注册后，通过应用界面创建图书

-- 验证结果
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users

UNION ALL

SELECT 
  'books' as table_name,
  COUNT(*) as record_count
FROM books;