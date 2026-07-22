import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Listing.css';

const Listing = ({ currentUserId }) => {
    const navigate = useNavigate();
    const [flats, setFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Load More State
    const INITIAL_VISIBLE_COUNT = 6;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                
                const response = await axios.get('http://127.0.0.1:8000/api/flat-posts/', { headers });
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setFlats(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Reset visible count when search or sort criteria change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleLoadMore = () => {
        setVisibleCount((prevCount) => prevCount + 6);
    };

    const resolveImageUrl = (flat) => {
        if (!flat) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
        const flatId = flat.id || flat.pk || flat._id;
        const imgStr = flat.image_url || flat.image;

        if (typeof imgStr === 'string' && imgStr.trim() !== '') {
            if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) return imgStr;
            return `http://127.0.0.1:8000${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
        }
        if (flatId) return `http://127.0.0.1:8000/api/flat-posts/${flatId}/image/`;
        return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
    };

    const getFilteredAndSortedFlats = () => {
        let result = [...flats];
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(flat => {
                const areaMatch = flat.area?.toLowerCase().includes(query);
                const districtMatch = flat.district?.toLowerCase().includes(query);
                const addressMatch = (flat.full_address || flat.address)?.toLowerCase().includes(query);
                const titleMatch = flat.title?.toLowerCase().includes(query);
                return areaMatch || districtMatch || addressMatch || titleMatch;
            });
        }
        if (sortBy === 'price-low') return result.sort((a, b) => Number(a.price || a.rent) - Number(b.price || b.rent));
        if (sortBy === 'price-high') return result.sort((a, b) => Number(b.price || b.rent) - Number(a.price || a.rent));
        return result;
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this listing?")) return;

        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            await axios.delete(`http://127.0.0.1:8000/api/flat-posts/${id}/`, { headers });
            setFlats(prev => prev.filter(flat => (flat.id || flat.pk || flat._id) !== id));
        } catch (err) {
            console.error("Failed to delete listing:", err);
            alert("Could not delete listing.");
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        navigate(`/edit-flat/${id}`);
    };

    if (loading) {
        return (
            <main className="main-content loading-container">
                <div className="spinner"></div>
                <p>Loading flat listings...</p>
            </main>
        );
    }

    const allFilteredFlats = getFilteredAndSortedFlats();
    const displayedFlats = allFilteredFlats.slice(0, visibleCount);

    return (
        <main className="main-content">
            <div className="listings-header">
                <div className="header-left">
                    <h1>Apartment rent in Bangladesh</h1>
                    <span className="properties-count">{allFilteredFlats.length} Properties Found</span>
                </div>
                
                <div className="header-right">
                    <div className="search-box-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by area, district, or address..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    <div className="sort-box">
                        <label>Sort By:</label>
                        <select value={sortBy} onChange={handleSortChange}>
                            <option value="default">Default Order</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>

                    <div className="view-toggles">
                        <button 
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-7v2h14V6H7z"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="listings-wrapper">
                {allFilteredFlats.length === 0 ? (
                    <div className="no-results">
                        <p>No properties match your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className={`listings-container ${viewMode}-container`}>
                            {displayedFlats.map((flat) => {
                                const flatId = flat.id || flat.pk || flat._id;
                                const isOwner = currentUserId 
                                    ? flat.owner === currentUserId || flat.user === currentUserId 
                                    : true;

                                return (
                                    <div key={flatId} className="flat-card" onClick={() => navigate(`/flat-details/${flatId}`)}>
                                        <div className="card-image-wrapper">
                                            <img 
                                                src={resolveImageUrl(flat)} 
                                                alt={flat.area || 'Flat Image'} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                            <span className="tag-badge">Residential</span>
                                            <div className="floating-price-badge">
                                                BDT {Number(flat.price || flat.rent || 0).toLocaleString()}/mo
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="card-body-top">
                                                <div className="title-price-row">
                                                    <h3 className="flat-title">{flat.title || `Premium Flat In ${flat.area || ''}`}</h3>
                                                </div>
                                                
                                                <p className="flat-location">{flat.full_address || flat.address || flat.area || ''}</p>
                                                
                                                <div className="specs">
                                                    <span>🛏️ {flat.bedrooms || flat.beds || 0} Beds</span>
                                                    <span>🚿 {flat.bathrooms || flat.baths || 0} Baths</span>
                                                    <span>
                                                        📅 From: {flat.available_from || flat.available_date || flat.date_available || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-actions">
                                                <div className="flat-price-text">
                                                    BDT {Number(flat.price || flat.rent || 0).toLocaleString()}/mo
                                                </div>

                                                <button className="details-btn">
                                                    View Details
                                                </button>

                                                {isOwner && (
                                                    <div className="owner-actions">
                                                        <button 
                                                            className="edit-btn" 
                                                            onClick={(e) => handleEdit(e, flatId)}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button 
                                                            className="delete-btn" 
                                                            onClick={(e) => handleDelete(e, flatId)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {visibleCount < allFilteredFlats.length && (
                            <div className="load-more-wrapper">
                                <button className="load-more-btn" onClick={handleLoadMore}>
                                    Load More Properties ({allFilteredFlats.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default Listing;