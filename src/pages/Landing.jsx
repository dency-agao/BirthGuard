import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Heart, Activity, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Slideshow from '../components/Slideshow';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    mothers: 0,
    detection: 0,
    chvs: 0,
  });

  useEffect(() => {
    // Animate counters
    const targetCounts = { mothers: 500, detection: 95, chvs: 48 };
    const duration = 2000;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      setCounts({
        mothers: Math.floor(targetCounts.mothers * progress),
        detection: Math.floor(targetCounts.detection * progress),
        chvs: Math.floor(targetCounts.chvs * progress),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="floating-blob"></div>
        <div className="hero-container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">Protecting Mothers! Saving Lives!</h1>
            <p className="hero-subtitle">
              BirthGuard monitors pregnancy health, predicts risks, and connects mothers to care — before it's too late
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                Get Started →
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-card">
              <img 
                src={`${process.env.PUBLIC_URL}/assets/hero-image.png`}
                alt="Maternal Health"
                className="illustration-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="illustration-fallback">
                <Heart size={120} className="illustration-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="slideshow-section">
        <div className="container">
          <Slideshow />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose BirthGuard?</h2>
          <div className="grid grid-3 features-grid">
            {/* Feature 1 */}
            <div className="glass-card feature-card slide-in-left">
              <div className="feature-icon">
                <Activity size={32} />
              </div>
              <h3>Symptom Tracking</h3>
              <p>Log symptoms daily and get instant health feedback. Our system monitors your health status 24/7.</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card feature-card slide-in-up">
              <div className="feature-icon">
                <ShieldAlert size={32} />
              </div>
              <h3>Risk Detection</h3>
              <p>AI-powered scoring to identify low, moderate, and high-risk pregnancies with clinical accuracy.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card feature-card slide-in-right">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>CHV Alerts</h3>
              <p>Automated notifications to Community Health Volunteers for urgent follow-up and referrals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="steps-container">
            <div className="step-card slide-in-left">
              <div className="step-number">1</div>
              <h3>Get Started</h3>
              <p>Mother signs up & fills in her health profile with estimated delivery date and location.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card slide-in-up">
              <div className="step-number">2</div>
              <h3>Track Health</h3>
              <p>Logs symptoms regularly; system scores risk using advanced medical algorithms.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card slide-in-right">
              <div className="step-number">3</div>
              <h3>Get Support</h3>
              <p>CHV is alerted if risk is high; facility referral is made automatically for urgent cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{counts.mothers}+</div>
              <p className="stat-text">Mothers Monitored</p>
            </div>
            <div className="stat-box">
              <div className="stat-number">{counts.detection}%</div>
              <p className="stat-text">Early Detection Rate</p>
            </div>
            <div className="stat-box">
              <div className="stat-number">{counts.chvs}</div>
              <p className="stat-text">CHVs Connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title text-center">Success Stories</h2>
          <div className="testimonials-grid">
            <div className="glass-card testimonial-card slide-in-left">
              <div className="testimonial-header">
                <div className="testimonial-avatar">JM</div>
                <div>
                  <h4 className="testimonial-name">Jane Mwangi</h4>
                  <p className="testimonial-role">Pregnant Mother, Kisii County</p>
                </div>
              </div>
              <p className="testimonial-quote">
                "BirthGuard helped me identify high blood pressure early. My CHV got the alert and connected me to the nearest hospital. It probably saved my life."
              </p>
              <div className="testimonial-rating">
                ★★★★★
              </div>
            </div>

            <div className="glass-card testimonial-card slide-in-right">
              <div className="testimonial-header">
                <div className="testimonial-avatar">PM</div>
                <div>
                  <h4 className="testimonial-name">Peter Malik</h4>
                  <p className="testimonial-role">Community Health Volunteer</p>
                </div>
              </div>
              <p className="testimonial-quote">
                "With BirthGuard, I can monitor multiple mothers at once and get real-time alerts. I've been able to prevent complications in 5 high-risk pregnancies this year."
              </p>
              <div className="testimonial-rating">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Protect Your Health?</h2>
            <p>Join thousands of mothers already using BirthGuard to monitor their pregnancy and receive expert care.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Begin Your Journey Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
