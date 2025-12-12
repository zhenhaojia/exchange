import React from 'react'
import { Image } from 'antd'
import { BookOutlined } from '@ant-design/icons'

interface BookCoverProps {
  coverUrl?: string | null
  title: string
  category?: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
}

const BookCover: React.FC<BookCoverProps> = ({
  coverUrl,
  title,
  category,
  className,
  style,
  width = 200,
  height = 280
}) => {
  // 生成默认封面URL
  const getDefaultCover = () => {
    const seed = `${category || 'book'}-${title.replace(/\s+/g, '-')}-${Date.now()}`
    return `https://picsum.photos/seed/${seed}/${width}/${height}.jpg`
  }

  // 如果没有封面URL或为空，使用默认封面
  const imageUrl = coverUrl && coverUrl.trim() !== '' ? coverUrl : getDefaultCover()

  return (
    <div className={`book-cover ${className || ''}`} style={style}>
      <Image
        src={imageUrl}
        alt={title}
        width={width}
        height={height}
        style={{
          objectFit: 'cover',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onError={(e) => {
          // 如果图片加载失败，使用备用的默认图片
          const target = e.target as HTMLImageElement
          target.src = getDefaultCover()
        }}
        preview={true}
        placeholder={
          <div 
            style={{
              width,
              height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: '8px'
            }}
          >
            <BookOutlined style={{ fontSize: '32px', color: '#bfbfbf', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px', color: '#8c8c8c', textAlign: 'center', padding: '0 8px' }}>
              {title.length > 20 ? title.substring(0, 20) + '...' : title}
            </div>
          </div>
        }
      />
    </div>
  )
}

export default BookCover