import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <Heart size={24} className="brand-icon" />
              <h3>BirthGuard</h3>
            </div>
            <p className="footer-tagline">
              <i>We Care!</i>            
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/signup">Get Started</a>
              </li>
              <li>
                <a href="/#features">Features</a>
              </li>
              <li>
                <a href="/#how-it-works">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={18} />
                <span>BirthGuard Healthcare System</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <a href="tel:+254742905176">+254742905176</a>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <a href="mailto:birthguard@kisii.ac.ke">birthguard@kisii.ac.ke</a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>
            © {currentYear} BirthGuard | Codestars Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
