import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { logout } from '../../features/userSlice';

const drawerWidth = 240;
const navItems = ['Home'];


function Navbar(props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const [age, setAge] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleUsers = (event) => {
        setAge(event.target.value);
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const handleLogout = () => {
        localStorage.removeItem('admintoken');
        dispatch(logout())
        navigate('/admin/login')
    }

    const drawer = (
        <>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ my: 2 }}>
                    MUI
                </Typography>
                <Divider />
                <List className='drawer_links'>
                    {/* {navItems.map((item) => (
                        <Link className='link' to='/admin/pagelist'>
                            <ListItem key={item} >
                                <ListItemButton onClick={handleDrawerToggle} sx={{ textAlign: 'center', color: '#000', border: '1px solid silver', width: "200px", borderRadius: '5px', py: 1.2 }}>
                                    <ListItemText primary={item} />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    ))} */}
                    <Link className='link' to='/admin/pagelist'>
                        {/* <Button variant='outlined' onClick={handleDrawerToggle} sx={{ color: '#000', border: '1px solid silver', px: 9, py: 1.5 }}>
                        Pagelist
                    </Button> */}
                        <ListItem >
                            <ListItemButton onClick={handleDrawerToggle} sx={{ textAlign: 'center', color: '#000', border: '1px solid silver', width: '200px', borderRadius: '5px', py: 1.2 }}>
                                <ListItemText  >Pagelist</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    </Link>
                    <FormControl className='dropdown_link_mob' sx={{ my: 1 }}>
                        <Select
                            className='selector_mob'
                            value={age}
                            onChange={handleUsers}
                            displayEmpty
                        // inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="">
                                Select
                            </MenuItem>
                            <Link className='link' to='/admin/blogs'>
                                <MenuItem value='blogs'>Blogs</MenuItem>
                            </Link>
                            <MenuItem value={20}>Admin</MenuItem>
                            <Link className='link' to='/admin/serviceprovider'>
                                <MenuItem>Service Provider</MenuItem>
                            </Link>
                        </Select>
                    </FormControl>
                </List>
            </Box>
        </>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <AppBar component="nav">
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                        >
                            MUI
                        </Typography>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, pt: 2, mb: 2 }} className='nav_links'>
                            <Link className='link' to="">
                                <Button onClick={handleLogout} sx={{ color: '#000', border: '1px solid rgba(0, 0, 0, 0.25)', mx: 1, height: '38px' }}>
                                    Logout
                                </Button>
                            </Link>
                            <Link className='link' to='/admin/pagelist'>
                                <Button sx={{ color: '#000', border: '1px solid rgba(0, 0, 0, 0.25)', mx: 1, height: '38px' }}>
                                    Pagelist
                                </Button>
                            </Link>
                            <FormControl className='dropdown_link' sx={{ mx: 1 }}>
                                <Select
                                    value={age}
                                    onChange={handleUsers}
                                    displayEmpty
                                    className='selector'
                                >
                                    <MenuItem value="">
                                        Select
                                    </MenuItem>
                                    <Link className='link' to='/admin/blogs'>
                                        <MenuItem value='blogs'>Blogs</MenuItem>
                                    </Link>
                                    <MenuItem value='admin'>Admin</MenuItem>
                                    <Link to='/admin/serviceprovider'>
                                        <MenuItem>Service Provider</MenuItem>
                                    </Link>
                                </Select>
                            </FormControl>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box component="nav">
                    <Drawer
                        container={container}
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Box>
                <Box component="main" sx={{ p: 1 }}>
                    <Toolbar />
                </Box>
            </Box >
        </>
    );
}

// Navbar.propTypes = {
//     /**
//      * Injected by the documentation to work in an iframe.
//      * You won't need it on your project.
//      */
//     window: PropTypes.func,
// };

export default Navbar;
