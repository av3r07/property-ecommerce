import React, { useContext } from 'react'
import { ThemeContext } from '../../../utils/context/ThemeContext'

const data = [ 
    {
    heading:'Investigation Consultant',
    content: " The Investigative Consultation Wing is utilized by corporates, private laboratories and law enforcement agencies. Our services are utilized to design and implement smart and secure networks for those offices that are in possession of critical data. We can provide customized secure network set ups and exclusive red-hat hardened network set ups for guaranteeing data security to organizations carrying vital data that may be targeted by competition or malicious users. Investigation services for various digital and some physical evidences can also be provided in private and government cases. All procedures and tools are as per International Forensic Processing Standards."
    },

   

        {
            heading:'Legal and Economic Offence Consultation',
            content: " Some Investigation cases involving search/seizure, tracking and surveillance require a legal closure. Registered advocates and other legal services are provided to clients so they can efficiently utilize the findings made by the investigation team.Top criminal Investigation firms are made available for Legal Consultation to our clients."
            
        },

            {
                heading:'Research and Development',
                content: ' Research and Development is at the core of WhiteLint. We have a state of the art network laboratory in-house. We boast of top-of-the-line Servers, GPU Units and Sandboxes allowing security exercises, testing and reliable prototyping of fresh solutions for any and all kinds of network security and forensic tasks. We have already successfully prototyped technologies worth 100 Crores and work on projects for Universities, Ministries, Law Enforcement Agencies and the Government. Our R&D service is the first-of-its-kind service in India. They promote the Make in India initiative and provide a platform allowing various organizations and venture capitalists a chance to invest in innovative solutions.'
            
        },
 ]

const ServicesSection = () => {
    const {darkMode} = useContext(ThemeContext);
  return (
    <div className='service-section'>
    <h1 className={darkMode ? 'dark' : 'light'}>
        Our Services
    </h1>
    <div className='content2'>

    { data.map((v,i) => 

        <div key={i} className='card1'>
             <div className={darkMode ? 'dark' : 'light'}>
             <div className="heading-h3">
        <h3>
            {v.heading}
        </h3>
</div>
       
        <div className="p-box">
        <p style={{textAlign:"justify",marginBottom:"50px"}} className={darkMode ? 'dark' : 'light'}>
        {v.content}
        </p>
</div>
        <div className='bottom1'>
           <h3> Know More </h3>
           <div> 
           <img className={darkMode ? 'dark' : 'light'} src='/img/Arrow 1.svg' alt='' />
           </div> 
        </div>
</div>
       </div>
    ) }
        

 
    </div>
    </div>
  )
}

export default ServicesSection