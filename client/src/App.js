import { createContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import axios from "axios";
import './App.css';
import './scss/styles.scss'
import Layout from './components/Layout/Layout';
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import { LandingPage } from './components/Pages'
import { Product } from './components/Pages'
import { WhiteLintScholar } from './components/Pages'
import { Services } from './components/Pages'
import { Blogs } from './components/Pages'
import { ContactUs } from './components/Pages'
import { AboutUs } from './components/Pages'
import Privacy from "./components/Privacy/Privacy"
import Login from "./components/Login/Login";
import List from "./components/Pagelist/List";
import ServiceProvider from "./components/Pagelist/ServiceProvider";
import { selectUser, login, logout } from "./features/userSlice";
import { useSelector, useDispatch } from 'react-redux';
import Blogpagelist from "./components/Pagelist/Blogpagelist";
import BlogDetail from "./components/Pages/Blogs/BlogDetail";


function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser)
  useEffect(() => {
    if (localStorage.getItem('admintoken') && window.location.pathname.includes('admin')) {
      fetchAdminDetails();
    }
    if (window.location.pathname.includes('admin') && !window.location.pathname.includes('admin/login')) {
      localStorage.setItem('whitelint-admin-backtrack-url', window.location.pathname)
    }
    // u && JSON.parse(u) ? 
  }, [window.location.pathname])

  const fetchAdminDetails = async () => {
    try {
      await axios.post('http://83.136.219.147:4000/v1/api/admin/fetchUserDetails', null, {
        headers: {
          'Authorization': localStorage.getItem('admintoken')
        }
      }).then(result => {
        dispatch(login(result.data));
      }).catch(err => {
        if (err.response.status === 401) {
          localStorage.removeItem('admintoken');
          dispatch(logout());
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <BrowserRouter >
      <Layout >

        {/* admin Routing */}
        {/* <Layout> */}
        <Routes>

          {user.signed ? (
            <>
              <Route path='/admin/pagelist' element={<List />} />
              <Route path='/admin/serviceprovider' element={<ServiceProvider />} />
              <Route path='/admin/blogs' element={<Blogpagelist />} />
            </>
          ) : <Route path='/admin/login' element={<Login />} />}

          <Route path='/admin/*' element={<Navigate to={(user.signed && localStorage.getItem('admintoken')) ? (localStorage.getItem('whitelint-admin-backtrack-url') ? localStorage.getItem('whitelint-admin-backtrack-url') : '/admin/pagelist') : '/admin/login'} />} />
          {/* User Routing */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/Product' element={<Product />} />
          <Route path='/WhiteLintScholar' element={<WhiteLintScholar />} />
          <Route path='/Services' element={<Services />} />
          <Route path='/Blogs' element={<Blogs />} />
          <Route path='/Blogs/:Blogid' element={<BlogDetail />} />
          <Route path='/ContactUs' element={<ContactUs />} />
          <Route path='/AboutUs' element={<AboutUs />} />
        </Routes>
      </Layout>
    </BrowserRouter>

  );
}

export default App;
