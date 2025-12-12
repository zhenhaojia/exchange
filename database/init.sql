-- Exchange Cloud 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 注意：中文全文搜索扩展 pg_trgm 需要超级用户权限，暂时不启用

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  coins INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  daily_check_in_last TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建图书表
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT DEFAULT '这本书暂时没有简介信息。',
  cover_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'exchanged', 'reserved')),
  exchange_coins INTEGER DEFAULT 20 CHECK (exchange_coins >= 0),
  read_coins INTEGER DEFAULT 5 CHECK (read_coins >= 0),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  location TEXT,
  exchange_count INTEGER DEFAULT 0 CHECK (exchange_count >= 0),
  read_count INTEGER DEFAULT 0 CHECK (read_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建交换记录表
CREATE TABLE IF NOT EXISTS exchanges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL CHECK (coins >= 0),
  type TEXT NOT NULL CHECK (type IN ('exchange', 'read')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. 创建虚拟币交易表
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  source TEXT NOT NULL CHECK (source IN ('register', 'daily_checkin', 'daily_read', 'exchange', 'read', 'system')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建每日推荐表
CREATE TABLE IF NOT EXISTS daily_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  recommend_reason TEXT NOT NULL,
  bonus_coins INTEGER DEFAULT 5 CHECK (bonus_coins >= 0),
  is_read BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, date)
);

-- 7. 创建用户会话表（用于在线阅读记录）
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建系统通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_books_owner_id ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_condition ON books(condition);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_author ON books USING gin(to_tsvector('simple', title || ' ' || author));

CREATE INDEX IF NOT EXISTS idx_exchanges_from_user ON exchanges(from_user_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_to_user ON exchanges(to_user_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_book_id ON exchanges(book_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);
CREATE INDEX IF NOT EXISTS idx_exchanges_created_at ON exchanges(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_source ON coin_transactions(source);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_recommendations_date ON daily_recommendations(date);
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_book_id ON daily_recommendations(book_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 10. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. 创建虚拟币操作存储过程
CREATE OR REPLACE FUNCTION add_user_coins(user_uuid UUID, coin_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := user_uuid;
  amount INTEGER := coin_amount;
BEGIN
  UPDATE users 
  SET coins = coins + amount, 
      updated_at = NOW() 
  WHERE id = current_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_user_coins(user_uuid UUID, coin_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := user_uuid;
  amount INTEGER := coin_amount;
  current_balance INTEGER;
BEGIN
  -- 获取当前余额
  SELECT coins INTO current_balance FROM users WHERE id = current_user_id;
  
  -- 检查余额是否足够
  IF current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  -- 扣除虚拟币
  UPDATE users 
  SET coins = coins - amount, 
      updated_at = NOW() 
  WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 创建用户注册触发器（自动创建用户资料）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, coins, level, exp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id, 1, 8)),
    50, -- 注册奖励
    1,
    0
  );
  
  -- 记录注册奖励交易
  INSERT INTO public.coin_transactions (user_id, amount, type, source, description)
  VALUES (
    NEW.id,
    50,
    'earn',
    'register',
    '注册奖励'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. 创建用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 16. 创建RLS策略

-- 用户表策略
CREATE POLICY "用户可以查看自己的资料" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 图书表策略
CREATE POLICY "任何人都可以查看可用的图书" ON books
  FOR SELECT USING (status = 'available');

CREATE POLICY "用户可以查看自己拥有的所有图书" ON books
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "用户可以管理自己的图书" ON books
  FOR ALL USING (auth.uid() = owner_id);

-- 交换记录表策略
CREATE POLICY "用户可以查看自己参与的交换" ON exchanges
  FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));

CREATE POLICY "用户可以创建交换申请" ON exchanges
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "用户可以更新自己收到的交换申请" ON exchanges
  FOR UPDATE USING (auth.uid() = to_user_id);

-- 虚拟币交易表策略
CREATE POLICY "用户可以查看自己的交易记录" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "系统可以插入交易记录" ON coin_transactions
  FOR INSERT WITH CHECK (true);

-- 阅读会话表策略
CREATE POLICY "用户可以查看自己的阅读记录" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的阅读记录" ON reading_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 通知表策略
CREATE POLICY "用户可以查看自己的通知" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的通知" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 每日推荐表策略（公开可读）
CREATE POLICY "任何人都可以查看每日推荐" ON daily_recommendations
  FOR SELECT USING (true);

-- 17. 创建一些示例数据（可选）
INSERT INTO books (title, author, category, description, owner_id, exchange_coins, condition) VALUES
('活着', '余华', '文学小说', '讲述了一个人的一生，从地主少爷到贫苦农民的经历。', 
 (SELECT id FROM users LIMIT 1), 25, 'good'),
('百年孤独', '加西亚·马尔克斯', '文学小说', '魔幻现实主义文学的代表作。', 
 (SELECT id FROM users LIMIT 1), 30, 'good'),
('三体', '刘慈欣', '科技教育', '中国科幻文学的里程碑作品。', 
 (SELECT id FROM users LIMIT 1), 35, 'new')
ON CONFLICT DO NOTHING;

-- 18. 创建一些函数用于统计查询
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_books', (SELECT COUNT(*) FROM books WHERE owner_id = user_uuid),
    'exchanged_books', (SELECT COUNT(*) FROM books WHERE owner_id = user_uuid AND status = 'exchanged'),
    'total_coins', (SELECT coins FROM users WHERE id = user_uuid),
    'total_transactions', (SELECT COUNT(*) FROM coin_transactions WHERE user_id = user_uuid),
    'reading_sessions', (SELECT COUNT(*) FROM reading_sessions WHERE user_id = user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. 创建清理过期数据的函数
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
  -- 清理30天前的阅读会话
  DELETE FROM reading_sessions WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 清理90天前的已读通知
  DELETE FROM notifications WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '90 days';
  
  -- 清理过期的每日推荐（保留30天）
  DELETE FROM daily_recommendations WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 可以设置定时任务来清理数据（需要Supabase的cron支持）
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

COMMIT;