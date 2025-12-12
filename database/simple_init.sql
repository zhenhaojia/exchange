-- Exchange Cloud 最简化初始化脚本
-- 逐步执行，每步都可以验证

-- 步骤1：启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 步骤2：创建用户表
CREATE TABLE users (
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

-- 步骤3：创建图书表
CREATE TABLE books (
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

-- 步骤4：创建虚拟币交易表
CREATE TABLE coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  source TEXT NOT NULL CHECK (source IN ('register', 'daily_checkin', 'daily_read', 'exchange', 'read', 'system')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤5：创建索引
CREATE INDEX idx_books_owner_id ON books(owner_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id);

-- 步骤6：创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 步骤7：创建更新触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 步骤8：创建虚拟币操作函数
CREATE OR REPLACE FUNCTION add_user_coins(user_uuid UUID, coin_amount INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET coins = coins + coin_amount, 
      updated_at = NOW() 
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_user_coins(user_uuid UUID, coin_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT coins INTO current_balance FROM users WHERE id = user_uuid;
  
  IF current_balance < coin_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE users 
  SET coins = coins - coin_amount, 
      updated_at = NOW() 
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 步骤9：创建用户注册处理函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, username, coins, level, exp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id, 1, 8)),
    50,
    1,
    0
  );
  
  INSERT INTO coin_transactions (user_id, amount, type, source, description)
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

-- 步骤10：创建用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 步骤11：启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- 步骤12：创建RLS策略
CREATE POLICY "用户查看自己的资料" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户更新自己的资料" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户查看所有可用图书" ON books
  FOR SELECT USING (status = 'available');

CREATE POLICY "用户管理自己的图书" ON books
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "用户查看自己的交易" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "系统插入交易记录" ON coin_transactions
  FOR INSERT WITH CHECK (true);

-- 步骤13：验证创建结果
SELECT 'SUCCESS: 基础表创建完成' as status;

-- 查看创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;