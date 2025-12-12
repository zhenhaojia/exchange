-- 修复表结构和关系的脚本
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 检查现有表结构
SELECT 
    'books表结构' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查 users 表结构
SELECT 
    'users表结构' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 重建 books 表（如果不存在或结构有问题）
DROP TABLE IF EXISTS public.books CASCADE;

CREATE TABLE public.books (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    description TEXT,
    category TEXT,
    cover_url TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exchange_coins INTEGER NOT NULL DEFAULT 0,
    condition_status TEXT DEFAULT 'good',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 添加注释
COMMENT ON TABLE public.books IS '图书信息表';
COMMENT ON COLUMN public.books.id IS '图书ID';
COMMENT ON COLUMN public.books.title IS '图书标题';
COMMENT ON COLUMN public.books.author IS '作者';
COMMENT ON COLUMN public.books.isbn IS 'ISBN号码';
COMMENT ON COLUMN public.books.description IS '图书描述';
COMMENT ON COLUMN public.books.category IS '分类';
COMMENT ON COLUMN public.books.cover_url IS '封面图片URL';
COMMENT ON COLUMN public.books.status IS '状态：available=可借阅, exchanged=已交换, unavailable=不可用';
COMMENT ON COLUMN public.books.owner_id IS '所有者ID，关联users表';
COMMENT ON COLUMN public.books.exchange_coins IS '交换所需虚拟币';
COMMENT ON COLUMN public.books.condition_status IS '图书状态：excellent=优秀, good=良好, fair=一般';

-- 5. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_books_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.update_books_updated_at_column();

-- 6. 插入示例数据
INSERT INTO public.books (title, author, description, category, owner_id, exchange_coins, status) VALUES
('JavaScript高级程序设计', 'Nicholas C. Zakas', 'JavaScript经典教程，适合初学者和进阶开发者', '编程', (SELECT id FROM public.users LIMIT 1), 10, 'available'),
('人类简史', '尤瓦尔·赫拉利', '从石器时代到21世纪的人类发展史', '历史', (SELECT id FROM public.users LIMIT 1), 15, 'available'),
('三体', '刘慈欣', '中国科幻小说的巅峰之作', '科幻', (SELECT id FROM public.users LIMIT 1), 20, 'available'),
('原则', '瑞·达利欧', '生活和工作的原则', '商业', (SELECT id FROM public.users LIMIT 1), 12, 'available'),
('思考，快与慢', '丹尼尔·卡尼曼', '诺贝尔经济学奖得主的心理学经典', '心理学', (SELECT id FROM public.users LIMIT 1), 18, 'available'),
('活着', '余华', '中国当代文学经典作品', '文学', (SELECT id FROM public.users LIMIT 1), 8, 'available')
ON CONFLICT DO NOTHING;

-- 7. 设置 RLS 策略
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Users can insert books" ON public.books
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own books" ON public.books
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own books" ON public.books
    FOR DELETE USING (auth.uid() = owner_id);

-- 8. 授权
GRANT ALL ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
GRANT SELECT ON public.books TO anon;

-- 9. 创建 daily_recommendations 表
DROP TABLE IF EXISTS public.daily_recommendations CASCADE;

CREATE TABLE public.daily_recommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    recommend_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 为 daily_recommendations 插入示例数据
INSERT INTO public.daily_recommendations (book_id, recommend_date, reason) 
SELECT id, CURRENT_DATE, '今日精选推荐'
FROM public.books 
LIMIT 3
ON CONFLICT DO NOTHING;

-- 11. 设置 daily_recommendations 的 RLS 策略
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily recommendations are viewable by everyone" ON public.daily_recommendations
    FOR SELECT USING (true);

GRANT ALL ON public.daily_recommendations TO authenticated;
GRANT SELECT ON public.daily_recommendations TO anon;

-- 12. 验证修复结果
SELECT 
    '修复完成验证' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('books', 'daily_recommendations') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 13. 检查外键关系
SELECT 
    '外键关系' as info,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'books';