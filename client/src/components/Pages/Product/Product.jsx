import React, { useContext } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";
import Products1 from "./Product1"
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";



/* investigationProduct */
const data = [ 
  {
  heading:'Creep',
  content:'A user-friendly web crawler that lets its users conduct an intense search over the internet and represent the gathered information into an auto-generated PDF file. All it takes is a keyword i.e. a username, an email ID, a hostname, an IP address - you name it. It can build a complete social media profile of a person based on a simple input.'
  },

  {
      heading:'Wafer Nova',
      content: 'Keeping track of your investigative surfings over the dark web has now been made easy. With Dark Hound, a darknet investigation tool, investigators can not only access the dark web for their investigations but also keep track of their searches and sites along with their screenshots and links in a sequential manner for future reference.'
      },

      {
          heading:'Wafer super nova',
          content: 'WATCH OUT! IT COULD BE FAKE NEWS! Now distinguish between fake news item and authentic information in a much smarter way. Critical Eye, a fake news detecting tool, unveils the erroneous information and news at a click of a button. Just provide the Critical Eye with the information you are trying to check the authenticity of in the form of a picture, a text.'
          },
]

const Product = () => {
  const { darkMode } = useContext(ThemeContext);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };
 

  return (
    <>
      <section className="security-tool">
        <div className="content4">
          <div className="security-info">
            <div>
              <img className={darkMode ? "dark" : "light"} src="/img/" alt="" />
            </div>
            <h1
              style={{ fontSize: "38px", fontWeight: "70", paddingTop: "3rem"}}
            >
              Security Products and tools
            </h1>
            <h5
              style={{
                fontFamily: "Poppins",
                fontSize: "17px",
                fontWeight: "690",
                color:'whitesmoke',
                margin:"37px 0"
              }}
            >
              PART OF GOOGLE'S ZERO TRUST NETWORK ARCHITECTURE
            </h5>

            <p
              style={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: "200",
                lineHeight: "28px",
              textAlign:"justify"
              }}
              className={darkMode ? "dark" : "light"}
            >
              Unique, maverick, state-of-the-art quantized, hardware-based
              end-point security solutions capable of handling attacks from
              inside or outside the network. It is capable of providing
              protection against any and all known and unknown malwares/attack
              vectors. WAFER comes in 3 different variants. All variants cater
              to different kinds of critical information systems and guarantees
              security against any trojans, worms and zero-day
              vulnerabilities/attacks.
            </p>
          </div>
          <div className="security-logo">
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={
                  "/img/ai-cybersecurity-virus-protection-machine-learning2 1.svg"
                }
                alt=""
              />
            </div>

            <div>
              <img
                className={darkMode ? "dark" : "light"}
                // src={"/img/wave.svg"}
                alt=""
              />
            </div>

            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/square.svg"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* security products  */}
      <div className="product-section1">
        <h1
          style={{
            color: "#FF4801",
            fontFamily: "Poppins",
            fontSize: "38px",
            fontWeight: "400",
            lineHeight: "65px",
          }}
          className={darkMode ? "dark" : "light"}
        >
          Security Products
        </h1>
        <div className="slick-slider1">
        <Slider {...settings}>
        <div className="content5">
          <div style={{display: 'flex',flexDirection:"row"}}>
        <div className="logo2">
                {" "}
               
                <img style={{width: "347px",height:"347px"}} src={"img/waferlogoreemCHIP2crop 1.svg"} alt="" />
              </div>
        <div className="card2">
            <div>
            <h3>
            Wafer Chip </h3>
            </div>
            <p  style={{textAlign:"justify"}}  className={darkMode ? "dark" : "light"}>
            WhiteLint Wafer Chip, is an indigenously developed,
              state-of-the-art, hardware based anti-attack/malware security
              product especially designed to cater to ATM machines. Currently,
              the product boasts of being able to curb any sort of attack that
              may be inflicted on the ATM machines integrity, regardless of the
              manufacturer.
           
            </p>
          </div>
          </div>
        </div>
        <div className="content5">
          <div style={{display: 'flex',flexDirection:"row"}}>
        <div className="logo2">
                {" "}
               
                <img style={{width: "347px",height:"347px"}} src={"img/waferlogoreemCHIP2crop 1.svg"} alt="" />
              </div>
        <div className="card2">
            <div>
            <h3>WAFER NOVA </h3>
            </div>
            <p  style={{textAlign:"justify"}}  className={darkMode ? "dark" : "light"}>
            WhiteLint Wafer Nova, a revolutionary embedded hardware-based security solution meant to inhibit any known malware, ransomware, adware, virus, trojan, worm, time-bomb. Guaranteed protection for any critical information system in any given network. Ensured protection against zero-day attacks. Simple plug-in-play design taking the product to the top of the line, in terms of end-point security.
               
            </p>
          </div>
          </div>
        </div>
        <div className="content5">
          <div style={{display: 'flex',flexDirection:"row"}}>
        <div className="logo2">
                {" "}
               
                <img style={{width: "347px",height:"347px"}} src={"img/waferlogoreemCHIP2crop 1.svg"} alt="" />
              </div>
        <div className="card2">
            <div>
            <h3>WAFER SUPER NOVA </h3>
            </div>
            <p  style={{textAlign:"justify"}}  className={darkMode ? "dark" : "light"}>
            WhiteLint Wafer Super Nova, is a restricted usage machine, information regarding which can only be made available on demand, to eligible agencies only.
              
            </p>
          </div>
          </div>
        </div>
       
        
        </Slider>
        </div>
        <div className="content5">
       
        
        
        
         
        </div>
       
      </div>

      {/* Investigation and Forensic Products */}

      <div className='Investigation'>
    <div className='content6'>
    
        <div className={darkMode ? 'dark' : 'light'} >
          {
            darkMode ? 
          
            <img style={{width:"400px",height:"400px"}}  src='/img/13488940640381 1.svg' alt='' /> :
            <img style={{width:"400px",height:"400px"}}    src='/img/13488940640381lightmode.png' alt='' />
          }
        </div>

       <div className='info1'>
        <h1>Investigation and Forensic Products</h1>
        <p className={darkMode ? 'dark' : 'light'}> 
        Unique line of Network Forensic tools and Investigation platforms. Manufactured for the first time in India and uniquely designed to cater to the investigation process generally followed by the Indian Law Enforcement Agencies. These tools carry the WhiteLint guarantee of authenticity and performance of immaculate investigations. This line of make in India tools is not possible to be available with any other vendor.
       </p>
       </div> 
    </div>
    </div>

{/* Investigation Products */}

<div className='InvestigationProduct-section'>
    <h1 style={{color:'#FF4801'}} className={darkMode ? 'dark' : 'light'}>
    Investigation Products
        </h1>
        <Products1/>
        {/* <div className="slick-slider2">
      
    
    <Slider {...settings1}>
    { data.map((v,i) => 
      <div className='content7'>
        <div key={i} className='card3'>
        <h3>
            {v.heading}
        </h3>

        <div className='logo3'>
        </div> */}

        {/* <p className={darkMode ? 'dark' : 'light'}>
        {v.content}
        </p>
        </div>
       </div>
    ) } 
      </Slider>
   
    
    </div> */}
    </div>




    </>
  );
};

export default Product;
