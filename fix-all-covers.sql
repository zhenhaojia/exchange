-- 一键修复所有图书封面问题
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 确保所有图书都有封面URL
UPDATE public.books 
SET cover_url = CASE 
    WHEN cover_url IS NULL OR cover_url = '' THEN
        'https://picsum.photos/seed/' || 
        COALESCE(lower(category), 'book') || '-' || 
        lower(replace(title, ' ', '-')) || '-' || 
        id || '/200/280.jpg'
    ELSE cover_url
END
WHERE cover_url IS NULL OR cover_url = '';

-- 2. 同步 cover_image 到 cover_url（保持一致性）
UPDATE public.books 
SET cover_image = cover_url
WHERE (cover_image IS NULL OR cover_image = '') AND cover_url IS NOT NULL;

-- 3. 为没有 cover_image 的图书设置封面
UPDATE public.books 
SET cover_image = CASE 
    WHEN cover_image IS NULL OR cover_image = '' THEN
        'https://picsum.photos/seed/' || 
        COALESCE(lower(category), 'book') || '-' || 
        lower(replace(title, ' ', '-')) || '-' || 
        id || '/200/280.jpg'
    ELSE cover_image
END
WHERE cover_image IS NULL OR cover_image = '';

-- 4. 验证结果
SELECT 
    title,
    category,
    cover_url,
    cover_image,
    CASE 
        WHEN (cover_url IS NOT NULL AND cover_url != '') AND 
             (cover_image IS NOT NULL AND cover_image != '') THEN '✅ 完整'
        WHEN (cover_url IS NOT NULL AND cover_url != '') OR 
             (cover_image IS NOT NULL AND cover_image != '') THEN '⚠️ 部分'
        ELSE '❌ 缺失'
    END as status
FROM public.books 
ORDER BY created_at DESC;