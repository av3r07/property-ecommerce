import React, { useContext, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeContext } from '../../utils/context/ThemeContext'
import { useEventListener, useMediaQuery, useUpdateOnce, useUpdateEffect } from '../../utils/custom_hooks'
import lightbackground from '../../assets/images/Background Large white (1X).png'
import darkbackground from '../../assets/images/Background Large (1X).png';





const Header = () => {
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [color, setColor] = useState("transparent")
  const [open, setOpen] = useState('')
  
 
  // const checkbox = document.getElementById('checkbox');

  // checkbox.addEventListener('change', ()=>{
  //   document.body.classList.toggle('dark');
  // })

  useUpdateOnce(() => {
    window.addEventListener("scroll", changeColor);
    return function cleanup() {
      window.removeEventListener("scroll", changeColor);
    };
  })

  useUpdateOnce(() => {

  })

  useEffect(() => {
    if (isMobile) {
      const menuBtn = document.querySelector('.menu-btn');
      let menuOpen = false;
      menuBtn.addEventListener('click', () => {
        if (!menuOpen) {
          menuBtn.classList.add('open');
          menuOpen = true;
          setOpen(' open')
        } else {
          menuBtn.classList.remove('open');
          menuOpen = false;
          setOpen('')
        }
      })
    }
  }, [isMobile])


  useUpdateEffect(() => {
    if (darkMode) document.body.style.backgroundImage = `url(${darkbackground})`

    document.body.style.backgroundImage = `url(${lightbackground})`

  }, [darkMode])

  const changeColor = () => {
    if (
      document.documentElement.scrollTop > 99 ||
      document.body.scrollTop > 99
    ) {
      setColor("blur");
    } else if (
      document.documentElement.scrollTop < 100 ||
      document.body.scrollTop < 100
    ) {
      setColor("transparent");
    }
  };

  const handleTheme = (e) => {
    e.preventDefault()
    setDarkMode(!darkMode)
  }




  return (
    <header className={'header ' + color}>
      <div className={'content'}>
      <div  className={darkMode ? "dark" : "light"}>
        
          {
            darkMode ? <img  src={'/img/whitelint-logo-white1.png'} alt='' /> :<img src={'/img/whitelint-logo-white1 Light Mode2.png'} alt='' /> 
           
          }
        
        
       
</div>


        <>
          <div style={{ display: isMobile ? 'flex' : 'none' }} className='menu-btn'>
            <div className={darkMode ? "menu-btn__burger dark" : "menu-btn__burger light"} ></div>
          </div>
        </>
        <menu className={isMobile ? 'mobile' + open : 'desktop'}>
          <ul>
            <li>
              <NavLink className={!darkMode && 'light'} to='/'> Home </NavLink>
            </li>
            <li>
              <NavLink className={!darkMode && 'light'} to='/Product'> Product </NavLink>
            </li>
            <li>
              <NavLink className={!darkMode && 'light'} to='/WhiteLintScholar'> Whitelint Scholar </NavLink>
              {/* <NavLink className={!darkMode && 'light'}  to='/WhiteLintScholar' onClick={(e) => e.preventDefault()}> whitelint Scholar </NavLink> */}

            </li>
            <li>
              <NavLink className={!darkMode && 'light'} to='/Services'> Services </NavLink>
            </li>
            <li>
              <NavLink className={!darkMode && 'light'} to='/Blogs'> Blogs </NavLink>
            </li>
            <li>
              <NavLink className={!darkMode && 'light'} to='/ContactUs'> Contact Us </NavLink>
            </li>
            <li>
            
              {/* <div>
    <input type="checkbox" class="checkbox" id="checkbox"/>
  <label for="checkbox" class="label">
  
     <span style={{ color: darkMode ? "grey" : "yellow" }}>☀︎</span>
     <span style={{ color: darkMode ? "#c96dfd" : "grey" }}>☽</span>
    <div class='ball'>
      </div>
  </label>
</div> */}
                <div className="toggle">
                  <div  className={darkMode ? 'dark' : 'light'} >
              <div className="container">
        {/* <span style={{ color: darkMode ? "grey" : "yellow" }}>☀︎</span> */}
        <div className="switch-checkbox">
          <label className="switch">
            <input type="checkbox" onChange={() => setDarkMode(!darkMode)} />
            <span className="slider round"> </span>
          </label>
        </div>
        <span style={{ color: darkMode ? "#c96dfd" : "grey" }}>☽</span>
      </div>
      </div>
      </div>
      {/* <NavLink className={!darkMode && 'light'} to='' onClick={handleTheme} >
              </NavLink> */}
            </li>
          </ul>
        </menu>





      </div>



    </header>
  )
}

export default Header