import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, FaLinkedin, FaInstagram, FaYoutube, FaDiscord,
  FaAmbulance, FaMobileAlt, FaDatabase, FaProjectDiagram, FaClock, FaUserCheck, FaHourglassHalf
} from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#fff', margin: 0, padding: 0 }}>

      {/* --- NAVIGATION --- */}
      <nav style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '30px', fontWeight: '900', color: '#9d4ead', fontStyle: 'italic' }}>
          ClinikQ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: '' }}>
            <a href="#about" style={{ textDecoration: 'none', color: 'inherit' }}>About Us</a>
            <a href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contact Us</a>
          </div>
          <Link to="/login">
            <button style={{ backgroundColor: '#9d4ead', color: '#fff', padding: '10px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', width: '90%', margin: '0 auto', minHeight: '80vh' }}>
        {/* LEFT TEXT */}
        <div style={{ paddingRight: '50px' }}>
          <h1 style={{ fontSize: '80px', fontWeight: '900', lineHeight: '0.9', color: '#2d1e3e', margin: '0 0 30px 0' }}>
            The Smart <br />
            Way To <br />
            <span style={{ color: '#9d4ead' }}>Queue Up.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#999', fontWeight: '600', maxWidth: '400px', marginBottom: '40px' }}>
            Elevate your clinic's patient experience with real-time digital tracking and priority-based scheduling.
          </p>
          <Link to="/register">
            <button style={{ backgroundColor: '#a35bb4', color: '#fff', padding: '20px 40px', borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}>
              Register Now
            </button>
          </Link>
        </div>

        {/* RIGHT IMAGE */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <img 
            src="https://img.freepik.com/free-psd/3d-render-medical-report-icon-isolated_439185-11933.jpg" 
            alt="Hero" 
            style={{ width: '100%', maxWidth: '500px', height: 'auto', display: 'block' }}
          />
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="about" style={{ padding: '80px 0', backgroundColor: '#fafaff' }}>
        <div style={{ width: '90%', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#2d1e3e', marginBottom: '50px', textTransform: '' }}>
            Why develop a Patient Token System?
          </h2>
          <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' }}>
            <FeatureItem icon={<FaAmbulance />} title="Emergency First" />
            <FeatureItem icon={<FaMobileAlt />} title="Real-time Tracking" />
            <FeatureItem icon={<FaDatabase />} title="Integrated Data" />
            <FeatureItem icon={<FaProjectDiagram />} title="Faster Consulting" />
            <FeatureItem icon={<FaClock />} title="Operational Efficiency" />
            <FeatureItem icon={<FaUserCheck />} title="Satisfaction" />
            <FeatureItem icon={<FaHourglassHalf />} title="Reduced Wait" />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" style={{ padding: '80px 0 40px', borderTop: '1px solid #eee' }}>
        <div style={{ width: '90%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '50px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#9d4ead', fontStyle: 'italic', marginBottom: '15px' }}>ClinikQ</div>
            <p style={{ color: '#777', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
              ClinikQ allows clinics to manage patient queues digitally, reducing lobby wait times and improving healthcare efficiency.
            </p>
            <div style={{ display: 'flex', gap: '15px', color: '#9d4ead', fontSize: '20px' }}>
              <FaFacebook /> <FaLinkedin /> <FaInstagram /> <FaYoutube /> <FaDiscord />
            </div>
          </div>

          <div style={{ paddingLeft: '40px' }}>
            <h4 style={{ fontWeight: '900', textTransform: '', marginBottom: '20px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#777', fontWeight: 'bold', fontSize: '14px' }}>
              <Link to="/">Home</Link>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: '900', textTransform: '', marginBottom: '20px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#777', fontSize: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>Ward 01, Sirutar, Bhaktapur</div>
              <div style={{ display: 'flex', gap: '10px' }}>+977-9801143360</div>
              <div style={{ display: 'flex', gap: '10px' }}>info@clinikq.com</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <div style={{ width: '50px', height: '50px', backgroundColor: '#cc0000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '10px' }}>
      {icon}
    </div>
    <span style={{ fontSize: '9px', fontWeight: '900', textTransform: '', color: '#2d1e3e' }}>{title}</span>
  </div>
);

export default LandingPage;
