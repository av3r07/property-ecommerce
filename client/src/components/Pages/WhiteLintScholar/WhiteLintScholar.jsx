import React, { useContext } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";
import Card from "../../Card/Card1"
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const WhiteLintScholar = () => {
  const { darkMode } = useContext(ThemeContext);
  const settings = {
    dots: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000
  };

  /* Certificate Courses for Students*/
  const data = [
    {
      heading: "Network Defence and Countermeasures",
      content:
      "This certification course offers skill based training desired out of students of Cyber Security in the industry. Hands-on session is organized for students in which, through demonstration or experimentation, a student is able to execute Forensics\ Security link\ Investigative procedures and learn the real nuances of the subject. After this certification course the student is ready to tackle more complex investigation scenarios. This course touches complex topics and exercises that are often skipped by Academic Curriculae, but are mandatory skills for any Industry."
      
    },

    {
      heading: "Future Aspects of forensic science",
      content:""
       
    },
    {
      heading: "Advanced Concepts of Forensic Science",
      content:
        "This certificate course gives a detailed account of fresh aspects of Forensic Science to students of B.Sc. and M.Sc. Forensic Science. It is specially designed to give detailed hands-on knowledge to students of theafore mentioned courses, regarding fresh up and coming aspects of Forensic Science-that the student will generally not receive any input about-from their degree colleges. Topics that are often missed, neglected, or avoided are dealt with hands-on in this certificate course. Taking the course will enable a candidate to identify the actual skill required to secure a job in any industry pertaining to the subject. This course will introduce industry-acquired aspects of forensic science to the students. It will also make a student capable of standing above and beyond their competition with actual knowledge and skill to investigate cases in various covered aspects.",
    },
    {
      heading: "Forensic Accounting",
      content:
        "The Forensic Accounting Concentration offers specific training in investigation of frauds and its prevention. Students who wish to attend the forensic accounting course will understand and learn about the required techniques and skills to seek a career as a forensic accountant. One of the fastest expanding sectors of the accounting profession is forensic accounting. Financial fraud is investigated, litigated, prevented, and reported by forensic accountants. Preventing white-collar crime, tracing terrorist funding, forensic audit, exposing tax fraud, keeping a corporation compliance with regulatory requirements and uncovering wilful misrepresentation are just a few of their responsibilities.",
    },

    {
      heading: "Psychology and Criminology",
      content:
        "This certificate course gives a detailed account of fresh aspects of  Psychology to students of graduation and post-graduation. It is specially designed to give detailed knowledge about the topics to the students regarding fresh up and coming aspects of Psychology- that the student will generally not receive any input about-from their degree colleges. Topics that are often missed, neglected, or avoided are dealt with in this certificate course. Taking the course will enable a candidate to identify the actual skills required to secure a job in any industry pertaining to the subject. This course will introduce industry-acquired aspects of the subject to the students. It will also make a student capable of standing above and beyond their competition with actual knowledge and skill to investigate cases in various covered aspects.",
    },
  ];
  /*  Certificate Courses for Professional */
  const data1 = [
    {
      heading: "Network defence and counter measures",
      content:
        "This certification course offers skill based training desired out of students of Cyber Security in the industry. Hands-on session is organized for students in which, through demonstration or experimentation, a student is able to execute Forensics Security link Investigative procedures and learn the real nuances of the subject.",
    },

    {
      heading: "Future Aspects of forensic science",
      content:
        "",
    },

    {
      heading: "Advanced concepts of forensic science",
      content:
        "This certificate course gives a detailed account of fresh aspects of Forensic Science to students of B.Sc. and M.Sc. Forensic Science. It is specially designed to give detailed hands-on knowledge to students of the aforementioned courses, regarding fresh up and coming aspects of Forensic Science..",
    },
    {
      heading: "Cyber Crime Investigation",
      content:"It has been observed that professionals often suffer in the field from a lack of basic conceptual knowledge. Industry Professionals Master's Students dealing with information security and cybercrime investigations are often found short- changed when in a challenging situation and dealing with real-time case. This certification course bridges that gap"
        
    },
  ];


  return (
    <>
      <section className="whitelint">
        <div className="content8">
          <div className="whitelintscholar-info">
            <div>
              {/* <img
                className={darkMode ? "dark" : "light"}
                src="/img/triangle.svg"
                alt=""
              /> */}
            </div>
            <h1 >
              <span style={{marginLeft:"0px"}}>Academic Research and</span><span>Training Consultation Services</span> {" "}
            </h1>
            <p style={{textAlign:"justify"}} className={darkMode ? "dark" : "light"}>
              The Training and Academic Consultation Wing provides
              top-of-the-line Training in aspects of Digital Forensics, Network
              Security and Cyber Crime Investigations. The content is customized
              as per every service sector that requires the training and this
              service has been best utilized by Intelligence agencies, police
              and law enforcement agencies. The Academic Consultation extends to
              private Universities willing to establish courses in forensic
              science amongst their faculties. Our services allow such
              Universities to establish infrastructure and hire UGC qualified
              faculty members suitable to conducting under graduate and post
              graduate courses in Forensic Science, Cyber Security, Digital
              Forensics, Information Security and Assurance, eDiscovery and
              Cyber Law.
            </p>

            {/* <div className="search-scholar">
              <input 
            
                type="text"
                placeholder="Search certification courses "
                className={darkMode ? "dark" : "light"}
              
              />
              <button className={darkMode ? "dark" : "light"}>Search</button>
            </div> */}
          </div>
        </div>
      </section>

      <div className="logo4">
        <div style={{    width: '55rem',
    marginLeft: '14rem'}}>
      <div  className={darkMode ? "dark" : "light"}>
      {
        darkMode  ?  <img
       
        src={"/img/3820572 2.svg"}
        alt=""
      /> :  <img
     
      src={"/img/3820572lightmode.png"}
      alt=""
    />
      }
      </div>
     
        </div>
      </div>
      <div className="content8">
        <div>
        <div     className={darkMode ? "dark" : "light"} style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <p>
        
          Academic Consultation Services and Collaboration are available for{" "}
          </p>
          <p  > Universities and Institutions*</p>
        
         <p >
          For queries, registration and other details contact WhiteLint
        </p>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
          <button
            style={{
              margin:"20px 0px",
              width: "260px",
              height: "40px",
              Left: "25rem",
              top: "63px",
              border: "none",
              fontFamily: "Poppins",
              fontStyle: "normal",
              fontWeight: "300",
              fontSize: "20px",
              lineHeight: "15px",
              textAlign: "center",
              color: "#FFFFFF",
              backgroundColor: "#E07C24",
            }}
          >
            support@whitelint.com
          </button>
        </div>
        </div>
        </div>
       
      </div>
      {/* Certificate Courses for Students */}
      <div className="Certificate-section">
        <h1
          style={{
            color: "#FF4801",
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: "450",
            fontSize: "45px",
          }}
          className={darkMode ? "dark" : "light"}
        >
          Certificate Courses for Students
        </h1>
        <div className="slick-slider2">
        {/* <div className="content9"> */}
        <Slider {...settings}>
          
        {data.map((v, i) => (
<div>
<Card
title={v.heading}
desc={v.content}

/>
</div>
))}
 </Slider>
       
         
        </div>
        </div>
      {/* </div> */}

      {/* Certificate Courses for Professional */}
      <div className="Certificate-section1">
        <h1
          style={{
            color: "#FF4801",
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: "450",
            fontSize: "45px",
          }}
          className={darkMode ? "dark" : "light"}
        >
          Certificate Courses for Professional
        </h1>
        <div className="slick-slider2">
        {/* <div className="content10"> */}
        <Slider {...settings}>
          {data1.map((v, i) => (
<div>
            <Card
            title={v.heading}
            desc={v.content}
            // <div key={i} className="card5">
            //   <h3>{v.heading}</h3>

            //   <div className="logo6"></div>

            //   <p className={darkMode ? "dark" : "light"}>{v.content}</p>
            // </div>
            />
            </div>
          ))}
          </Slider>
        </div>
        </div>
      {/* </div> */}

      {/* Our Academic Partners */}

      <div className="Certificate-section2">
        <h1
          style={{
            color: "#FF4801",
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: "450",
            fontSize: "45px",
          }}
          className={darkMode ? "dark" : "light"}
        >
Our Academic Partners
        </h1>
        <div className="content11">
     

              <div className="logo7">
              <img className={darkMode ? 'dark' : 'light'} src='/img/download (1).svg' alt='' />
              <img className={darkMode ? 'dark' : 'light'} src='/img/download.svg' alt='' />
              <img className={darkMode ? 'dark' : 'light'} src='/img/Linux_Foundation_logo_2013.svg' alt='' />
              <img className={darkMode ? 'dark' : 'light'} src='/img/Red-Hat-Logo.svg' alt='' />
              </div>
        </div>
      </div>

    </>
  );
};

export default WhiteLintScholar;
