import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import AIBackground from './AIBackground';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  // Fetch data from Firebase when the page loads
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "portfolio", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    };
    fetchData();
  }, []);

  return (
    <div className="portfolio-container">
      <AIBackground />

      {/* Navigation */}
      <nav className="navbar">
        <a href="#about" className="nav-link">About</a>
        <a href="#skills" className="nav-link">Skills</a>
        <a href="#projects" className="nav-link">Projects</a>
        <a href="#contact" className="nav-link">Contact</a>
      </nav>

      {/* Hero / About Section */}
      <section id="about" className="section hero">
        {/* Dynamic Profile Picture */}
        <img 
          src={data?.profilePic || "https://via.placeholder.com/150"} 
          alt="Profile" 
          className="profile-img-main" 
        />
        <h1>Hello, I'm {data?.name || "Admin"}</h1>
        <p>
          Creative Developer & UI/UX Enthusiast. I build interactive and modern web experiences.
        </p>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section">
        <h2 className="section-title">My Skills</h2>
        <div className="skills-container">
          {data?.skills?.map((skill, index) => (
            <span key={index} className="skill-chip">{skill}</span>
          ))}
          {!data?.skills && <p style={{color:'#666'}}>No skills added yet...</p>}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section">
        <h2 className="section-title">My Projects</h2>
        <div className="projects-grid">
          {data?.projects?.map((project, index) => (
            <div key={index} className="project-card">
              <img 
                src={project.img || "https://via.placeholder.com/300x200"} 
                alt={project.name} 
                className="project-img" 
              />
              <div className="project-info">
                <h3 className="project-title">{project.name}</h3>
                <a href={project.link} target="_blank" rel="noreferrer" className="btn-primary">
                  View Project
                </a>
              </div>
            </div>
          ))}
          {!data?.projects && <p style={{color:'#666'}}>No projects added yet...</p>}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <h2 className="section-title">Contact Me</h2>
        <form className="contact-form">
          <input type="email" placeholder="Your Email" className="input-field" />
          <textarea placeholder="Your Message" rows="5" className="input-field"></textarea>
          <button type="button" className="btn-primary">Send Message</button>
        </form>
      </section>

      {/* Link to Admin Panel */}
      <a href="/admin" className="admin-float-btn">Admin Panel</a>
    </div>
  );
}

export default App;