import React, {useContext,useState }  from 'react'
import { ThemeContext } from '../../../utils/context/ThemeContext'


const ContactUs = () => {
  const {darkMode} = useContext(ThemeContext);
  


  return (
  <>
  <div className='ContactUs-section'>    
    <h1 className={darkMode ? 'dark' : 'light'}>
    Contact Us
    </h1>
    <div className='content18'>

       {/* <div className='card9'> */}
      <form   className={darkMode ? 'dark' : 'light'}>
                  <div className="input-field">
                    <input type="text" id="name" className="validate"   />
                    <label for="name" className="black-text">First Name</label>
                  </div>
                  <div className="input-field">
                    <input type="text" id="lname" className="validate"   />
                    <label for="name" className="black-text">Last Name</label>
                  </div>
                  <div className="input-field">
                    <input type="email" id="email"  />
                    <label for="email" className="black-text">Email</label>
                  </div>
                  <div className="input-field">
                    <input type="text" id="phone" />
                    <label for="phone" className="black-text"  >Phone</label>
                  </div>
                 
                  <input type="submit" value="Submit" className="btn black" />
                </form>
       {/* </div>  */}

     
    </div>
    </div>

    {/* Indian Office */}

    <section className='contactUs-section2'>

<div className='content19'>

<div className='contactUs-info'>

<h1  className={darkMode ? 'dark' : 'light'} >
Indian Office
</h1>
<p style={{border: '1px solid #FF4801',borderRadius: '15px',LineHeight:'45px',fontFamily: 'Poppins',padding:"5px",
fontStyle: 'normal',
fontWeight: '350',
fontSize: '14px',
height:'3rem'}} 
className={darkMode ? 'dark' : 'light'}>
Call us  at: +91 11 4669 6206
</p>
{/* <div>&nbsp;</div> */}
<p className={darkMode ? 'dark' : 'light'} style= {{margin:"10px 0 10px 0",padding:"5px",border: '1px solid #FF4801',borderRadius: '15px',height:'3rem',LineHeight:'40px',fontFamily: 'Poppins',
fontStyle: 'normal',
fontWeight: '350',
fontSize: '14px'}} >
Drop us mail: Lorem Ipsum
</p> <br />
<p className={darkMode ? 'dark' : 'light'} style={{width:'32rem',padding:"5px",height:"4rem",border:'1px solid #FF4801',borderRadius: '15px'}}>
Drop us mail: WhiteLint Global Private Limited, B-322/323.  Ansal Chambers 1, Bhikaji Cama Place, New Delhi-110066</p> 
{/* <div>
<button className={darkMode ? 'dark' : 'light'}>
  Know More About Us
</button>
<button className={darkMode ? 'dark' : 'light'}>
  Connect With Us
</button>
</div> */}

</div>

<div className='logo13'>
<div style={{paddingLeft:'8rem',    marginLeft: '-40rem'}}>
 <img className={darkMode ? 'dark' : 'light'} src={'/img/image 1.svg'} alt='' />
</div>
 

</div>
</div>



</section>

 {/* US Office */}

 <section className='contactUs-section2'>

<div className='content19'>

<div className='contactUs-info'>

<h1  className={darkMode ? 'dark' : 'light'} >
US Office
</h1>
<p style={{padding:"5px",border: '1px solid #FF4801',borderRadius: '15px',LineHeight:'45px',fontFamily: 'Poppins',
fontStyle: 'normal',
fontWeight: '350',
fontSize: '14px',
height:'3rem'}} 
className={darkMode ? 'dark' : 'light'}>
Call us  at: +91 11 4669 6206
</p>
{/* <div>&nbsp;</div> */}
<p className={darkMode ? 'dark' : 'light'} style= {{padding:"5px",margin:"10px 0 10px 0",border: '1px solid #FF4801',borderRadius: '15px',height:'3rem',LineHeight:'40px',fontFamily: 'Poppins',
fontStyle: 'normal',
fontWeight: '350',
fontSize: '14px'}} >
Drop us mail: Lorem Ipsum
</p> <br />
<p className={darkMode ? 'dark' : 'light'} style={{padding:"5px",width:'32rem',border:'1px solid #FF4801',borderRadius: '15px'}}>
Drop us mail: WhiteLint Global Private Limited, B-322/323.  Ansal Chambers 1, Bhikaji Cama Place, New Delhi-110066</p> 
{/* <div>
<button className={darkMode ? 'dark' : 'light'}>
  Know More About Us
</button>
<button className={darkMode ? 'dark' : 'light'}>
  Connect With Us
</button>
</div> */}

</div>

<div className='logo13'>
<div style={{paddingLeft:'8rem',    marginLeft: '-40rem'}}>
 <img className={darkMode ? 'dark' : 'light'} src={'/img/image 1.svg'} alt='' />
</div>
 

</div>
</div>



</section>
  
  </>

    )
}

export default ContactUs

