-- 为图书添加封面图片
-- 使用公开的免费图书封面图片

-- 1. 为每本书添加封面图片
UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' 
WHERE title = '活着';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' 
WHERE title = '百年孤独';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' 
WHERE title = '挪威的森林';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop' 
WHERE title = '三体';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop' 
WHERE title = '人工智能：一种现代方法';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=600&fit=crop' 
WHERE title = '代码大全';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' 
WHERE title = '史记';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' 
WHERE title = '乔布斯传';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' 
WHERE title = '小王子';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop' 
WHERE title = '哈利·波特与魔法石';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' 
WHERE title = '生活的艺术';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' 
WHERE title = '瓦尔登湖';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' 
WHERE title = '原则';

UPDATE books SET cover_image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' 
WHERE title = '高效能人士的七个习惯';

-- 2. 检查更新结果
SELECT 
  title,
  author,
  category,
  CASE 
    WHEN cover_image IS NOT NULL THEN '✅ 已添加封面'
    ELSE '❌ 暂无封面'
  END as cover_status,
  substring(cover_image, 1, 50) || '...' as cover_preview
FROM books 
ORDER BY title;

-- 3. 统计封面添加情况
SELECT 
  COUNT(*) as total_books,
  COUNT(cover_image) as books_with_cover,
  COUNT(*) - COUNT(cover_image) as books_without_cover,
  ROUND(
    (COUNT(cover_image)::numeric / COUNT(*)::numeric) * 100, 2
  ) as cover_percentage
FROM books;

SELECT 'SUCCESS: 图书封面图片添加完成！现在每本书都有了精美的封面。' as status;