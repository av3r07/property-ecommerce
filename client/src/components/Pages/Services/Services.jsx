import React, { useContext } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";

const Services = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <>
      <section className="services">
        <div className="content12">
          <div className="services-info">
            <h1
              style={{
                width: "928px",
                paddingTop: "2rem",
                fontFamily: "Poppins",
                fontStyle: "normal",
                fontWeight: "400",
                fontSize: "45px",
                lineHeight: "95px",
              }}
            >
              Investigative Consultants
            </h1>
            <p
              style={{
                fontFamily: "Poppins",
                fontStyle: "normal",
                fontWeight: "200",
                fontSize: "20px",
              }}
              className={darkMode ? "dark" : "light"}
            >
              The Investigative Consultation Wing is utilized by corporates,
              private laboratories and law enforcement agencies. Our services
              are utilized to design and implement smart and secure networks for
              those offices that are in possession of critical data.
            </p>
          </div>

          <div className="logo8">
            <div
              style={{
                width: "404px",
                height: "403px",
                left: "82px",
                top: "80px",
              }}
            >
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/217710%201%20(1).svg"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* icons  */}
      <div className="content13">
        <div className="card6">
          <div className="logo8">
            <img
              className={darkMode ? "dark" : "light"}
              src={"img/backup.svg"}
              alt=""
            />
          </div>
          <h3 className={darkMode ? "dark" : "light"}>Data Recovery</h3>
        </div>
        <div className="card6">
          <div className="logo8">
            <img
              className={darkMode ? "dark" : "light"}
              src={"img/Internet crime investigation.svg"}
              alt=""
            />
          </div>
          <h3 className={darkMode ? "dark" : "light"}>
            Internet Crime Investigation
          </h3>
        </div>
        <div className="card6">
          <div className="logo8">
            <img
              className={darkMode ? "dark" : "light"}
              src={"img/Search 1.svg"}
              alt=""
            />
          </div>
          <h3 className={darkMode ? "dark" : "light"}>Search</h3>
          <br />
        </div>
        <br /> <br />
        <div className="card6">
          <div className="logo8">
            <img
              className={darkMode ? "dark" : "light"}
              src={"img/217710 1.svg"}
              alt=""
            />
          </div>
          <h3 className={darkMode ? "dark" : "light"}>Multimedia Investigation</h3>
        </div>
        <div className="card6">
          <div className="logo8">
            <img
              className={darkMode ? "dark" : "light"}
              src={"img/fingerprint 1.svg"}
              alt=""
            />
          </div>
          <h3 className={darkMode ? "dark" : "light"}>Physical Evidence</h3>
        </div>
      </div>

      {/* data Recovery  */}
      <section className="data"> 
        <div className="content14">
          <div className="dataRecovery-info">
            <h1>Data Recovery</h1>
            <ul
              className={darkMode ? "dark" : "light"}
              
            >
              <li>Hard Disk </li>
              <li>SSD</li>
              <li>Pen Drive</li>
              <li>Mobile Phone</li>
            </ul>
          </div>

          <div className="logo9" >
            <div >
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/Vector 18.png"}
                alt=""
              />
            </div>
            <div >
              <img              
                className={darkMode ? "dark" : "light"}
                src={"/img/side circles 4.svg"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* internet crime investigation */}
      <section className="data1">
        <div className="content15">
          <div className="logo10" >
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/Vector 19.png"}
                alt=""
              />
            </div>
            <div>
              <img              
                className={darkMode ? "dark" : "light"}
                src={"/img/side circles 4.svg"}
                alt=""
              />
            </div>
          </div>
          <div className="dataRecovery-info1">
            <h1>internet crime investigation</h1>
            <ul
              className={darkMode ? "dark" : "light"}
            >
              <li>Message Tracking </li>
              <li>Employee Tracking</li>
              <li>Network Monitoring</li>
              <li>Password Cracking</li>
              <li>Social Media Crimes</li>
              <li>Anti Stalking</li>
              <li>Background Verification</li>
              <li>Dark-net Investigation </li>
              <li>Fake news Detection</li>
              <li>Crypto- Currency Tracking</li>

            </ul>
          </div>

  
        </div>
      </section>

      {/* search */}

      <section className="data">
        <div className="content14">
          <div className="dataRecovery-info">
            <h1>search</h1>
            <ul
              className={darkMode ? "dark" : "light"}
            >

              <li>Missing Person</li>
              <li>Missing Phone</li>
            </ul>
          </div>

          <div className="logo9" >
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/Vector 20.png"}
                alt=""
              />
            </div>
            <div>
              <img              
                className={darkMode ? "dark" : "light"}
                src={"/img/side circles 4.svg"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Multimedia Investigation */}

      <section className="data1">
        <div className="content15">
          <div className="logo10" >
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/vector 24.png"}
                alt=""
              />
            </div>
            <div>
              <img              
                className={darkMode ? "dark" : "light"}
                src={"/img/side circles 4.svg"}
                alt=""
              />
            </div>
          </div>
          <div className="dataRecovery-info1">
            <h1>Multimedia Investigation</h1>
            <ul 
              className={darkMode ? "dark" : "light"}
            >
              <li>Audio File Forensic</li>
              <li>Audio Authentication</li>
              <li>Video File Forensic</li>
              <li>Video Authentication</li>
            </ul>
          </div>

  
        </div>
      </section>

      {/* Physical Evidence */}
      <section className="data">
        <div className="content14">
          <div className="dataRecovery-info">
            <h1>Physical Evidence</h1>
            <ul
              className={darkMode ? "dark" : "light"}
            >
              <li>Signature Comparision</li>
              <li>Document Forgery</li>
              <li>Handwriting Comparision</li>
              <li>Fingerprinting Lifting and Comparision</li>
            </ul>
          </div>

          <div className="logo9" >
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src={"/img/Vector 22.png"}
                alt=""
              />
            </div>
            <div>
              <img              
                className={darkMode ? "dark" : "light"}
                src={"/img/side circles 4.svg"}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>



    </>
  );
};

export default Services;
