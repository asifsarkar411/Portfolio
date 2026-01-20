import React from 'react';
import AIBackground from './AIBackground';

const Portfolio = ({ data }) => {
  // 1. Safety Check: Wait for data to load
  if (!data) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>
        <AIBackground />
        <h2>Loading Portfolio...</h2>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <AIBackground />
      
      {/* 2. Sidebar Navigation */}
      <nav className="sidebar">
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>About</button>
        <button onClick={() => document.getElementById('skills').scrollIntoView({ behavior: 'smooth' })}>Skills</button>
        <button onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>Projects</button>
        <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact</button>
      </nav>

      {/* 3. Main Content Area */}
      <main className="content">
        
        {/* Profile Section */}
        <section className="glass-panel profile-section">
          {data.profilePic ? (
            <img src={data.profilePic} className="profile-img" alt="Profile" />
          ) : (
            <div className="profile-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
              <span style={{ fontSize: '30px' }}>👤</span>
            </div>
          )}
          <h1>Welcome to My Portfolio</h1>
        </section>

        {/* Skills Section */}
        <section id="skills" className="glass-panel">
          <h2>Skills</h2>
          <div className="skills-row">
            {data.skills && data.skills.length > 0 ? (
              data.skills.map((s, index) => <span className="skill-item" key={index}>{s}</span>)
            ) : (
              <p>No skills added yet.</p>
            )}
          </div>
        </section>

        {/* Projects Section (Cards with Images) */}
        <section id="projects" className="glass-panel">
          <h2>My Projects</h2>
          <div className="project-grid">
            {data.projects && data.projects.length > 0 ? (
              data.projects.map((p, index) => (
                <a href={p.link} target="_blank" rel="noreferrer" key={index} className="project-card">
                  {/* Image Check */}
                  {p.img ? (
                    <img src={p.img} alt={p.name} className="project-img" />
                  ) : (
                    <div className="project-placeholder"></div>
                  )}
                  <div className="project-info">
                    <h3>{p.name}</h3>
                    <span>Click to View</span>
                  </div>
                </a>
              ))
            ) : (
              <p>No projects added yet.</p>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="glass-panel">
          <h2>Contact Me</h2>
          <form className="contact-form">
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" rows="4" required />
            <button type="submit" className="send-btn">
              Send Message
            </button>
          </form>
        </section>
      </main>

      {/* 4. Admin Navigation Button (Bottom Right) */}
      <button 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onClick={() => window.location.href = '/admin'}
      >
        Admin Panel
      </button>
    </div>
  );
};

export default Portfolio;