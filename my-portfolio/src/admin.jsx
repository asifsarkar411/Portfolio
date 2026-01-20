import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AIBackground from './AIBackground';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminData, setAdminData] = useState(null);

  // Form States
  const [skill, setSkill] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [projectImage, setProjectImage] = useState(null);

  // Loading States
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Fetch existing data for the dashboard
        const docRef = doc(db, "portfolio", "data");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminData(docSnap.data());
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 2. Add a New Skill
  const addSkill = async () => {
    if (!skill) return;
    setLoadingSkill(true);
    try {
      await setDoc(doc(db, "portfolio", "data"), {
        skills: arrayUnion(skill)
      }, { merge: true });
      setSkill('');
      alert("Skill Added!");
      // Refresh data
      const docSnap = await getDoc(doc(db, "portfolio", "data"));
      if (docSnap.exists()) setAdminData(docSnap.data());
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Error: " + error.message);
    }
    setLoadingSkill(false);
  };

  // 3. Add Project with Image
  const addProject = async (e) => {
    e.preventDefault();
    if (!projectName || !projectLink || !projectImage) {
      alert("Please fill all project fields");
      return;
    }
    setLoadingProject(true);
    try {
      // Upload Image first
      const storageRef = ref(storage, `project_${Date.now()}`);
      await uploadBytes(storageRef, projectImage);
      const imageUrl = await getDownloadURL(storageRef);

      // Save Data to Firestore
      const newProject = { name: projectName, link: projectLink, img: imageUrl };
      await setDoc(doc(db, "portfolio", "data"), {
        projects: arrayUnion(newProject)
      }, { merge: true });

      setProjectName('');
      setProjectLink('');
      setProjectImage(null);
      alert("Project Added Successfully!");
      // Refresh data
      const docSnap = await getDoc(doc(db, "portfolio", "data"));
      if (docSnap.exists()) setAdminData(docSnap.data());
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Error: " + error.message);
    }
    setLoadingProject(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <AIBackground />
        <div className="login-box">
          <h2>Admin Access</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <input type="email" className="glass-input" onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" required />
            <input type="password" className="glass-input" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit" className="login-btn">Login to Dashboard</button>
          </form>
          <button className="back-btn" style={{marginTop: '20px', width: '100%', justifyContent: 'center'}} onClick={() => window.location.href = '/'}>
            ← Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <AIBackground />
      
      {/* --- SIDEBAR --- */}
      <aside className="dash-sidebar">
        <div className="profile-section">
          <img src={adminData?.profilePic || "https://via.placeholder.com/100"} alt="Profile" className="profile-pic-large" />
          <h3>Admin</h3>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-item active">
            <span className="sidebar-icon">📊</span> Dashboard
          </button>
          <button className="sidebar-item">
            <span className="sidebar-icon">🛠️</span> Skills
          </button>
          <button className="sidebar-item">
            <span className="sidebar-icon">📁</span> Projects
          </button>
          <button className="sidebar-item">
            <span className="sidebar-icon">👤</span> Contact
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */ }
      <main className="dash-main-content">
        <header className="dash-header">
          <h1 className="dash-title">2 Admin Dashboard</h1>
          <div className="header-actions">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">⚙️</button>
            <button className="icon-btn" onClick={handleLogout} title="Logout">🚪</button>
          </div>
        </header>

        <div className="dash-grid">
          
          {/* --- PANEL 1: Admin Dashboard Summary --- */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">Admin Dashboard</h2>
              <span className="icon-btn" style={{width: '30px', height: '30px', fontSize: '14px'}}>↓</span>
            </div>
            <div className="panel-content">
              <p>Welcome to your portfolio's control center.</p>
              <p>Here you can manage your skills, projects, and view contact information.</p>
              <p style={{marginTop: '20px'}}>Logged in as: <span className="highlight-text">{auth.currentUser.email}</span></p>
            </div>
          </div>

          {/* --- PANEL 2: Projects List --- */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">Projects</h2>
              <span className="icon-btn" style={{width: '30px', height: '30px', fontSize: '14px'}}>↓</span>
            </div>
            <div className="panel-content">
              <p style={{marginBottom: '15px'}}>A quick view of your existing projects.</p>
              <div className="project-mini-grid">
                {adminData?.projects && adminData.projects.length > 0 ? (
                  adminData.projects.map((p, index) => (
                    <div key={index} className="project-mini-card">
                      <img src={p.img || "https://via.placeholder.com/150"} alt={p.name} className="project-mini-img" />
                      <div className="project-mini-info">
                        <h4 className="project-mini-title">{p.name}</h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No projects added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* --- PANEL 3: Add New Skill --- */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">Add New Skill</h2>
              <span className="icon-btn" style={{width: '30px', height: '30px', fontSize: '14px'}}>↓</span>
            </div>
            <div className="panel-content">
              <div className="form-group">
                <label className="form-label">New Skill Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={skill} 
                  onChange={(e) => setSkill(e.target.value)} 
                  placeholder="e.g. React Native" 
                />
              </div>
              <div style={{textAlign: 'right'}}>
                <button className="send-btn" onClick={addSkill} disabled={loadingSkill}>
                  {loadingSkill ? "Adding..." : "Send btn"}
                </button>
              </div>
            </div>
          </div>

          {/* --- PANEL 4: Add New Project --- */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">Add New Project</h2>
              <span className="icon-btn" style={{width: '30px', height: '30px', fontSize: '14px'}}>↓</span>
            </div>
            <div className="panel-content">
              <form onSubmit={addProject}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input 
                    type="text"
                    className="glass-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Link (URL)</label>
                  <input 
                    type="text"
                    className="glass-input"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Cover Image</label>
                  <label htmlFor="project-image-upload" className="file-upload-label">
                    {projectImage ? projectImage.name : "Click to upload image"}
                  </label>
                  <input 
                    id="project-image-upload"
                    type="file" 
                    onChange={(e) => setProjectImage(e.target.files[0])}
                    style={{display: 'none'}}
                  />
                </div>
                <div style={{textAlign: 'right'}}>
                  <button type="submit" className="send-btn" disabled={loadingProject}>
                    {loadingProject ? "Uploading..." : "Send btn"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* --- PANEL 5: Contact Info --- */}
          <div className="glass-panel">
            <div className="panel-header">
              <h2 className="panel-title">Contact</h2>
              <span className="icon-btn" style={{width: '30px', height: '30px', fontSize: '14px'}}>↓</span>
            </div>
            <div className="panel-content">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="text" className="glass-input" value="asifsarkar411@gmail.com" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" className="glass-input" value="+880123456789" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="glass-input" value="Dhaka, Bangladesh" readOnly />
              </div>
            </div>
          </div>

        </div> {/* End of dash-grid */}

        <div style={{marginTop: '20px'}}>
          <a href="/" className="back-btn" style={{display: 'inline-flex'}}>
            ← Back to Portfolio
          </a>
        </div>

      </main>

      {/* Floating View Portfolio Button */}
      <a href="/" className="view-portfolio-btn-large">
        View Portfolio →
      </a>
    </div>
  );
};

export default Admin;