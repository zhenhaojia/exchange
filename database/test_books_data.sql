-- 简化的图书数据测试脚本
-- 创建最基本的图书数据用于测试

-- 确保有用户
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM users LIMIT 1;
  
  IF sample_user_id IS NULL THEN
    sample_user_id := '00000000-0000-0000-0000-000000000001';
    INSERT INTO users (id, email, username, coins, level, exp)
    VALUES (sample_user_id, 'test@example.com', 'testuser', 100, 1, 0)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- 插入简单的测试图书
  INSERT INTO books (title, author, category, description, owner_id, exchange_coins, condition, tags, status) VALUES
  ('测试图书1', '测试作者1', '文学小说', '这是一本测试图书', sample_user_id, 20, 'good', ARRAY['测试'], 'available'),
  ('测试图书2', '测试作者2', '科技教育', '这是第二本测试图书', sample_user_id, 25, 'new', ARRAY['测试'], 'available'),
  ('测试图书3', '测试作者3', '历史传记', '这是第三本测试图书', sample_user_id, 30, 'good', ARRAY['测试'], 'available')
  ON CONFLICT DO NOTHING;
  
END $$;

-- 查看结果
SELECT '检查图书数据:' as info;
SELECT id, title, author, category, exchange_coins, status FROM books ORDER BY created_at DESC LIMIT 10;

SELECT 'SUCCESS: 测试图书数据创建完成！' as status;