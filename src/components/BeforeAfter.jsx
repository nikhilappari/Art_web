import React, { useState } from 'react';
import './BeforeAfter.css';

const BeforeAfter = ({ transformation }) => {
  if (!transformation || !transformation.before || !transformation.after) return null;

  return (
    <section className="ba-section section-padding">
      <div className="container">
        <div className="ba-header">
          <h2 className="section-title">{transformation.title}</h2>
          <p className="section-subtitle">{transformation.subtitle}</p>
        </div>

        <div className="ba-split-container">
          <div className="ba-side ba-left">
            <div className="ba-image-wrapper">
              <img src={transformation.before} alt="Reference" className="ba-split-image" />
              <div className="ba-label-tag">Reference</div>
            </div>
          </div>
          
          <div className="ba-divider-line"></div>
          
          <div className="ba-side ba-right">
            <div className="ba-image-wrapper">
              <img src={transformation.after} alt="Sketch" className="ba-split-image" />
              <div className="ba-label-tag">Sketch</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
