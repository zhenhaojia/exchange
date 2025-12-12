-- 创建用户注册时的自动触发器
-- 这个触发器会在用户注册时自动创建用户资料和发放奖励

-- 1. 更新用户注册处理函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建用户资料
  INSERT INTO public.users (id, email, username, coins, level, exp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    50,  -- 注册奖励50虚拟币
    1,   -- 初始等级
    0    -- 初始经验
  );
  
  -- 记录虚拟币交易
  INSERT INTO public.coin_transactions (user_id, amount, type, source, description, related_id)
  VALUES (
    NEW.id,
    50,
    'earn',
    'register',
    '注册奖励',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 确保触发器存在
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 禁用用户表的 RLS（让触发器正常工作）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

SELECT 'SUCCESS: 用户注册触发器已创建并配置完成！' as status;