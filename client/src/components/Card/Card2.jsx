
import React, { useContext } from "react";
import { ThemeContext } from "../../utils/context/ThemeContext";


const Card2 = (props) => {
    const { darkMode } = useContext(ThemeContext);
  return (
    <>
      <div style={{paddingTop:"20px"}} className='card2'>
               <div className={darkMode ? 'dark' : 'light'}>
               <div className="heading-h3">
        <h3 className={darkMode ? 'dark' : 'light'}>
       {props.title}
                </h3>
</div> 
        <div className='logo'>
        <img src={props.img} alt='' />
        </div>
        <div className="p-box">
        <p style={{textAlign:"justify"}} className={darkMode ? 'dark' : 'light'}>
    {props.desc}
        </p>
</div>
         <div className='bottom'>
           <h3> {props.button} </h3>
           <div> 
           <img className={darkMode ? 'dark' : 'light'} src={props.img1} alt='' />
           </div> 
        </div>
</div>
       </div> 

 
    </>
  )}

export default Card2