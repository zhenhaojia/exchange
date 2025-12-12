-- 修复 books 表缺失字段的脚本
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 添加缺失的字段
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 2. 添加注释
COMMENT ON COLUMN public.books.view_count IS '浏览次数';
COMMENT ON COLUMN public.books.like_count IS '点赞次数';

-- 3. 验证字段添加
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND column_name IN ('view_count', 'like_count')
ORDER BY column_name;

-- 4. 创建缺失的表

-- 交换记录表
CREATE TABLE IF NOT EXISTS public.exchanges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    coins_transferred INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.exchanges IS '图书交换记录表';
COMMENT ON COLUMN public.exchanges.status IS '状态：pending=待处理, completed=已完成, cancelled=已取消';

-- 阅读会话表
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    coins_cost INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    is_free_read BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

COMMENT ON TABLE public.reading_sessions IS '阅读会话表';

-- 虚拟币交易表
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
    source TEXT NOT NULL CHECK (source IN ('daily_checkin', 'purchase', 'refund', 'carousel_free_read', 'system_bonus', 'reading_reward', 'penalty')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.coin_transactions IS '虚拟币交易记录表';

-- 5. 设置 RLS 策略
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- 6. 授权
GRANT ALL ON public.exchanges TO authenticated;
GRANT ALL ON public.reading_sessions TO authenticated;
GRANT ALL ON public.coin_transactions TO authenticated;
GRANT ALL ON public.exchanges TO service_role;
GRANT ALL ON public.reading_sessions TO service_role;
GRANT ALL ON public.coin_transactions TO service_role;

-- 7. 验证所有表
SELECT 
    '表状态检查' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('books', 'users', 'exchanges', 'reading_sessions', 'coin_transactions', 'daily_recommendations')
ORDER BY table_name;