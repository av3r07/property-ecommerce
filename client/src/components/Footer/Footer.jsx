import React from 'react'
import { NavLink } from 'react-router-dom'




const Footer = () => {
  return (
    <div className='footer'>

    <div className='content'>

    <div className='footer-logo'>
        <img src={'/img/whitelint-logo-footer.svg'} alt='' />
    </div>

    <menu>
        <ul>
            <li>
            <NavLink to='/' onClick={(e) => e.preventDefault()}>
                HOME
            </NavLink>
            </li>
           
           
           
            <li>
            <NavLink to='/' onClick={(e) => e.preventDefault()}>
                CONTACT US
            </NavLink>    
            </li>
            <li>
            <NavLink to='/' onClick={(e) => e.preventDefault()}>
                ABOUT US
                </NavLink>    
            </li>
            <li>
            <NavLink to='/' onClick={(e) => e.preventDefault()}>
                BLOG
            </NavLink>
            </li>
           
            <li> <NavLink to='/Privacy' >
             Privacy & Policy 
            </NavLink>      </li>
        </ul>
    </menu>

    <div className='follow-us'>
    <p> Follow us: </p>
        <section>
        <div>
         <img src='/img/facebook.png' alt='' />
        </div>

        <div>
        <img src='/img/twitter.png' alt='' />
        </div>

        <div>
         <img src='/img/Instagram.png' alt='' />
        </div>
        </section>
        

    </div>

    </div>


    </div>
  )
}

export default Footer