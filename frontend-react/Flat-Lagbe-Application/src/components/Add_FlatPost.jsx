import React, { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'
import axios from 'axios'
import './Add_FlatPost.css'

const Add_FlatPost = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

  const formTopRef = useRef(null)

  const [formData, setFormData] = useState({
    area: '',
    district: '',
    full_address: '',
    contact_no: '',
    price: '',
    description: '',
    available_month: '',
    bedrooms: '1',
    bathrooms: '1',
    balconies: '0',
    floor: '1'
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name] || errors.general) {
      setErrors({ ...errors, [e.target.name]: '', general: '' })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
      if (errors.image || errors.general) {
        setErrors({ ...errors, image: '', general: '' })
      }
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreviewUrl('')
    const fileInput = document.getElementById('image')
    if (fileInput) fileInput.value = ''
  }

  const scrollToTop = () => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrors({})

    const fields = [
      'area', 'district', 'full_address', 'contact_no', 'price', 
      'description', 'available_month', 'bedrooms', 'bathrooms', 'balconies', 'floor'
    ]
    const standardFieldsFilled = fields.every(field => String(formData[field]).trim() !== '')

    if (!standardFieldsFilled || !imageFile) {
      setErrors({ general: "All fields are required. Please fill in all details and upload a cover photo." })
      setTimeout(scrollToTop, 50)
      return
    }

    const token = localStorage.getItem('access_token')

    if (!isAuthenticated && !token) {
      setErrors({ general: "You must be logged in to post a listing." })
      setTimeout(scrollToTop, 50)
      return
    }

    setLoading(true)

    const dataPayload = new FormData()
    dataPayload.append('area', formData.area)
    dataPayload.append('district', formData.district)
    dataPayload.append('full_address', formData.full_address)
    dataPayload.append('contact_no', formData.contact_no)
    dataPayload.append('price', formData.price)
    dataPayload.append('description', formData.description)
    dataPayload.append('available_from', `${formData.available_month}-01`)
    dataPayload.append('image', imageFile)
    dataPayload.append('bedrooms', formData.bedrooms)
    dataPayload.append('bathrooms', formData.bathrooms)
    dataPayload.append('balconies', formData.balconies)
    dataPayload.append('floor', formData.floor)

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/flat-posts/',
        dataPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setMessage('Flat listing posted successfully! Redirecting...')
      setTimeout(scrollToTop, 50)
      setTimeout(() => navigate('/'), 2000)

    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data)
      } else {
        setErrors({ general: err.message || "Failed to establish a network connection." })
      }
      setTimeout(scrollToTop, 50)
    } finally {
      setLoading(false)
    }
  }

  const renderFieldError = (fieldError) => {
    if (!fieldError) return null;
    return <span style={styles.fieldError}>{Array.isArray(fieldError) ? fieldError.join(', ') : fieldError}</span>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} ref={formTopRef}>
        
        {/* Top Header Navigation */}
        <div style={styles.headerRow}>
          <button type="button" onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Back
          </button>
          <span style={styles.badge}>New Property</span>
        </div>

        <div style={styles.titleGroup}>
          <h2 style={styles.title}>Post a Flat Listing</h2>
          <p style={styles.subtitle}>Provide accurate property details to attract genuine tenants.</p>
        </div>

        {message && <div style={styles.alertSuccess}>{message}</div>}
        {errors.general && <div style={styles.alertDanger}>{errors.general}</div>}

        <form onSubmit={handleSubmit} noValidate style={styles.form}>

          {/* Section 1: Location & Contact */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📍 Location & Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="area" style={styles.label}>Area / Neighborhood</label>
                <input 
                  type="text" 
                  id="area" 
                  name="area" 
                  placeholder="e.g. Uttara Sector 10" 
                  className="form-control" 
                  value={formData.area} 
                  onChange={handleChange} 
                />
                {renderFieldError(errors.area)}
              </div>
              <div className="form-group">
                <label htmlFor="district" style={styles.label}>District / City</label>
                <input 
                  type="text" 
                  id="district" 
                  name="district" 
                  placeholder="e.g. Dhaka" 
                  className="form-control" 
                  value={formData.district} 
                  onChange={handleChange} 
                />
                {renderFieldError(errors.district)}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="full_address" style={styles.label}>Full Address</label>
              <textarea 
                id="full_address" 
                name="full_address" 
                className="form-control" 
                rows="2" 
                placeholder="House No, Road No, Block/Sector details..." 
                value={formData.full_address} 
                onChange={handleChange} 
              />
              {renderFieldError(errors.full_address)}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_no" style={styles.label}>Contact Phone Number</label>
                <input
                  type="tel"
                  id="contact_no"
                  name="contact_no"
                  className="form-control"
                  value={formData.contact_no}
                  onChange={handleChange}
                  pattern="[0-9]*"
                  placeholder="017XXXXXXXX"
                />
                {renderFieldError(errors.contact_no)}
              </div>
              <div className="form-group">
                <label htmlFor="price" style={styles.label}>Monthly Rent (BDT)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control"
                  step="100"
                  min="0"
                  placeholder="e.g. 25000"
                  value={formData.price}
                  onChange={handleChange}
                />
                {renderFieldError(errors.price)}
              </div>
            </div>
          </div>

          {/* Section 2: Property Specifications */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏠 Specifications & Availability</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms" style={styles.label}>Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  className="form-control"
                  min="1"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
                {renderFieldError(errors.bedrooms)}
              </div>
              <div className="form-group">
                <label htmlFor="bathrooms" style={styles.label}>Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  className="form-control"
                  min="1"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
                {renderFieldError(errors.bathrooms)}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="balconies" style={styles.label}>Balconies</label>
                <input
                  type="number"
                  id="balconies"
                  name="balconies"
                  className="form-control"
                  min="0"
                  value={formData.balconies}
                  onChange={handleChange}
                />
                {renderFieldError(errors.balconies)}
              </div>
              <div className="form-group">
                <label htmlFor="floor" style={styles.label}>Floor Level</label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  className="form-control"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="0 for Ground, 3 for 3rd"
                />
                {renderFieldError(errors.floor)}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="available_month" style={styles.label}>Available From</label>
              <input
                type="month"
                id="available_month"
                name="available_month"
                className="form-control"
                value={formData.available_month}
                onChange={handleChange}
              />
              {renderFieldError(errors.available_from)}
            </div>
          </div>

          {/* Section 3: Photo & Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🖼️ Photo & Overview</h3>
            
            <div className="form-group">
              <label htmlFor="image" style={styles.label}>Property Cover Photo</label>
              
              {!imagePreviewUrl ? (
                <label htmlFor="image" style={styles.dropZone}>
                  <span style={{ fontSize: '2rem' }}>📷</span>
                  <span style={styles.dropText}>Click to upload flat photo</span>
                  <span style={styles.dropSubtext}>PNG, JPG, or WEBP up to 10MB</span>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div style={styles.previewContainer}>
                  <img src={imagePreviewUrl} alt="Selected Flat Preview" style={styles.previewImage} />
                  <button 
                    type="button" 
                    style={styles.removeBtn} 
                    onClick={handleRemoveImage}
                    title="Remove selected image"
                  >
                    ✕
                  </button>
                </div>
              )}
              {renderFieldError(errors.image)}
            </div>

            <div className="form-group">
              <label htmlFor="description" style={styles.label}>Detailed Description</label>
              <textarea 
                id="description" 
                name="description" 
                className="form-control" 
                rows="4" 
                placeholder="Mention amenities, restrictions, gas connection type, security features, generator backup, etc." 
                value={formData.description} 
                onChange={handleChange} 
              />
              {renderFieldError(errors.description)}
            </div>
          </div>

          {/* Submit Action */}
          <div style={styles.buttonContainer}>
            <button type="submit" className="btn-submit-post" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <>
                  <span style={styles.spinner}></span> Uploading & Publishing...
                </>
              ) : (
                'Publish Flat Listing'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: '40px 20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: { 
    backgroundColor: '#ffffff', 
    width: '100%', 
    maxWidth: '680px', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', 
    padding: '36px',
    margin: 'auto',
  },
  headerRow: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backBtn: {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  badge: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.8rem',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },
  titleGroup: {
    marginBottom: '28px',
  },
  title: { 
    margin: '0 0 6px 0', 
    fontSize: '1.75rem', 
    color: '#0f172a', 
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#fafafa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#334155',
    marginTop: 0,
    marginBottom: '16px',
    letterSpacing: '-0.01em',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '6px',
  },
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justify: 'center',
    padding: '24px',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  dropText: {
    marginTop: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0284c7',
  },
  dropSubtext: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  previewContainer: { 
    position: 'relative', 
    marginTop: '8px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  previewImage: { 
    width: '100%', 
    maxHeight: '260px', 
    objectFit: 'cover', 
    display: 'block',
  },
  removeBtn: { 
    position: 'absolute', 
    top: '12px', 
    right: '12px', 
    background: 'rgba(15, 23, 42, 0.75)', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '50%', 
    width: '32px', 
    height: '32px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    justify: 'center',
    backdropFilter: 'blur(4px)',
  },
  buttonContainer: { 
    display: 'flex', 
    justify: 'flex-end', 
    marginTop: '8px', 
  },
  submitBtn: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    justify: 'center',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
  },
  alertSuccess: {
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
  alertDanger: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginTop: '4px',
    display: 'block',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  }
}

export default Add_FlatPost