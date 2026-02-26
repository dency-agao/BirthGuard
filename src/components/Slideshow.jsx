import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Slideshow.css';

const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState(false);

  const slides = [
    { id: 1, image: `${process.env.PUBLIC_URL}/assets/slideshow1.jpg` },
    { id: 2, image: `${process.env.PUBLIC_URL}/assets/slideshow2.jpg` },
    { id: 3, image: `${process.env.PUBLIC_URL}/assets/slideshow3.jpg` },
  ];

  // Auto-advance every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="slideshow-container">
      {/* Slides */}
      <div className="slideshow-wrapper">
        {imageError ? (
          <div className="slide-placeholder">
            <p>Slideshow images not found</p>
            <p className="placeholder-text">Please add slideshow1.jpg, slideshow2.jpg, and slideshow3.jpg to public/assets/</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img 
                src={slide.image} 
                alt={`Slide ${index + 1}`}
                onError={handleImageError}
              />
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons */}
      {!imageError && (
        <>
          <button className="slide-nav prev-btn" onClick={goToPrevious}>
            <ChevronLeft size={24} />
          </button>
          <button className="slide-nav next-btn" onClick={goToNext}>
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="slide-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Slideshow;
