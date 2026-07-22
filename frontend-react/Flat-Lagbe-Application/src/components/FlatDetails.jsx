import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom"; // ✅ Fixed!
import axios from 'axios';

const FlatDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flat, setFlat] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

    useEffect(() => {
        let activeBlobUrl = null;

        const fetchFlatDataAndImage = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch Flat Details
                const detailsResponse = await axios.get(`http://127.0.0.1:8000/api/flat-posts/${id}/`, { headers });
                setFlat(detailsResponse.data);

                // Fetch Secure Image Asset
                try {
                    const imgResponse = await axios.get(`http://127.0.0.1:8000/api/flat-posts/${id}/image/`, {
                        headers,
                        responseType: 'blob'
                    });
                    activeBlobUrl = URL.createObjectURL(imgResponse.data);
                    setImageSrc(activeBlobUrl);
                } catch (imgErr) {
                    console.warn("Using fallback image asset:", imgErr);
                    setImageSrc(FALLBACK_IMAGE);
                }

            } catch (err) {
                console.error("Error fetching flat details:", err);
                if (err.response && err.response.status === 401) {
                    setError("Your session has expired. Please log in again.");
                } else {
                    setError("Failed to load property details. It may have been removed.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFlatDataAndImage();

        return () => {
            if (activeBlobUrl) {
                URL.revokeObjectURL(activeBlobUrl);
            }
        };
    }, [id]);

    const handleCopyContact = (phone) => {
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- 1. SKELETON LOADING STATE ---
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.topNavSkeleton}></div>
                <div style={styles.heroSkeleton}></div>
                <div style={styles.grid}>
                    <div>
                        <div style={styles.cardSkeleton}></div>
                        <div style={styles.cardSkeleton}></div>
                    </div>
                    <div>
                        <div style={styles.sidebarSkeleton}></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- 2. ERROR STATE ---
    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorCard}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#111827' }}>Notice</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 20px 0' }}>{error}</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => navigate(-1)} style={styles.secondaryButton}>Go Back</button>
                        <button onClick={() => navigate('/login')} style={styles.primaryButton}>Log In</button>
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic ordinal suffix for floor numbers (1st, 2nd, 3rd, 4th...)
    const formatFloor = (floor) => {
        if (floor === 0 || floor === '0' || floor === 'Ground') return 'Ground Floor';
        if (!floor && floor !== 0) return '—';
        const num = parseInt(floor, 10);
        if (isNaN(num)) return `${floor} Floor`;
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        return `${num}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]} Floor`;
    };

    return (
        <div style={styles.container}>
            {/* Top Navigation Row */}
            <div style={styles.topBar}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <span style={{ fontSize: '1.1rem' }}>←</span> Back to Listings
                </button>
                <div style={styles.badge}>
                    Listing ID <span style={{ fontWeight: '700', color: '#059669' }}>#{id}</span>
                </div>
            </div>

            {/* Main Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={styles.title}>
                    {flat?.title || `Beautiful Flat for Rent in ${flat?.area || 'Prime Location'}`}
                </h1>
                <p style={styles.address}>
                    <span style={{ color: '#ef4444' }}>📍</span> {flat?.full_address || 'Address not disclosed'}, {flat?.district || ''}
                </p>
            </div>

            {/* 1. HERO IMAGE WITH OVERLAY BADGES */}
            <div style={styles.heroContainer}>
                <img 
                    src={imageSrc || FALLBACK_IMAGE} 
                    alt={`Flat in ${flat?.area || 'Rental'}`} 
                    style={styles.heroImage}
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />

                {/* Floating Rent Tag */}
                <div style={styles.priceTag}>
                    <span style={styles.priceLabel}>Monthly Rent</span>
                    <strong style={styles.priceValue}>
                        ৳ {flat?.price ? Number(flat.price).toLocaleString() : 'N/A'}
                    </strong>
                </div>

                {/* Status Pill */}
                <div style={styles.statusBadge}>
                    <span style={styles.statusDot}></span>
                    Available {flat?.available_from || 'Immediately'}
                </div>
            </div>

            {/* 2. TWO-COLUMN GRID */}
            <div style={styles.grid}>
                
                {/* LEFT CONTENT COLUMN */}
                <div>
                    {/* Architecture Specs */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Property Specifications</h3>
                        <div style={styles.specGrid}>
                            <div style={styles.specBox}>
                                <span style={styles.specIcon}>🛏️</span>
                                <span style={styles.specLabel}>Bedrooms</span>
                                <strong style={styles.specValue}>{flat?.bedrooms ?? '—'}</strong>
                            </div>
                            <div style={styles.specBox}>
                                <span style={styles.specIcon}>🚿</span>
                                <span style={styles.specLabel}>Bathrooms</span>
                                <strong style={styles.specValue}>{flat?.bathrooms ?? '—'}</strong>
                            </div>
                            <div style={styles.specBox}>
                                <span style={styles.specIcon}>🌅</span>
                                <span style={styles.specLabel}>Balconies</span>
                                <strong style={styles.specValue}>{flat?.balconies ?? '—'}</strong>
                            </div>
                            <div style={styles.specBox}>
                                <span style={styles.specIcon}>🏢</span>
                                <span style={styles.specLabel}>Floor</span>
                                <strong style={styles.specValue}>{formatFloor(flat?.floor)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Overview & Description */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Overview & Description</h3>
                        <p style={styles.descriptionText}>
                            {flat?.description || 'No detailed overview provided for this property posting.'}
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDEBAR (STICKY ACTION PANEL) */}
                <div style={styles.sidebar}>
                    
                    {/* Contact & Landlord Card */}
                    <div style={{ ...styles.card, textAlign: 'center' }}>
                        <div style={styles.avatar}>
                            {flat?.user_username ? flat.user_username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h4 style={styles.username}>@{flat?.user_username || 'Landlord'}</h4>
                        <span style={styles.userRole}>Verified Listing Owner</span>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                            <span style={styles.hotlineLabel}>Direct Contact</span>
                            
                            {/* Primary Call Button */}
                            <a 
                                href={flat?.contact_no ? `tel:${flat.contact_no}` : '#'}
                                style={styles.callButton}
                            >
                                📞 {flat?.contact_no || 'Not Disclosed'}
                            </a>

                            {/* Copy Phone Number Option */}
                            {flat?.contact_no && (
                                <button 
                                    onClick={() => handleCopyContact(flat.contact_no)}
                                    style={styles.copyButton}
                                >
                                    {copied ? '✓ Phone Copied!' : '📋 Copy Number'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Safety / Advisory Tip */}
                    <div style={styles.infoBox}>
                        <span style={{ fontSize: '1.2rem', marginBottom: '4px', display: 'block' }}>🛡️</span>
                        <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block', marginBottom: '2px' }}>Safety Tip</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                            Always inspect the flat in person before making any advance financial transactions.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
};

// --- STYLES OBJECT ---
const styles = {
    container: {
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '24px 20px 80px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: '#1f2937',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
    },
    topBar: {
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    backButton: {
        padding: '9px 18px',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontWeight: '600',
        color: '#4b5563',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    badge: {
        fontSize: '0.85rem',
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        padding: '6px 14px',
        borderRadius: '20px',
        fontWeight: '500',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '8px',
        letterSpacing: '-0.025em',
        lineHeight: '1.25',
    },
    address: {
        fontSize: '1.05rem',
        color: '#4b5563',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        margin: 0,
        fontWeight: '500',
    },
    heroContainer: {
        width: '100%',
        height: '440px',
        overflow: 'hidden',
        borderRadius: '20px',
        marginBottom: '32px',
        boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        backgroundColor: '#e5e7eb',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    priceTag: {
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        color: '#ffffff',
        padding: '12px 22px',
        borderRadius: '14px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    priceLabel: {
        display: 'block',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        color: '#94a3b8',
        fontWeight: '700',
        letterSpacing: '0.05em',
    },
    priceValue: {
        fontSize: '1.65rem',
        fontWeight: '800',
        color: '#10b981',
    },
    statusBadge: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        color: '#0f172a',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '32px',
        alignItems: 'start',
    },
    card: {
        backgroundColor: '#ffffff',
        border: '1px solid #f1f5f9',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
    },
    cardTitle: {
        margin: '0 0 18px 0',
        color: '#0f172a',
        fontSize: '1.15rem',
        fontWeight: '700',
        letterSpacing: '-0.01em',
    },
    specGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '14px',
    },
    specBox: {
        padding: '16px 12px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #f1f5f9',
    },
    specIcon: {
        display: 'block',
        fontSize: '1.4rem',
        marginBottom: '6px',
    },
    specLabel: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
    },
    specValue: {
        display: 'block',
        fontSize: '1.2rem',
        color: '#0f172a',
        marginTop: '4px',
        fontWeight: '700',
    },
    descriptionText: {
        whiteSpace: 'pre-line',
        lineHeight: '1.75',
        color: '#475569',
        fontSize: '1rem',
        margin: 0,
    },
    sidebar: {
        position: 'sticky',
        top: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        fontSize: '1.6rem',
        fontWeight: '700',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 12px',
    },
    username: {
        margin: '0 0 2px 0',
        fontSize: '1.1rem',
        color: '#0f172a',
        fontWeight: '700',
    },
    userRole: {
        fontSize: '0.8rem',
        color: '#94a3b8',
        display: 'block',
        marginBottom: '20px',
        fontWeight: '500',
    },
    hotlineLabel: {
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: '700',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '8px',
        letterSpacing: '0.05em',
    },
    callButton: {
        display: 'block',
        width: '100%',
        padding: '14px',
        boxSizing: 'border-box',
        backgroundColor: '#059669',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '1.05rem',
        textAlign: 'center',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
        transition: 'all 0.2s',
    },
    copyButton: {
        marginTop: '10px',
        width: '100%',
        padding: '10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        color: '#475569',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
    },
    infoBox: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: '20px',
    },
    errorCard: {
        maxWidth: '420px',
        width: '100%',
        padding: '32px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #fee2e2',
    },
    errorIcon: {
        fontSize: '2.5rem',
        marginBottom: '12px',
    },
    primaryButton: {
        padding: '10px 20px',
        backgroundColor: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    secondaryButton: {
        padding: '10px 20px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    // Skeleton Styles
    topNavSkeleton: { height: '36px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '24px', width: '30%' },
    heroSkeleton: { height: '400px', backgroundColor: '#e2e8f0', borderRadius: '20px', marginBottom: '32px' },
    cardSkeleton: { height: '180px', backgroundColor: '#e2e8f0', borderRadius: '16px', marginBottom: '24px' },
    sidebarSkeleton: { height: '320px', backgroundColor: '#e2e8f0', borderRadius: '16px' }
};

export default FlatDetails;