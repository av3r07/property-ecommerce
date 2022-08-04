
import React, { useState,useContext,useEffect } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";
import Axios from "axios";



import {useParams} from "react-router-dom"

function BlogDetail() {
    const { darkMode } = useContext(ThemeContext);
    const {Blogid} = useParams()
 
    const [blogs, setBlogs] = useState([]);
    const [blogs1, setBlogs1] = useState([]);
    const fetchData = async () => {
        const result = await Axios.post(
          'http://83.136.219.147:4000/v1/api/user/showBlogs',
        );
    
       
        setBlogs1(result.data.data.blogs)
       
      };
      
     useEffect(() => {
       
        fetchData();
      }, []);
     
      const data1 = blogs1.filter(prod => prod.id == Blogid)
      console.log("om namaha shivay",data1)
      
    
      
  return (
    <>
     { data1.map((v,i) => 
     <div className="blogs-section1">
        {/* <div className="content16"> */}
        
        <div className="logo111">
          
          <div style={{width:'45rem'}}>
            <img
              className={darkMode ? "dark" : "light"}
              src={`http://83.136.219.147/whitelint/Uploads/${v.image}`}
              alt="" 
              // style={{maxWidth:'22rem'}}
            />
          </div>
        </div>
          <div  className="card71">
          
            <h3 >{v.name}</h3>
          
            <h3 >Author :{v.author}</h3>
             
            <h4>Published On : {v.date}</h4>
           
        </div>
       
       
      
      </div>
      
       ) } 
       
      
      {/* </div> */}
   
    { data1.map((v,i) => 
        <div key={i} style={{padding:"0px 100px 100px 100px"}} className='card72'>
          <div className={darkMode ? 'dark' : 'light'}>
             <p  className={darkMode ? 'dark' : 'light'}>
        {v.description}
        </p></div>
    
       
      
      
   
       </div>
      
    ) } 
    </>
    
  )
}

export default BlogDetail