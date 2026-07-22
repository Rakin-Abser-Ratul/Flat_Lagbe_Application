import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthProvider'; // Adjust path if needed
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const [user, setUser] = useState({ username: '', email: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch profile data from Django
                const response = await axios.get('https://flat-lagbe-application.onrender.com/api/me/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser({
                    username: response.data.username,
                    email: response.data.email
                });
            } catch (err) {
                console.error("Failed to fetch user:", err);
                // Token expired/invalid -> run global logout & redirect
                logout();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, logout]);

    const handleLogout = () => {
        // Calling context logout handles localStorage purging & global state update
        logout();
        navigate('/login');
    };

    return (
        <div className="dash-page-wrapper">
            <div className="dash-container">
                
                <header className="dash-header">
                    <div className="dash-header-title">
                        <h2>Account Dashboard</h2>
                        <p>Manage your listings, profile settings, and session details.</p>
                    </div>
                    <button className="btn-secondary-dash" onClick={() => navigate('/')}>
                        <span className="icon">←</span> Back to Feed
                    </button>
                </header>

                <div className="dash-main-grid">
                    <aside className="dash-card profile-card">
                        <div className="avatar-wrapper">
                            <div className="avatar-circle">
                                {loading ? '...' : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                            </div>
                        </div>

                        <h3 className="user-name">
                            {loading ? 'Loading...' : (user.username || 'User Account')}
                        </h3>
                        <p className="user-email">
                            {loading ? '...' : (user.email || 'No email provided')}
                        </p>
                        <span className="badge-role">Landlord / Poster</span>

                        <hr className="divider" />

                        <div className="metric-box">
                            <span className="metric-value">3</span>
                            <span className="metric-label">Active Flat Listings</span>
                        </div>
                    </aside>

                    <main className="dash-content-area">
                        <section className="dash-card action-section">
                            <div className="section-title">
                                <h3>Quick Actions</h3>
                                <p>Control and publish property advertisements</p>
                            </div>

                            <div className="action-grid">
                                <button className="action-tile primary-tile" onClick={() => navigate('/posts')}>
                                    <div className="tile-icon-bg">➕</div>
                                    <div className="tile-info">
                                        <h4>Post a New Flat</h4>
                                        <p>Publish a new property listing with images and details</p>
                                    </div>
                                    <span className="arrow-indicator">→</span>
                                </button>

                                <button className="action-tile" onClick={() => navigate('/my-listings')}>
                                    <div className="tile-icon-bg">🏢</div>
                                    <div className="tile-info">
                                        <h4>Manage My Listings</h4>
                                        <p>View, edit specifications, or delete your existing posts</p>
                                    </div>
                                    <span className="arrow-indicator">→</span>
                                </button>
                            </div>
                        </section>

                        <section className="dash-card session-section">
                            <div className="session-info">
                                <h4>Session Control</h4>
                                <p>Signed in on this browser session</p>
                            </div>
                            <button className="btn-logout" onClick={handleLogout}>
                                Sign Out
                            </button>
                        </section>
                    </main>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;