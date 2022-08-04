import React from 'react'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation();
  
  var token = localStorage.getItem('admintoken');
  console.log(token);

  return (
    <>
      {token !== null ? <>{ children }</> : <>
        {/* <Header /> */}
        {children}
        {/* <Footer /> */}
      </>}
      {/* <Header /> */}
        {/* {children} */}
        {/* <Footer /> */}
    </>
  )
}

export default Layout