import React, {useContext } from 'react'
import { ThemeContext } from '../../../utils/context/ThemeContext'
import Card from "../../Card/Card"

const ProductsSection = () => {
  const {darkMode} = useContext(ThemeContext);
  return (
    <div className='product-section'>
    <h1 className={darkMode ? 'dark' : 'light'}>
        Our Products
    </h1>
    <div className='content1'>

       <Card
       title="Security Product Tools"
       img={'img/cyber-security 1.svg'}
       desc=" Unique, maverick, state-of-the-art quantized, hardware-based end-point security solutions capable of handling attacks from inside or outside the network. It is capable of providing protection against any and all known and unknown malwares /attack vectors. WAFER comes in 3 different variants."
       button="Know More"
       img1={"/img/Arrow 1.svg"}

       />
         <Card
       title=" Investigation and Foresnsic Products"
       img={'img/crime-investigation (1).svg'}
       desc=" Unique line of Network Forensic tools and Investigation platforms. Manufactured for the first time in India and uniquely designed to cater to the investigation process generally followed by the Indian Law Enforcement Agencies. These tools carry the WhiteLint guarantee of authenticity and performance of immaculate investigations. This line of make in India tools is not possible to be available with any other vendor."
       button="Know More"
       img1={"/img/Arrow 1.svg"}

       />
    </div>
    </div>
  )
}

export default ProductsSection