
import React, { useContext } from "react";
import { ThemeContext } from "../../utils/context/ThemeContext";


const Card = (props) => {
    const { darkMode } = useContext(ThemeContext);
  return (
    <>
      <div style={{paddingTop:"20px"}} className='card1'>
               <div className={darkMode ? 'dark' : 'light'}>
               <div className="heading-h3">
        <h3 className={darkMode ? 'dark' : 'light'}>
       {props.title}
                </h3>
</div> 
      
        <div className="p-box">
        <p style={{textAlign:"justify"}} className={darkMode ? 'dark' : 'light'}>
    {props.desc}
        </p>
</div>
         <div className='bottom1'>
           <h3> {props.button} </h3>
           <div> 
           <img className={darkMode ? 'dark' : 'light'} src={props.img1} alt='' />
           </div> 
        </div>
</div>
       </div> 

 
    </>
  )}

export default Card