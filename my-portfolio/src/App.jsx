import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AIBackground from './AIBackground'; // Ensure you have this component
import './App.css';

// =========================================
// 1. PORTFOLIO COMPONENT (Public View)
// =========================================
function Portfolio() {
  const [data, setData] = useState(null);

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
      <nav className="navbar">
        <a href="#about" className="nav-link">About</a>
        <a href="#skills" className="nav-link">Skills</a>
        <a href="#projects" className="nav-link">Projects</a>
        <a href="#contact" className="nav-link">Contact</a>
      </nav>

      <section id="about" className="section hero">
        <img 
          src={data?.profilePic || "https://via.placeholder.com/150"} 
          alt="Profile" 
          className="profile-img-main" 
        />
        <h1>Hello, I'm {data?.name || "Admin"}</h1>
        <p>{data?.bio || "Creative Developer & UI/UX Enthusiast."}</p>
      </section>

      <section id="skills" className="section">
        <h2 className="section-title">My Skills</h2>
        <div className="skills-container">
          {data?.skills?.map((skill, index) => (
            <span key={index} className="skill-chip">{skill}</span>
          ))}
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="section-title">My Projects</h2>
        <div className="projects-grid">
          {data?.projects?.map((project, index) => (
            <div key={index} className="project-card">
              <img src={project.img} alt={project.name} className="project-img" />
              <div className="project-info">
                <h3 className="project-title">{project.name}</h3>
                <a href={project.link} target="_blank" rel="noreferrer" className="btn-primary">View</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="section">
        <h2 className="section-title">Contact Me</h2>
        <form className="contact-form">
          <input type="email" placeholder="Your Email" className="input-field" />
          <textarea placeholder="Your Message" className="input-field"></textarea>
          <button type="button" className="btn-primary">Send Message</button>
        </form>
      </section>

      {/* LINK TO ADMIN PANEL */}
      <Link to="/admin" className="admin-float-btn">Admin Panel</Link>
    </div>
  );
}

// =========================================
// 2. ADMIN COMPONENT (Dashboard & Login)
// =========================================
function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skill, setSkill] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Simple Login Check
  const handleLogin = () => {
    if (pass === "1234") setIsLoggedIn(true); // CHANGE PASSWORD HERE
    else alert("Wrong password!");
  };

  // Upload Logic
  const handleUpload = async (file) => {
    if (!file) return null;
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const updateProfile = async () => {
    setUploading(true);
    let url = null;
    if (profileFile) url = await handleUpload(profileFile);
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (url) updateData.profilePic = url;

    await setDoc(doc(db, "portfolio", "data"), updateData, { merge: true });
    setUploading(false);
    alert("Profile Updated!");
  };

  const addSkill = async () => {
    if (skill) {
      await updateDoc(doc(db, "portfolio", "data"), {
        skills: arrayUnion(skill)
      });
      setSkill("");
      alert("Skill Added!");
    }
  };

  const addProject = async () => {
    setUploading(true);
    const url = await handleUpload(imageFile);
    if (url && projectName) {
      const newProject = { name: projectName, link: projectLink, img: url };
      await updateDoc(doc(db, "portfolio", "data"), {
        projects: arrayUnion(newProject)
      });
      setProjectName("");
      setProjectLink("");
      alert("Project Added!");
    }
    setUploading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="login-box">
          <h2>Admin Login</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="glass-input" 
            onChange={(e) => setPass(e.target.value)} 
          />
          <button onClick={handleLogin} className="login-btn" style={{marginTop:'10px'}}>Login</button>
          <br /><br />
          <Link to="/" style={{color:'#aaa'}}>← Back to Site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dash-sidebar">
        <h3>Dashboard</h3>
        <Link to="/" className="sidebar-item">View Live Site</Link>
        <button onClick={() => setIsLoggedIn(false)} className="sidebar-item" style={{color:'red'}}>Logout</button>
      </div>

      <div className="dash-main-content">
        <h1>Admin Control</h1>
        
        {/* Profile Section */}
        <div className="glass-panel" style={{marginTop:'20px'}}>
          <h3 className="panel-title">Edit Profile</h3>
          <input placeholder="My Name" className="glass-input" onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Short Bio" className="glass-input" onChange={(e)=>setBio(e.target.value)} />
          <input type="file" className="glass-input" onChange={(e)=>setProfileFile(e.target.files[0])} />
          <button onClick={updateProfile} className="send-btn" disabled={uploading}>
            {uploading ? "Updating..." : "Update Profile"}
          </button>
        </div>

        {/* Skills Section */}
        <div className="glass-panel" style={{marginTop:'20px'}}>
          <h3 className="panel-title">Add Skill</h3>
          <input placeholder="React, CSS..." className="glass-input" value={skill} onChange={(e)=>setSkill(e.target.value)} />
          <button onClick={addSkill} className="send-btn">Add Skill</button>
        </div>

        {/* Project Section */}
        <div className="glass-panel" style={{marginTop:'20px'}}>
          <h3 className="panel-title">Add Project</h3>
          <input placeholder="Project Name" className="glass-input" value={projectName} onChange={(e)=>setProjectName(e.target.value)} />
          <input placeholder="Link (URL)" className="glass-input" value={projectLink} onChange={(e)=>setProjectLink(e.target.value)} />
          <p style={{marginBottom:'5px', color:'#ccc'}}>Project Image:</p>
          <input type="file" className="glass-input" onChange={(e)=>setImageFile(e.target.files[0])} />
          <button onClick={addProject} className="send-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Add Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================
// 3. MAIN APP ROUTER
// =========================================
function App() {
  return (
    // HashRouter is CRITICAL for GitHub Pages
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;