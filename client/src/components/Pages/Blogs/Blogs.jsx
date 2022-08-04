import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../../utils/context/ThemeContext";
import Axios from "axios";
import { Link } from "react-router-dom";


const Blogs = () => {
  const { darkMode } = useContext(ThemeContext);
  const [data, setData] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [latestBlog, setLatestBlog] = useState({});
  const [recentBlog, setRecentBlog] = useState([]);
  const [categoryBlog, setCategoryBlog] = useState([]);

  const fetchData = async () => {
    const result = await Axios.post(
      'http://83.136.219.147:4000/v1/api/user/showBlogs',
    );

    setData(result.data.data);
    setLatestBlog(result.data.data.latest_blog)
    setRecentBlog(result.data.data.recent_blogs)
    setBlogs(result.data.data.blogs)
    setCategoryBlog(result.data.data.blog_categories)
  };


  useEffect(() => {

    fetchData();
  }, []);

  console.log("sanjublog", data)
  console.log("setLatestBlog", latestBlog)
  console.log("setRecentBlog", recentBlog)
  console.log("setBlogs", blogs)
  console.log("setCategoryBlog", categoryBlog)


  return (
    <>
      <div className="blogs-section">
        {/* <div className="content16"> */}
        <div className="logo11">
          <div style={{ width: '45rem' }}>
            <img
              className={darkMode ? "dark" : "light"}
              src={"/img/Rectangle 73 (1).svg"}
              alt=""
            // style={{maxWidth:'22rem'}}
            />
          </div>
        </div>
        <div className="card7">

          <h3>{latestBlog.name}</h3>

          <p style={{ textAlign: "justify" }} className={darkMode ? "dark" : "light"}>
            {latestBlog.description}{" "}
          </p>

          <div className="bottom2">
            <h3> Read More </h3>
            <div>
              <img
                className={darkMode ? "dark" : "light"}
                src="/img/Arrow 1.svg"
                alt=""
              />
            </div>

          </div>

        </div>



      </div>

      {/* </div> */}

      {/* search bar */}
      <div className="search-header">
        <div className="searchBar-section">
          <div className="content-wrapper">
            <div style={{ marginLeft: "-40px" }}>
              <input
                type="text"
                placeholder="Search.. "
                className={darkMode ? "dark" : "light"}
                style={{
                  height: '30px',
                  width: '200px',
                  // left: '1101px',
                  // top: '981px',
                  borderRadius: '8px',
                  marginLeft: '-2rem'
                }}
              />
              <button style={{ position: 'absolute', width: '69px', height: '30px', padding: "-15px", backgroundColor: '#FF4801' }}
                className={darkMode ? "dark" : "light"}>
                <img style={{ width: '30px', height: '30px', marginTop: "-15px" }} className={darkMode ? 'dark' : 'light'} src='/img/Search.svg' alt='' />
              </button>
            </div>
            <div className="card-wrapper">



              <h3>Subscribe</h3>

              <p style={{ fontSize: '.8rem' }} className={darkMode ? "dark" : "light"}>
                Keep up to date with our weekly digest of articles
              </p>

              <button style={{ backgroundColor: '#FF4801', color: '#fff', margin: "20px 0px" }} className={darkMode ? "dark" : "light"}>Business Email</button>

              <p className={darkMode ? "dark" : "light"} style={{ fontSize: '.8rem' }}>
                By clicking Subscribe, I agree to the use of my personal data in accordance with Whitelint Privacy Policy. Whitelint will not sell, trade, lease, or rent your personal data to third parties.                        </p>

            </div><br />

            <div className="card-wrapper">
              <h3>Recent Posts</h3>
              {recentBlog.map((v, i) =>

                <p style={{ fontSize: '1rem' }} className={darkMode ? 'dark' : 'light'}>
                  {v.author}
                  <br />
                  {v.date}
                </p>

              )}


            </div>
            <div className="card-wrapper">
              <h3>Blog Categories</h3>
              {categoryBlog.slice(0, 8).map((v, i) =>

                <p style={{ fontSize: '1rem' }} className={darkMode ? 'dark' : 'light'}>
                  {v.name}
                </p>

              )}


            </div>


          </div>

        </div>


        {/* Blogs Card */}

        <div className='blogsCard-section'>

          <div className='content17'>

            {blogs.map((v, i) =>
              <div key={i} className='card8'>

                <div >
                  <img style={{ zIndex: "-3", marginLeft: "-27px", marginBottom: "-40px", position: "absolute", width: "100%", height: "98%", borderRadius: "0px 25px 25px 25px", opacity: "60%", filter: "brightness(50%)" }} className={darkMode ? 'dark' : 'light'} src={`http://83.136.219.147/whitelint/Uploads/${v.image}`} alt='' />
                </div>
                <h2>
                  {v.name}
                </h2>
                <div className='logo12'>
                </div>
                <p style={{ textAlign: 'justify' }} className={darkMode ? 'dark' : 'light'}>
                  {v.description}
                </p>
                <Link to={`/Blogs/${v.id}`}>
                  <div className='bottom3'>
                    <h3 style={{ fontSize: '1rem', color: '#FF4801' }}> Read More </h3>
                    <div>
                      <img className={darkMode ? 'dark' : 'light'} src='/img/Arrow 1.svg' alt='' />
                    </div>
                  </div>
                </Link>
              </div>

            )}

          </div>
        </div>

      </div>


    </>
  );
};

export default Blogs;
