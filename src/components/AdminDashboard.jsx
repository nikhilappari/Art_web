import React, { useState } from 'react';
import './AdminDashboard.css';
import { uploadToCloudinary } from '../utils/cloudinary';
import { api } from '../utils/api';

const AdminDashboard = ({ artworks, setArtworks, transformation, setTransformation, saveTransformation, pricing, setPricing, savePricing, clientRequests = [], updateRequest }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Cloudinary upload loading states
  const [isUploadingSketch, setIsUploadingSketch] = useState(false);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);

  // For the admin table, we'll treat all artworks as 'Published' by default if they don't have a status
  const galleryItems = artworks.map(item => ({
    ...item,
    status: item.status || 'Published'
  }));

  const [newSketch, setNewSketch] = useState({
    title: '',
    category: 'Charcoal',
    price: '',
    status: 'Published',
    image: '',
    description: '',
    type: 'Black & White' // Mapping status to type for the gallery
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this sketch?")) {
      setArtworks(prev => prev.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNewSketch(item);
    setShowUploadModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploadingSketch(true);
      try {
        const { secure_url } = await api.uploadFile(file);
        setNewSketch(prev => ({ ...prev, image: secure_url }));
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setIsUploadingSketch(false);
      }
    }
  };

  const handleTransformationChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const setUploading = type === 'before' ? setIsUploadingBefore : setIsUploadingAfter;
      setUploading(true);
      try {
        const { secure_url } = await api.uploadFile(file);
        setTransformation(prev => ({ ...prev, [type]: secure_url }));
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSketch.image) {
      alert("Please upload an image for the sketch.");
      return;
    }
    const type = newSketch.category.toLowerCase().includes('color') ? 'Color' : 'Black & White';
    const sketchWithMeta = { ...newSketch, type };

    if (editingItem) {
      setArtworks(prev => prev.map(item => item.id === editingItem.id ? { ...sketchWithMeta, id: item.id } : item));
    } else {
      setArtworks(prev => {
        const id = prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1;
        return [...prev, { ...sketchWithMeta, id }];
      });
    }
    closeModal();
    alert(editingItem ? "Sketch updated successfully!" : "Sketch uploaded successfully!");
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setEditingItem(null);
    setNewSketch({ title: '', category: 'Charcoal', price: '', status: 'Published', image: '', description: '', type: 'Black & White' });
  };

  const stats = [
    { label: "New Requests", value: 5, icon: "📥" },
    { label: "In Progress", value: 12, icon: "🎨" },
    { label: "Completed", value: 156, icon: "✅" },
    { label: "Revenue (MTD)", value: "₹28,400", icon: "💰" }
  ];

  const recentRequests = [
    { id: "ORD-921", name: "Ananya Sharma", type: "Color Portrait (A3)", status: "Pending", date: "2024-05-12" },
    { id: "ORD-920", name: "Rahul Varma", type: "Charcoal Sketch (A4)", status: "In Progress", date: "2024-05-11" },
    { id: "ORD-919", name: "Sneha Kapur", type: "Couple Portrait", status: "Completed", date: "2024-05-10" }
  ];

  const allRequests = [...(clientRequests || []), ...recentRequests];

  return (
    <section className="admin-section">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3 className="serif">Artist Console</h3>
          <p>Welcome, Nikhil</p>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`admin-nav-item ${activeTab === 'sketches' ? 'active' : ''}`} onClick={() => setActiveTab('sketches')}>Manage Sketches</button>
          <button className={`admin-nav-item ${activeTab === 'transformation' ? 'active' : ''}`} onClick={() => setActiveTab('transformation')}>Transformation</button>
          <button className={`admin-nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Client Requests</button>
          <button className={`admin-nav-item ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing & Settings</button>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="admin-main">
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Dashboard Overview</h2>
            <div className="admin-stats-grid">
              {stats.map(stat => (
                <div key={stat.label} className="admin-stat-card glass">
                  <span className="stat-icon">{stat.icon}</span>
                  <div className="stat-info">
                    <p className="stat-label">{stat.label}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-card glass mt-2">
              <h4 className="card-header">Recent Activity</h4>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot pending"></div>
                  <p>New request received from <strong>Ananya Sharma</strong> for a Color Portrait.</p>
                  <span className="activity-time">2 mins ago</span>
                </div>
                <div className="activity-item">
                  <div className="activity-dot completed"></div>
                  <p>Order <strong>ORD-919</strong> marked as completed.</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sketches' && (
          <div className="admin-tab-content">
            <div className="admin-header-row">
              <h2 className="admin-page-title">Manage Sketches</h2>
              <button className="btn-primary-small" onClick={() => setShowUploadModal(true)}>+ Upload New Sketch</button>
            </div>
            <div className="admin-card glass">
              <div className="admin-table">
                <div className="table-head">
                  <span>Artwork</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {galleryItems.map(item => (
                  <div key={item.id} className="table-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border-color)' }}></div>
                      )}
                      <span className="semibold">{item.title}</span>
                    </div>
                    <span>{item.category}</span>
                    <span>₹{item.price}</span>
                    <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => openEditModal(item)}>✏️</button>
                      <button className="icon-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transformation' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Home Transformation</h2>
            <div className="admin-card glass max-w-600">
              <h4 className="card-header">Manage Hero Transformation Section</h4>
              <p className="text-dim mb-2">Update the text and images displayed on your homepage.</p>
              
              <div className="form-group mb-2">
                <label>Section Title</label>
                <input 
                  type="text" 
                  value={transformation.title} 
                  onChange={(e) => setTransformation(prev => ({...prev, title: e.target.value}))} 
                />
              </div>

              <div className="form-group mb-2">
                <label>Section Subtitle</label>
                <textarea 
                  rows="2"
                  value={transformation.subtitle} 
                  onChange={(e) => setTransformation(prev => ({...prev, subtitle: e.target.value}))} 
                  className="admin-textarea"
                ></textarea>
              </div>

              <div className="transformation-manager-grid mt-2">
                <div className="form-group">
                  <label>Reference Photo (Before)</label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleTransformationChange('before', e)} 
                      className="file-input" 
                      id="before-upload" 
                      disabled={isUploadingBefore}
                    />
                    <label htmlFor="before-upload" className="file-label" style={{ opacity: isUploadingBefore ? 0.6 : 1, cursor: isUploadingBefore ? 'not-allowed' : 'pointer' }}>
                      {isUploadingBefore ? 'Uploading...' : 'Change Reference'}
                    </label>
                    <div className="image-preview-container mini" style={{ position: 'relative' }}>
                      {isUploadingBefore && (
                        <div className="mini-upload-loader">
                          <div className="spinner-mini"></div>
                        </div>
                      )}
                      <img src={transformation.before} alt="Before" className="upload-preview" style={{ opacity: isUploadingBefore ? 0.3 : 1 }} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sketch Photo (After)</label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleTransformationChange('after', e)} 
                      className="file-input" 
                      id="after-upload" 
                      disabled={isUploadingAfter}
                    />
                    <label htmlFor="after-upload" className="file-label" style={{ opacity: isUploadingAfter ? 0.6 : 1, cursor: isUploadingAfter ? 'not-allowed' : 'pointer' }}>
                      {isUploadingAfter ? 'Uploading...' : 'Change Sketch'}
                    </label>
                    <div className="image-preview-container mini" style={{ position: 'relative' }}>
                      {isUploadingAfter && (
                        <div className="mini-upload-loader">
                          <div className="spinner-mini"></div>
                        </div>
                      )}
                      <img src={transformation.after} alt="After" className="upload-preview" style={{ opacity: isUploadingAfter ? 0.3 : 1 }} />
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className="btn-primary mt-2" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Saving Changes...";
                  btn.disabled = true;
                  btn.style.opacity = "0.7";
                  
                  try {
                    if (saveTransformation) {
                      await saveTransformation(transformation);
                    }
                    btn.innerText = "Changes Saved Live!";
                    btn.style.background = "#008080";
                    btn.style.color = "white";
                  } catch (err) {
                    alert("Failed to save transformation settings: " + err.message);
                    btn.innerText = "Error Saving";
                  }
                  
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.background = "";
                    btn.style.color = "";
                  }, 2000);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ... requests and pricing tabs remain same ... */}
        {activeTab === 'requests' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Client Requests</h2>
            <div className="admin-card glass">
              <div className="admin-table requests-table">
                <div className="table-head">
                  <span>ID</span>
                  <span>Customer</span>
                  <span>Request Type</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {allRequests.map(req => (
                  <div key={req.id} className="table-row">
                    <span className="text-dim">{req.id}</span>
                    <span className="semibold">{req.name}</span>
                    <span>{req.type}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span className={`status-pill ${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span>
                      {req.customerApproval === 'Approved' && (
                        <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>✓ Agreed</span>
                      )}
                      {req.customerApproval === 'Declined' && (
                        <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>✗ Declined</span>
                      )}
                      {req.status === 'Accepted' && !req.customerApproval && (
                        <span style={{ fontSize: '0.65rem', color: '#d7b46a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>⏳ Awaiting User</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {req.images && req.images.length > 0 ? (
                        req.images.map((img, idx) => (
                          <a key={idx} href={img} download={`Reference_${req.id}_${idx + 1}.png`} className="icon-btn" title={`Download Photo ${idx + 1}`} style={{ fontSize: '0.9rem' }}>
                            ⬇️{idx + 1}
                          </a>
                        ))
                      ) : req.image ? (
                        <a href={req.image} download={`Reference_${req.id}.png`} className="icon-btn" title="Download Reference Photo">⬇️</a>
                      ) : null}
                      <button className="btn-table-action" onClick={() => setSelectedRequest(req)}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="admin-tab-content">
            <h2 className="admin-page-title">Pricing & Settings</h2>
            <div className="admin-card glass max-w-600">
              <h4 className="card-header">Base Pricing Manager</h4>
              <div className="pricing-grid">
                <div className="form-group">
                  <label>A4 Charcoal Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalA4} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Charcoal Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalA3} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Charcoal Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.charcoalCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, charcoalCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Graphite Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteA4} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Graphite Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteA3} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Graphite Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.graphiteCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, graphiteCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Color Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorA4} 
                    onChange={(e) => setPricing(prev => ({...prev, colorA4: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Color Single (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorA3} 
                    onChange={(e) => setPricing(prev => ({...prev, colorA3: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Color Couple (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.colorCouple} 
                    onChange={(e) => setPricing(prev => ({...prev, colorCouple: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Normal Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA4Normal} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA4Normal: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A4 Premium Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA4Premium} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA4Premium: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Normal Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA3Normal} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA3Normal: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>A3 Premium Frame (₹)</label>
                  <input 
                    type="text" 
                    value={pricing.frameA3Premium} 
                    onChange={(e) => setPricing(prev => ({...prev, frameA3Premium: e.target.value}))}
                  />
                </div>
              </div>
              <button 
                className="btn-primary mt-2" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Saving Changes...";
                  btn.disabled = true;
                  btn.style.opacity = "0.7";
                  
                  try {
                    if (savePricing) {
                      await savePricing(pricing);
                    }
                    btn.innerText = "Changes Saved Live!";
                    btn.style.background = "#008080";
                    btn.style.color = "white";
                  } catch (err) {
                    alert("Failed to save pricing: " + err.message);
                    btn.innerText = "Error Saving";
                  }
                  
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.background = "";
                    btn.style.color = "";
                  }, 2000);
                }}
              >
                Save Pricing Changes
              </button>
            </div>

            <div className="admin-card glass max-w-600 mt-2">
              <h4 className="card-header">Cloudinary Storage Settings</h4>
              <p className="text-dim mb-2" style={{ fontSize: '0.9rem' }}>
                Configure Cloudinary to store images securely in the cloud. This avoids local browser storage limitations (10MB limit) and supports higher resolution photos.
              </p>
              
              <div className="pricing-grid">
                <div className="form-group">
                  <label>Cloud Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. dxyz12345" 
                    value={pricing.cloudinaryCloudName || ''} 
                    onChange={(e) => setPricing(prev => ({...prev, cloudinaryCloudName: e.target.value}))}
                  />
                </div>
                <div className="form-group">
                  <label>Upload Preset (Unsigned)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. art_web_preset" 
                    value={pricing.cloudinaryUploadPreset || ''} 
                    onChange={(e) => setPricing(prev => ({...prev, cloudinaryUploadPreset: e.target.value}))}
                  />
                </div>
              </div>

              <div className="cloudinary-instructions mt-2 glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span className="semibold" style={{ color: 'var(--text-accent)' }}>Setup Guide:</span>
                <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                  <li>Create a free account at <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-accent)', textDecoration: 'underline' }}>cloudinary.com</a>.</li>
                  <li>Copy your <strong>Cloud Name</strong> from the console dashboard and paste it above.</li>
                  <li>Go to <strong>Settings &gt; Upload API</strong>, scroll to <strong>Upload presets</strong>, and click <strong>Add upload preset</strong>.</li>
                  <li>Set the <strong>Signing Mode</strong> to <strong>Unsigned</strong> and click <strong>Save</strong>.</li>
                  <li>Copy the resulting <strong>Upload Preset name</strong> and paste it above.</li>
                </ol>
              </div>

              <button 
                className="btn-primary mt-2" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  btn.innerText = "Saving Settings...";
                  btn.disabled = true;
                  btn.style.opacity = "0.7";
                  
                  try {
                    if (savePricing) {
                      await savePricing(pricing);
                    }
                    btn.innerText = "Settings Saved Live!";
                    btn.style.background = "#008080";
                    btn.style.color = "white";
                  } catch (err) {
                    alert("Failed to save Cloudinary settings: " + err.message);
                    btn.innerText = "Error Saving";
                  }
                  
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.background = "";
                    btn.style.color = "";
                  }, 2000);
                }}
              >
                Save Cloudinary Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass">
            <h3 className="serif mb-2">{editingItem ? 'Modify Artwork' : 'Upload New Artwork'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Artwork Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Golden Hour" 
                    required 
                    value={newSketch.title}
                    onChange={(e) => setNewSketch({...newSketch, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newSketch.category}
                    onChange={(e) => setNewSketch({...newSketch, category: e.target.value})}
                    className="admin-select"
                  >
                    <option value="Charcoal">Charcoal</option>
                    <option value="Graphite">Graphite</option>
                    <option value="Color Pencil">Color Pencil</option>
                    <option value="Oil Painting">Oil Painting</option>
                    <option value="Digital Sketch">Digital Sketch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Starting Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="1500" 
                    required 
                    value={newSketch.price}
                    onChange={(e) => setNewSketch({...newSketch, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newSketch.status}
                    onChange={(e) => setNewSketch({...newSketch, status: e.target.value})}
                  >
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Upload Artwork Photo</label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                      id="sketch-upload"
                      disabled={isUploadingSketch}
                    />
                    <label htmlFor="sketch-upload" className="file-label" style={{ opacity: isUploadingSketch ? 0.6 : 1, cursor: isUploadingSketch ? 'not-allowed' : 'pointer' }}>
                      {isUploadingSketch ? 'Uploading to Cloudinary...' : newSketch.image ? 'Change Photo' : 'Choose File'}
                    </label>
                    {isUploadingSketch && (
                      <div className="upload-loader-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="spinner"></div>
                        <span className="upload-loader-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Uploading to Cloudinary...</span>
                      </div>
                    )}
                    {!isUploadingSketch && newSketch.image && (
                      <div className="image-preview-container">
                        <img src={newSketch.image} alt="Preview" className="upload-preview" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Artwork Description</label>
                  <textarea 
                    placeholder="Describe the soul of this artwork..." 
                    rows="3"
                    value={newSketch.description}
                    onChange={(e) => setNewSketch({...newSketch, description: e.target.value})}
                    className="admin-textarea"
                  ></textarea>
                </div>
              </div>
              <div className="modal-actions mt-2">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary-small">{editingItem ? 'Save Changes' : 'Confirm Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass" style={{ maxWidth: '600px' }}>
            <h3 className="serif mb-2">Request Details: {selectedRequest.id}</h3>
            
            <div className="form-grid mb-2">
              <div className="form-group">
                <label>Customer Name</label>
                <p className="semibold">{selectedRequest.name}</p>
              </div>
              <div className="form-group">
                <label>Customer Approval</label>
                <p className="semibold">
                  {selectedRequest.customerApproval === 'Approved' ? (
                    <span style={{ color: '#4ade80', fontWeight: '600' }}>✅ Approved & Confirmed</span>
                  ) : selectedRequest.customerApproval === 'Declined' ? (
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>❌ Declined Quote</span>
                  ) : selectedRequest.status === 'Accepted' ? (
                    <span style={{ color: '#d7b46a', fontWeight: '600' }}>⏳ Awaiting Decision</span>
                  ) : (
                    <span className="text-dim">Pending Quote Review</span>
                  )}
                </p>
              </div>
              <div className="form-group full-width">
                <label>Portrait Type & Frame</label>
                <p>{selectedRequest.type} | Frame: {selectedRequest.frame || 'N/A'}</p>
              </div>
            </div>

            <div className="form-group full-width mb-2">
              <label>Reference Photos</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {selectedRequest.images && selectedRequest.images.length > 0 ? (
                  selectedRequest.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={img} alt={`Reference ${idx + 1}`} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                      <a href={img} download={`Reference_${selectedRequest.id}_${idx + 1}.png`} className="icon-btn" title="Download" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>⬇️</a>
                    </div>
                  ))
                ) : selectedRequest.image ? (
                  <div style={{ position: 'relative' }}>
                    <img src={selectedRequest.image} alt="Reference" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    <a href={selectedRequest.image} download={`Reference_${selectedRequest.id}.png`} className="icon-btn" title="Download" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>⬇️</a>
                  </div>
                ) : (
                  <p className="text-dim">No photos provided.</p>
                )}
              </div>
            </div>

            <div className="form-grid mb-2">
              <div className="form-group">
                <label>Final Price (₹)</label>
                <input 
                  type="number" 
                  value={selectedRequest.price || 0}
                  onChange={(e) => setSelectedRequest({...selectedRequest, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={selectedRequest.status}
                  onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width mb-2">
              <label>Message to Customer (Price/Reference Note)</label>
              <textarea 
                rows="3"
                placeholder="Explain the price update or details regarding the reference image..." 
                value={selectedRequest.adminNote || ''}
                onChange={(e) => setSelectedRequest({...selectedRequest, adminNote: e.target.value})}
                className="admin-textarea"
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.8rem', outline: 'none', resize: 'vertical' }}
              ></textarea>
            </div>

            <div className="modal-actions mt-2">
              <button type="button" className="btn-ghost" onClick={() => setSelectedRequest(null)}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary-small"
                onClick={() => {
                  if (updateRequest) {
                    updateRequest(selectedRequest);
                  }
                  alert("Request updated successfully!");
                  setSelectedRequest(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
