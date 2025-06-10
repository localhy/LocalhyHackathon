import React, { useState, useEffect } from 'react'

const ImageCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0)

  const images = [
    {
      src: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      alt: 'Local neighborhood street with shops'
    },
    {
      src: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      alt: 'Community entrepreneurs collaborating'
    },
    {
      src: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      alt: 'Local business owner in shop'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-yellow-400/20"></div>
        </div>
      ))}
      
      <div className="absolute bottom-8 left-8 right-8 text-center">
        <p 
          className="text-white text-lg font-medium drop-shadow-lg"
          style={{ fontFamily: 'Inter' }}
        >
          Empower Your Community with Localhy
        </p>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentImage ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel