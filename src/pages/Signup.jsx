import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, User, Calendar, MapPin, Heart, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('mother');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    edd: '',
    gravida: '',
    county: '',
    chv_id: '',
    facility: '',
    operational_area: '',
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';

    if (role === 'mother') {
      if (!formData.edd) newErrors.edd = 'Expected delivery date is required';
      if (!formData.county) newErrors.county = 'County is required';
    } else {
      if (!formData.chv_id.trim()) newErrors.chv_id = 'CHV ID is required';
      if (!formData.facility.trim()) newErrors.facility = 'Assigned facility is required';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    const payload = {
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
    };

    if (role === 'mother') {
      payload.edd = formData.edd;
      payload.gravida = formData.gravida ? parseInt(formData.gravida) : 1;
      payload.county = formData.county;
    } else {
      payload.chv_id = formData.chv_id;
      payload.facility = formData.facility;
      payload.operational_area = formData.operational_area;
    }

    const result = await register(payload);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate(role === 'mother' ? '/mother-dashboard' : '/chv-dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <Heart size={32} className="auth-icon" />
            <h1>Create Your Account</h1>
            <p>Join BirthGuard and take control of your maternal health</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group">
              <label>I am a</label>
              <div className="role-selector">
                <label className={`role-option ${role === 'mother' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="mother"
                    checked={role === 'mother'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span>Pregnant Mother</span>
                </label>
                <label className={`role-option ${role === 'chv' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="chv"
                    checked={role === 'chv'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span>Community Health Volunteer</span>
                </label>
              </div>
            </div>

            {/* Common Fields */}
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+254 700 000 000"
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            {/* Mother-specific Fields */}
            {role === 'mother' && (
              <>
                <div className="form-group">
                  <label htmlFor="edd">Expected Delivery Date *</label>
                  <div className="input-wrapper">
                    <Calendar size={18} />
                    <input
                      id="edd"
                      type="date"
                      name="edd"
                      value={formData.edd}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.edd && <span className="error-message">{errors.edd}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gravida">Number of Pregnancies</label>
                    <div className="input-wrapper">
                      <BarChart3 size={18} />
                      <input
                        id="gravida"
                        type="number"
                        name="gravida"
                        value={formData.gravida}
                        onChange={handleChange}
                        placeholder="e.g., 1"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="county">County/Location *</label>
                  <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                      id="county"
                      type="text"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      placeholder="e.g., Kisii County"
                    />
                  </div>
                  {errors.county && <span className="error-message">{errors.county}</span>}
                </div>
              </>
            )}

            {/* CHV-specific Fields */}
            {role === 'chv' && (
              <>
                <div className="form-group">
                  <label htmlFor="chv_id">CHV ID Number *</label>
                  <div className="input-wrapper">
                    <BarChart3 size={18} />
                    <input
                      id="chv_id"
                      type="text"
                      name="chv_id"
                      value={formData.chv_id}
                      onChange={handleChange}
                      placeholder="Enter your CHV ID"
                    />
                  </div>
                  {errors.chv_id && <span className="error-message">{errors.chv_id}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="facility">Assigned Facility *</label>
                  <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                      id="facility"
                      type="text"
                      name="facility"
                      value={formData.facility}
                      onChange={handleChange}
                      placeholder="e.g., Kisii District Hospital"
                    />
                  </div>
                  {errors.facility && <span className="error-message">{errors.facility}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="operational_area">Operational Area</label>
                  <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                      id="operational_area"
                      type="text"
                      name="operational_area"
                      value={formData.operational_area}
                      onChange={handleChange}
                      placeholder="e.g., Ward, Division"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  id="confirm_password"
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirm_password && (
                <span className="error-message">{errors.confirm_password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>

            {/* Login Link */}
            <p className="auth-footer">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
