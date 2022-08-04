import React, { useContext } from 'react'
import { ThemeContext } from '../../../utils/context/ThemeContext'

const Hero = () => {
  const {darkMode} = useContext(ThemeContext);
  return (
    <section className='hero'>

    <div className='content'>

    <div className='hero-info'>
    <div>
      <img className={darkMode ? 'dark' : 'light'} src='/img/triangle.svg' alt='' />
    </div>
    
    <p style={{margin:"20px 0px",textAlign:"justify"}} className={darkMode ? 'dark' : 'light'}>
    WhiteLint Global is an Indo-American startup focused on providing Training, Consultancy, and Solutions in
    Network Security and Digital Forensics to various agencies. The company is currently headquartered in New
    Delhi and provides services to offices, investigation agencies, law firms, and government outfits, etc.  
    </p>

    <div>
    <button className={darkMode ? 'dark' : 'light'}>
      Know More About Us
    </button>
    <button className={darkMode ? 'dark' : 'light'}>
      Connect With Us
    </button>
    </div>

    </div>

    <div className='hero-logo'>
    <div >
     <img className={darkMode ? 'dark' : 'light'} src={'/img/whitelint-logo-symbol-1.svg'} alt='' />
    </div>
     
     <div >
     <img className={darkMode ? 'dark' : 'light'} src={'/img/wave.svg'} alt='' />
     </div>

     <div style={{paddingLeft:'7rem',color:'white'}}>
     <img className={darkMode ? 'dark' : 'light'} src={'/img/square.svg'} alt='' />
     </div>
    
    </div>
    </div>
    
    
    
    </section>
  )
}

export default Hero