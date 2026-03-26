import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../mock';
import { Button } from './ui/button';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ];

  const TestimonialCard = ({ testimonial }) => (
    <Card className="bg-[#FAFBFC] border border-[#E8ECF0] border-l-2 border-l-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-8">
        <span className="text-5xl leading-none text-[#1B2B4B]/10 font-serif select-none" style={{ fontFamily: 'Playfair Display, serif' }}>"</span>
        <div className="flex mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-gold fill-current" />
          ))}
        </div>
        <p className="text-[#4A5568] mb-6 italic leading-relaxed">"{testimonial.content}"</p>
        <div className="flex items-center">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            loading="lazy"
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <div className="font-bold text-[#1B2B4B]">{testimonial.name}</div>
            <div className="text-sm text-[#8896A6]">{testimonial.role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-20 bg-white reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1B2B4B] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            What Our Customers Say
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-4 mb-6"></div>
          <p className="text-xl text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative">
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, idx) => (
              <TestimonialCard key={`${testimonial.id}-${idx}`} testimonial={testimonial} />
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <TestimonialCard testimonial={testimonials[currentIndex]} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full border border-[#E8ECF0] hover:bg-[#F8FAFB] text-[#4A5568] hover:text-[#1B2B4B]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full border border-[#E8ECF0] hover:bg-[#F8FAFB] text-[#4A5568] hover:text-[#1B2B4B]"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-gold w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
