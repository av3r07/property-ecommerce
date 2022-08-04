import React, { useContext } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";

const AboutUs = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <>

<div className="logo14">
        <div 
        style={{    width: '125rem',
     marginRight: '41rem'}}
    
    >
          <img
            className={darkMode ? "dark" : "light"}
            src={"/img/circle-5090539.jpg"}
            alt=""
          />
        </div>
      </div>

      <div className="AboutUs-section">
        <div className="content20">
          <div className="card11">
            <h3 className={darkMode ? "dark" : "light"}>Who we are</h3>
            <p className={darkMode ? "dark" : "light"}>
            Ours is a driven network security solutions company, aiming at providing state-of-the-art network and cyber security solutions for industries, offices, organizations or individuals. Our organization’s services work under distinct heads, namely: Technical Consultation, Training and Academic Consultation, Investigative Consultation , Unique Network Security and Forensic Solutions and Research and Development Wing.
            </p>
          </div>
          
          <div className='logo15'>
    <div style={{paddingLeft:'8rem'}}>
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
      </div>

    </>
  );
};

export default AboutUs;
