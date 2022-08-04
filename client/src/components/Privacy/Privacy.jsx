import React, {useContext,useState,useEffect }  from 'react'
import { ThemeContext } from '../../utils/context/ThemeContext'
import secure from "../../assets/images/secure.jpg"
import Axios from "axios"

const Privacy = () => {
  const {darkMode} = useContext(ThemeContext);
  const [data, setData] = useState();


 const fetchData = async () => {
    const result = await Axios.post(
      'http://83.136.219.147:4000/v1/api/user/privacyPolicy',
    );

    setData(result.data.data.privacy_policy);
  };
  

 useEffect(() => {
   
    fetchData();
  }, []);


 
  return (
  <>
  <div className='privacy-section'>  
  <div className='logo13' style={{position:"relative"}}>
    <div   style={{position:"absolute"}}>  <h1 className={darkMode ? 'dark' : 'light'}>
    Privacy
    </h1>
    <h3>July 17, 2022</h3></div>
  
<div  >
  
 <img className={darkMode ? 'dark' : 'light'} src={secure} alt='' />
</div>
 

</div>  
   
    <div className='content18'>
<h1>{data}</h1>
    {/* { data.privacy_policy((v,i) => 

<div key={i} className='card8'>
<h3>
   {v.privacy_policy}
</h3>

<div className='logo12'>

</div>

<p className={darkMode ? 'dark' : 'light'}>

</p>


</div>

) } */}

     
    </div>
    </div>

    {/* Indian Office */}

   


  </>

    )
}

export default Privacy

