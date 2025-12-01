import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  AccountCircle as UserIcon,
  Home as HomeIcon,
  Book as BookIcon,
  PostAdd as PostAddIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { text: '首页', icon: <HomeIcon />, path: '/' },
    { text: '图书列表', icon: <BookIcon />, path: '/books' },
    { text: '发布图书', icon: <PostAddIcon />, path: '/post' },
    { text: '我的', icon: <UserIcon />, path: '/profile' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const drawer = (
    <Box onClick={() => setMobileMenuOpen(false)} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        二手书市场
      </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
    </Box>
  )

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#2E7D32' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            📚 二手书市场
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2, flex: 1, maxWidth: 400 }}>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <TextField
                size="small"
                placeholder="搜索图书..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {menuItems.slice(1, 4).map((item) => (
              <Button
                key={item.text}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                {item.text}
              </Button>
            ))}
            <IconButton color="inherit" onClick={() => navigate('/cart')}>
              <Badge badgeContent={3} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
          </Box>

          <IconButton
            color="inherit"
            onClick={() => navigate('/cart')}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <Badge badgeContent={3} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar