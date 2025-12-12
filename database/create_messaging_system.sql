-- 联系书友消息系统
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'exchange_inquiry', 'book_question', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保用户不能给自己发消息
  CONSTRAINT messages_from_to_different CHECK (from_user_id != to_user_id)
);

-- 2. 创建对话会话表（用于显示对话列表）
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保用户ID的唯一性和顺序
  CONSTRAINT conversations_unique_users UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- 3. 创建消息已读回执表（可选，用于更精确的已读状态）
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (message_id, user_id)
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_book_id ON messages(book_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 复合索引用于对话查询
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(
  LEAST(from_user_id, to_user_id), 
  GREATEST(from_user_id, to_user_id), 
  created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived ON conversations(is_archived);

-- 5. 创建触发器：更新对话的最后消息
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新或创建对话记录
  INSERT INTO conversations (user1_id, user2_id, last_message_id, last_message_at)
  VALUES (
    LEAST(NEW.from_user_id, NEW.to_user_id),
    GREATEST(NEW.from_user_id, NEW.to_user_id),
    NEW.id,
    NEW.created_at
  )
  ON CONFLICT (LEAST(NEW.from_user_id, NEW.to_user_id), GREATEST(NEW.from_user_id, NEW.to_user_id))
  DO UPDATE SET
    last_message_id = NEW.id,
    last_message_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 为消息表添加触发器
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_conversation 
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- 7. 创建更新消息已读状态的函数
CREATE OR REPLACE FUNCTION mark_message_as_read(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 更新消息已读状态（只允许接收方标记已读）
  UPDATE messages 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = p_message_id 
    AND to_user_id = p_user_id;
  
  -- 插入已读回执
  INSERT INTO message_read_receipts (message_id, user_id)
  VALUES (p_message_id, p_user_id)
  ON CONFLICT (message_id, user_id) DO NOTHING;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建获取对话列表的视图
CREATE OR REPLACE VIEW conversation_list AS
SELECT DISTINCT
  c.*,
  -- 获取对话用户信息
  CASE 
    WHEN c.user1_id = auth.uid() THEN u2
    ELSE u1
  END as other_user,
  -- 获取最后一条消息信息
  m.content as last_message_content,
  m.from_user_id as last_message_from,
  m.created_at as last_message_time,
  -- 未读消息数量
  (SELECT COUNT(*) 
   FROM messages 
   WHERE LEAST(from_user_id, to_user_id) = LEAST(c.user1_id, c.user2_id)
     AND GREATEST(from_user_id, to_user_id) = GREATEST(c.user1_id, c.user2_id)
     AND is_read = FALSE 
     AND to_user_id = auth.uid()
  ) as unread_count
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id
LEFT JOIN messages m ON c.last_message_id = m.id
WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  AND c.is_archived = FALSE;

-- 9. 创建Row Level Security (RLS) 策略
-- 消息表的RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    from_user_id = auth.uid() OR 
    to_user_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    from_user_id = auth.uid()
  );

CREATE POLICY "Users can update read status" ON messages
  FOR UPDATE USING (
    to_user_id = auth.uid() AND 
    -- 只允许更新 is_read 字段
    (
      (is_read IS NOT NULL AND is_read = FALSE) OR
      updated_at IS NOT NULL
    )
  );

-- 对话表的RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    user1_id = auth.uid() OR 
    user2_id = auth.uid()
  );

-- 已读回执表的RLS
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their read receipts" ON message_read_receipts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their read receipts" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 10. 创建便利函数

-- 获取用户的消息对话列表
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_username TEXT,
  other_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    CASE 
      WHEN c.user1_id = auth.uid() THEN c.user2_id
      ELSE c.user1_id
    END as other_user_id,
    CASE 
      WHEN c.user1_id = auth.uid() THEN u2.username
      ELSE u1.username
    END as other_username,
    CASE 
      WHEN c.user1_id = auth.uid() THEN u2.avatar
      ELSE u1.avatar
    END as other_avatar,
    m.content as last_message,
    m.created_at as last_message_time,
    (SELECT COUNT(*) 
     FROM messages 
     WHERE LEAST(from_user_id, to_user_id) = LEAST(c.user1_id, c.user2_id)
       AND GREATEST(from_user_id, to_user_id) = GREATEST(c.user1_id, c.user2_id)
       AND is_read = FALSE 
       AND to_user_id = auth.uid()
    ) as unread_count
  FROM conversations c
  JOIN users u1 ON c.user1_id = u1.id
  JOIN users u2 ON c.user2_id = u2.id
  LEFT JOIN messages m ON c.last_message_id = m.id
  WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    AND c.is_archived = FALSE
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取特定对话的消息历史
CREATE OR REPLACE FUNCTION get_conversation_messages(
  other_user_id UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  message_id UUID,
  from_user_id UUID,
  to_user_id UUID,
  content TEXT,
  is_read BOOLEAN,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as message_id,
    m.from_user_id,
    m.to_user_id,
    m.content,
    m.is_read,
    m.type,
    m.created_at
  FROM messages m
  WHERE (m.from_user_id = auth.uid() AND m.to_user_id = other_user_id)
     OR (m.from_user_id = other_user_id AND m.to_user_id = auth.uid())
  ORDER BY m.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 发送消息
CREATE OR REPLACE FUNCTION send_message(
  to_user_id UUID,
  content TEXT,
  message_type TEXT DEFAULT 'message',
  related_book_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  -- 插入新消息
  INSERT INTO messages (from_user_id, to_user_id, book_id, content, type)
  VALUES (auth.uid(), to_user_id, related_book_id, content, message_type)
  RETURNING id INTO message_id;
  
  -- 创建通知给接收方
  INSERT INTO notifications (user_id, title, content, type, related_id)
  VALUES (
    to_user_id,
    '新消息',
    (SELECT username FROM users WHERE id = auth.uid()) || ' 给您发送了一条消息',
    'info',
    message_id
  );
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 标记整个对话为已读
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
  other_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- 更新所有未读消息为已读
  UPDATE messages 
  SET is_read = TRUE, updated_at = NOW()
  WHERE to_user_id = auth.uid() 
    AND from_user_id = other_user_id 
    AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- 插入已读回执
  INSERT INTO message_read_receipts (message_id, user_id, read_at)
  SELECT id, auth.uid(), NOW()
  FROM messages
  WHERE to_user_id = auth.uid() 
    AND from_user_id = other_user_id 
    AND is_read = TRUE
  ON CONFLICT (message_id, user_id) DO NOTHING;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;