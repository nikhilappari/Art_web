import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: "Prem Sai",
    text: "It's a beautiful color pencil portrait of my parents. The level of detail and realism is truly impressive.",
    occasion: "Anniversary Gift"
  },
  {
    id: 2,
    name: "Sunil Mattaparthi",
    text: "Absolutely loved my charcoal portrait. It captures every detail perfectly and feels very personal.",
    occasion: "Personal Portrait"
  },
  {
    id: 3,
    name: "Sohan",
    text: "Commissioned a color sketch for a loved one's birthday. It turned out to be the perfect gift!",
    occasion: "Birthday Gift"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section section-padding" id="reviews">
      <div className="container">
        <h2 className="section-title text-center">Collector Stories</h2>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card glass">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-footer">
                <div className="testimonial-info">
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-occasion">{t.occasion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
