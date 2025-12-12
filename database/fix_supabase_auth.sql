-- Supabase 认证问题修复脚本
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 确保 users 表结构正确
-- 删除可能存在的 users 表
DROP TABLE IF EXISTS public.users CASCADE;

-- 重新创建正确的 users 表
CREATE TABLE public.users (
    id UUID NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    coins INTEGER NOT NULL DEFAULT 50,
    exp INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_id PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_username_unique UNIQUE (username)
);

-- 2. 添加注释
COMMENT ON TABLE public.users IS '用户基本信息表';
COMMENT ON COLUMN public.users.id IS '用户ID，对应 auth.users.id';
COMMENT ON COLUMN public.users.email IS '用户邮箱';
COMMENT ON COLUMN public.users.username IS '用户名';
COMMENT ON COLUMN public.users.coins IS '虚拟币数量';
COMMENT ON COLUMN public.users.exp IS '经验值';
COMMENT ON COLUMN public.users.avatar_url IS '头像URL';

-- 3. 创建或替换用户创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, coins, exp)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
        50,  -- 初始 50 虚拟币
        0    -- 初始 0 经验
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 插入失败时记录错误但不阻止用户注册
        RAISE WARNING '创建用户资料失败: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 删除旧触发器并创建新触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. 设置 RLS 策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和更新自己的信息
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 6. 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. 授权
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 9. 验证修复结果
SELECT 
    '修复完成验证' as status,
    COUNT(*) as user_count
FROM public.users;

SELECT 
    '触发器状态' as status,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'auth.users';