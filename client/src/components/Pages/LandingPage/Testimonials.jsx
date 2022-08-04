import React, { useContext } from 'react'
import { ThemeContext } from '../../../utils/context/ThemeContext'

const Testimonials = () => {
  const {darkMode} = useContext(ThemeContext);
  return (
    <div className='testimonials'>
    <div className='content3'>
        <div>
            <img className={darkMode ? 'dark' : 'light'} src='/img/testimonial.svg' alt='' />
        </div>

       <div className='info'>
        <h1>World leaders in Autonomous Cyber AI</h1>
        <p className={darkMode ? 'dark' : 'light'}> 
WhiteLint Global is an Indo-American startup focused on providing Training, Consultancy, and Solutions in
Network Security and Digital Forensics to various agencies. The company is currently headquartered in New
Delhi and provides services to offices, investigation agencies, law firms, and government outfits, etc.
       </p>
       </div> 
    </div>
    </div>
  )
}

export default Testimonials