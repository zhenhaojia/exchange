-- 更新图书封面数据的脚本
-- 在 Supabase 控制台的 SQL 编辑器中执行

-- 1. 更新现有图书的封面图片
UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/book-cover-' || id || '/200/280.jpg'
WHERE cover_url IS NULL OR cover_url = '';

-- 2. 为不同类别的图书设置更合适的封面
UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/javascript-advanced-' || id || '/200/280.jpg'
WHERE category = '编程' AND (cover_url IS NULL OR cover_url = '');

UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/history-sapiens-' || id || '/200/280.jpg'
WHERE category = '历史' AND (cover_url IS NULL OR cover_url = '');

UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/scifi-three-body-' || id || '/200/280.jpg'
WHERE category = '科幻' AND (cover_url IS NULL OR cover_url = '');

UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/business-principles-' || id || '/200/280.jpg'
WHERE category = '商业' AND (cover_url IS NULL OR cover_url = '');

UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/psychology-thinking-' || id || '/200/280.jpg'
WHERE category = '心理学' AND (cover_url IS NULL OR cover_url = '');

UPDATE public.books 
SET cover_url = 'https://picsum.photos/seed/literature-alive-' || id || '/200/280.jpg'
WHERE category = '文学' AND (cover_url IS NULL OR cover_url = '');

-- 3. 验证更新结果
SELECT 
    title,
    category,
    cover_url,
    CASE 
        WHEN cover_url IS NOT NULL AND cover_url != '' THEN '✓ 有封面'
        ELSE '✗ 无封面'
    END as cover_status
FROM public.books 
ORDER BY created_at;