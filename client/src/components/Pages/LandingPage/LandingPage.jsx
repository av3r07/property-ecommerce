import React from 'react'
import Hero from './Hero'
import ProductsSection from './ProductsSection'
import ServicesSection from './ServicesSection'
import Testimonials from './Testimonials'

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '7rem' }}>
       <Hero />
       <ProductsSection />
      <ServicesSection />
      {/* <Testimonials />  */}
    </div>
  )
}

export default LandingPage