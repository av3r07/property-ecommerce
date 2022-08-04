import React, { useContext } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Creep from "../../../assets/images/creep.jpg";
import  eye  from "../../../assets/images/Criticaleye.jpg"
import hound from "../../../assets/images/Dark_hound.jpg"



/* investigationProduct */
const data = [ 
  {
   image:[Creep],
  heading:'Creep',
  content:'A user-friendly web crawler that lets its users conduct an intense search over the internet and represent the gathered information into an auto-generated PDF file. All it takes is a keyword i.e. a username, an email ID, a hostname, an IP address - you name it. It can build a complete social media profile of a person based on a simple input.'
  },

  {
    image:[eye],
      heading:'Wafer Nova',
      content: 'Keeping track of your investigative surfings over the dark web has now been made easy. With Dark Hound, a darknet investigation tool, investigators can not only access the dark web for their investigations but also keep track of their searches and sites along with their screenshots and links in a sequential manner for future reference.'
      },

      {
        image:[hound],
          heading:'Wafer super nova',
          content: 'WATCH OUT! IT COULD BE FAKE NEWS! Now distinguish between fake news item and authentic information in a much smarter way. Critical Eye, a fake news detecting tool, unveils the erroneous information and news at a click of a button. Just provide the Critical Eye with the information you are trying to check the authenticity of in the form of a picture, a text.'
          },
]

const Product1 = () => {
  const { darkMode } = useContext(ThemeContext);
  const settings = {
    dots: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      speed: 2000,
      autoplaySpeed: 2000,
      cssEase: "linear"
  };
 

  return (
    <>
               
       
      
    
    <Slider {...settings}>
    { data.map((v,i) => (
     
        <div key={i} className='card1'>
        <div className={darkMode ? 'dark' : 'light'}>
        <div style={{paddingTop:"30px",paddingBottom:"20px",display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",textAlign:"justify"}} >
      <img style={{width:"70px",height:"70px"}} src={v.image}/>
      <h3>
            {v.heading}
        </h3>
          </div>
       

       

        <p style={{textAlign:"justify"}} className={darkMode ? 'dark' : 'light'}>
        {v.content}
        </p>
        </div>
        </div>
       
    ) )} 
      </Slider>
   
    
  
    




    </>
  );
};

export default Product1;
