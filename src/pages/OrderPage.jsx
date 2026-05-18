import React, { useState } from 'react';
import RequestSketch from '../components/RequestSketch';
import OrderTracking from '../components/OrderTracking';
import './OrderPage.css';

const OrderPage = ({ user, pricing, addRequest, clientRequests = [], updateRequest }) => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Filter requests for the logged-in customer
  const myRequests = user ? clientRequests.filter(req => req.name === user.username) : [];

  // Toggle expanded tracker
  const toggleExpand = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  // Calculate quick stats
  const totalCount = myRequests.length;
  const activeCount = myRequests.filter(req => ['Pending', 'Accepted', 'In Progress'].includes(req.status)).length;
  const completedCount = myRequests.filter(req => req.status === 'Completed').length;

  return (
    <div className="order-page-container">
      <div className="container">
        <header className="page-header text-center mb-4">
          <h1 className="serif display-1">{user ? `Welcome, ${user.username}` : 'Request a Custom Portrait'}</h1>
          <p className="text-dim">
            {activeTab === 'new' 
              ? 'Fill out the form below to start your commission.' 
              : 'Keep track of the live review process and artist updates for your portraits.'}
          </p>
        </header>

        {/* Tab selection shown only for logged-in users */}
        {user && (
          <div className="order-tabs-container">
            <button 
              className={`order-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              Commission a Sketch
            </button>
            <button 
              className={`order-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                setExpandedOrderId(null);
              }}
            >
              Track My Orders ({totalCount})
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {activeTab === 'new' ? (
          <RequestSketch pricing={pricing} addRequest={addRequest} user={user} />
        ) : (
          <div className="customer-dashboard-wrapper">
            {/* Summary statistics */}
            <div className="order-stats-overview">
              <div className="order-stat-card glass">
                <p className="label">Total Requests</p>
                <h3 className="value">{totalCount}</h3>
              </div>
              <div className="order-stat-card glass">
                <p className="label">Active Orders</p>
                <h3 className="value">{activeCount}</h3>
              </div>
              <div className="order-stat-card glass">
                <p className="label">Completed Work</p>
                <h3 className="value">{completedCount}</h3>
              </div>
            </div>

            {/* List of orders */}
            {totalCount > 0 ? (
              <div className="orders-list-wrapper">
                {myRequests.map(req => {
                  const isExpanded = expandedOrderId === req.id;
                  return (
                    <div key={req.id} className="customer-order-card glass">
                      {/* Card Header Info */}
                      <div className="order-card-header" onClick={() => toggleExpand(req.id)}>
                        <div className="order-card-info">
                          <div className="order-card-meta">
                            <span className="meta-label">ID</span>
                            <span className="meta-val">#{req.id}</span>
                          </div>
                          <div className="order-card-meta">
                            <span className="meta-label">Sketch Specifications</span>
                            <span className="meta-val">{req.type}</span>
                          </div>
                          <div className="order-card-meta">
                            <span className="meta-label">Requested On</span>
                            <span className="meta-val">{req.date || 'Recent'}</span>
                          </div>
                          <div className="order-card-meta">
                            <span className="meta-label">Price</span>
                            <span className="meta-val price">
                              {req.price ? `₹${req.price}` : 'Under Review'}
                            </span>
                          </div>
                        </div>

                        <div className="order-card-actions">
                          <span className={`status-badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                            {req.status}
                          </span>
                          <button className="btn-toggle-track">
                            {isExpanded ? 'Hide Status' : 'Track Order'}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Tracking Detail Section */}
                      <div className={`order-tracking-collapse ${isExpanded ? 'open' : ''}`}>
                        {isExpanded && (
                          <div className="order-tracking-content">
                            <OrderTracking request={req} updateRequest={updateRequest} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tracking-empty-state glass">
                <span>🎨</span>
                <h3>No Orders Found</h3>
                <p>You haven't commissioned any custom sketches yet. Let's create your first custom masterpiece!</p>
                <button className="btn-primary" onClick={() => setActiveTab('new')}>
                  Start Request
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
