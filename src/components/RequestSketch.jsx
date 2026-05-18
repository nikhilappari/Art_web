import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestSketch.css';
import { api } from '../utils/api';

const RequestSketch = ({ pricing, addRequest, user }) => {
  const [formData, setFormData] = useState({
    style: 'Black & White (Charcoal)',
    type: 'Single Portrait',
    size: 'A4',
    frame: 'Without Frame',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      try {
        setFormData(JSON.parse(savedOrder));
        localStorage.removeItem('pendingOrder');
        // Give a small delay to ensure render is done, then alert
        setTimeout(() => alert("Welcome back! Your request details have been restored. Please click Submit Request to finalize your order."), 500);
      } catch (e) {
        console.error("Failed to parse pending order.");
      }
    }
  }, []);

  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const calculatePrice = () => {
    let base = 0;
    const { style, type, size, frame } = formData;

    // Use dynamic pricing if available, else use defaults
    const charcoalA4 = pricing?.charcoalA4 ? parseInt(pricing.charcoalA4) : 1500;
    const charcoalA3 = pricing?.charcoalA3 ? parseInt(pricing.charcoalA3) : 2500;
    const charcoalCouple = pricing?.charcoalCouple ? parseInt(pricing.charcoalCouple) : 3500;

    const graphiteA4 = pricing?.graphiteA4 ? parseInt(pricing.graphiteA4) : 1500;
    const graphiteA3 = pricing?.graphiteA3 ? parseInt(pricing.graphiteA3) : 2500;
    const graphiteCouple = pricing?.graphiteCouple ? parseInt(pricing.graphiteCouple) : 3500;
    
    const colorA4 = pricing?.colorA4 ? parseInt(pricing.colorA4) : 2200;
    const colorA3 = pricing?.colorA3 ? parseInt(pricing.colorA3) : 3200;
    const colorCouple = pricing?.colorCouple ? parseInt(pricing.colorCouple) : 4500;
    
    // Frame prices
    const frameA4Normal = pricing?.frameA4Normal ? parseInt(pricing.frameA4Normal) : 300;
    const frameA4Premium = pricing?.frameA4Premium ? parseInt(pricing.frameA4Premium) : 500;
    const frameA3Normal = pricing?.frameA3Normal ? parseInt(pricing.frameA3Normal) : 500;
    const frameA3Premium = pricing?.frameA3Premium ? parseInt(pricing.frameA3Premium) : 700;

    if (style === 'Black & White (Charcoal)') {
      if (type === 'Single Portrait') {
        base = size === 'A4' ? charcoalA4 : charcoalA3;
      } else {
        base = charcoalCouple;
      }
    } else if (style === 'Black & White (Graphite)') {
      if (type === 'Single Portrait') {
        base = size === 'A4' ? graphiteA4 : graphiteA3;
      } else {
        base = graphiteCouple;
      }
    } else {
      if (type === 'Single Portrait') {
        base = size === 'A4' ? colorA4 : colorA3;
      } else {
        base = colorCouple;
      }
    }

    if (frame === 'Normal Frame') {
      base += size === 'A4' ? frameA4Normal : frameA3Normal;
    } else if (frame === 'Premium Frame') {
      base += size === 'A4' ? frameA4Premium : frameA3Premium;
    }

    setEstimatedPrice(base);
  };

  useEffect(() => {
    calculatePrice();
  }, [formData, pricing]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = files.map(async (file) => {
          const res = await api.uploadFile(file);
          return res.secure_url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls] 
        }));
      } catch (error) {
        console.error("Uploads failed:", error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Size logic: Couple Portrait is only A3
    if (name === 'type' && value === 'Couple Portrait') {
      setFormData(prev => ({ ...prev, [name]: value, size: 'A3' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Please upload at least one reference photo.");
      return;
    }

    if (!user) {
      alert("Please sign in or create an account to send your request to the admin.");
      localStorage.setItem('pendingOrder', JSON.stringify(formData));
      navigate('/auth');
      return;
    }
    
    if (addRequest) {
      setIsSubmitting(true);
      
      setTimeout(() => {
        addRequest({
          name: user?.username || "Guest User",
          type: `${formData.style} - ${formData.type} (${formData.size})`,
          image: formData.images[0],
          images: formData.images,
          price: estimatedPrice,
          frame: formData.frame
        });
        alert("Submitted! The admin has received your photos and will review them shortly.");
        setFormData({
          style: 'Black & White (Charcoal)',
          type: 'Single Portrait',
          size: 'A4',
          frame: 'Without Frame',
          images: [],
        });
        setIsSubmitting(false);
      }, 1500);
    } else {
      alert("Submission functionality is currently unavailable.");
    }
  };

  return (
    <section className="request-section section-padding" id="contact">
      <div className="container">
        <div className="request-grid">
          <div className="request-info">
            <h2 className="section-title">Commission a Sketch</h2>
            <p className="request-text">
              Looking for a personalized gift or a keepsake? Fill out the form below to request a custom portrait. 
              The artist will review your request and get back to you with an approval and final price.
            </p>
            
            <div className="availability-banner glass">
              <span className="pulse-dot"></span>
              Currently accepting 5 custom orders this week.
            </div>

            <div className="pricing-preview glass">
              <h3 className="serif">Estimated Price</h3>
              <div className="price-value">₹{estimatedPrice}</div>
              <p className="price-note">* Final price may vary based on photo complexity.</p>
            </div>
          </div>

          <form className="request-form glass">
            <div className="form-group">
              <label>Sketch Style</label>
              <select name="style" value={formData.style} onChange={handleChange}>
                <option value="Black & White (Charcoal)">Black & White (Charcoal)</option>
                <option value="Black & White (Graphite)">Black & White (Graphite)</option>
                <option value="Color">Color (Pencil)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Portrait Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Single Portrait">Single Portrait</option>
                <option value="Couple Portrait">Couple Portrait</option>
              </select>
            </div>

            <div className="form-group">
              <label>Size</label>
              <select 
                name="size" 
                value={formData.size} 
                onChange={handleChange}
                disabled={formData.type === 'Couple Portrait'}
              >
                <option value="A4">A4 (Small)</option>
                <option value="A3">A3 (Large)</option>
              </select>
              {formData.type === 'Couple Portrait' && <small>Couple portraits are only available in A3.</small>}
            </div>

            <div className="form-group">
              <label>Frame Option</label>
              <select name="frame" value={formData.frame} onChange={handleChange}>
                <option value="Without Frame">Without Frame</option>
                <option value="Normal Frame">Normal Frame (+₹{formData.size === 'A4' ? (pricing?.frameA4Normal || '300') : (pricing?.frameA3Normal || '500')})</option>
                <option value="Premium Frame">Premium Frame (+₹{formData.size === 'A4' ? (pricing?.frameA4Premium || '500') : (pricing?.frameA3Premium || '700')})</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Reference Photos (Select multiple)</label>
              <div className="file-upload" style={{ position: 'relative' }}>
                <input type="file" id="photo" accept="image/*" multiple onChange={handleFileChange} hidden disabled={isUploading} />
                <label htmlFor="photo" className="file-label" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'block', opacity: isUploading ? 0.6 : 1 }}>
                  {isUploading ? 'Uploading to Cloudinary...' : formData.images.length > 0 ? `Add more photos (${formData.images.length} added)` : 'Click to upload photos'}
                </label>
                {isUploading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}>
                    <div className="spinner"></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uploading reference files...</span>
                  </div>
                )}
                {formData.images.length > 0 && !isUploading && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {formData.images.map((imgSrc, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={imgSrc} alt={`Preview ${idx + 1}`} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Sending pics to Admin...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RequestSketch;
