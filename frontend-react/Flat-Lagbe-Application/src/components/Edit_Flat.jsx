import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../AuthProvider'
import axios from 'axios'


const Edit_Flat = () => {
  const { id } = useParams()
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  // Fetch existing post details
  useEffect(() => {
    const fetchFlatDetails = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

        const response = await axios.get(`https://flat-lagbe-application.onrender.com/api/flat-posts/${id}/`, { headers })
        const data = response.data

        let formattedMonth = ''
        if (data.available_from) {
          formattedMonth = data.available_from.substring(0, 7)
        }

        setFormData({
          area: data.area || '',
          district: data.district || '',
          full_address: data.full_address || '',
          contact_no: data.contact_no || '',
          price: data.price || '',
          description: data.description || '',
          available_month: formattedMonth,
          bedrooms: String(data.bedrooms ?? '1'),
          bathrooms: String(data.bathrooms ?? '1'),
          balconies: String(data.balconies ?? '0'),
          floor: String(data.floor ?? '1')
        })

        let currentImg = data.image_url || data.image || ''
        
        if (currentImg) {
          if (!currentImg.startsWith('http://') && !currentImg.startsWith('https://')) {
            currentImg = `http://127.0.0.1:8000${currentImg}`
          }
        }

        setImagePreviewUrl(currentImg)

      } catch (err) {
        console.error("Failed to load listing for editing:", err)
        setErrors({ general: "Could not fetch listing details. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchFlatDetails()
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name] || errors.general) {
      setErrors({ ...errors, [e.target.name]: '', general: '' })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setImageFile(file)
      
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl)
      }

      setImagePreviewUrl(URL.createObjectURL(file))
    }
    if (errors.image || errors.general) {
      setErrors({ ...errors, image: '', general: '' })
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

    if (!standardFieldsFilled) {
      setErrors({ general: "All fields are required. Please fill in all details." })
      setTimeout(scrollToTop, 50)
      return
    }

    const token = localStorage.getItem('access_token')

    if (!isAuthenticated && !token) {
      setErrors({ general: "You must be logged in to update a flat listing." })
      setTimeout(scrollToTop, 50)
      return
    }

    setSubmitting(true)

    const dataPayload = new FormData()
    dataPayload.append('area', formData.area)
    dataPayload.append('district', formData.district)
    dataPayload.append('full_address', formData.full_address)
    dataPayload.append('contact_no', formData.contact_no)
    dataPayload.append('price', formData.price)
    dataPayload.append('description', formData.description)
    dataPayload.append('available_from', `${formData.available_month}-01`)
    
    dataPayload.append('bedrooms', formData.bedrooms)
    dataPayload.append('bathrooms', formData.bathrooms)
    dataPayload.append('balconies', formData.balconies)
    dataPayload.append('floor', formData.floor)

    if (imageFile) {
      dataPayload.append('image', imageFile)
    }

    try {
      await axios.put(
        `https://flat-lagbe-application.onrender.com/api/flat-posts/${id}/`,
        dataPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setMessage('Flat listing updated successfully! Redirecting...')
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
      setSubmitting(false)
    }
  }

  const renderFieldError = (fieldError) => {
    if (!fieldError) return null;
    return <span style={styles.fieldError}>{Array.isArray(fieldError) ? fieldError.join(', ') : fieldError}</span>;
  }

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
            Loading listing details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} ref={formTopRef}>
        
        {/* Top Header Navigation */}
        <div style={styles.headerRow}>
          <button type="button" onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Back
          </button>
          <span style={styles.badge}>Edit Mode</span>
        </div>

        <div style={styles.titleGroup}>
          <h2 style={styles.title}>Update Flat Listing</h2>
          <p style={styles.subtitle}>Modify property details or update images for your tenant search.</p>
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
                  <span style={styles.dropText}>Click to upload replacement photo</span>
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
                  <img 
                    src={imagePreviewUrl} 
                    alt="Flat Listing Preview" 
                    style={styles.previewImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <button 
                    type="button" 
                    style={styles.removeBtn} 
                    onClick={handleRemoveImage}
                    title="Remove/replace image"
                  >
                    ✕
                  </button>
                  <div style={styles.previewBadge}>
                    {imageFile ? 'New Image Selected' : 'Current Cover Image'}
                  </div>
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
                value={formData.description} 
                onChange={handleChange} 
              />
              {renderFieldError(errors.description)}
            </div>
          </div>

          {/* Submit Action */}
          <div style={styles.buttonContainer}>
            <button type="submit" className="btn-submit-post" disabled={submitting} style={styles.submitBtn}>
              {submitting ? (
                <>
                  <span style={styles.spinner}></span> Saving Changes...
                </>
              ) : (
                'Save & Update Post'
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
    backgroundColor: '#fef3c7',
    color: '#d97706',
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
  previewBadge: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
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

export default Edit_Flat