import './ProfileCard.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';

export default function ProfileCard() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    address: "",
    position: "",
    company: "",
    salary: 0,
    role: "employee",
    profilePic: "",
    department: "",
    qualification: "",
    dateOfJoining: "",
    rolesAndResponsibility: [],
    skills: [],
    bankDetails: {
      bankingName: "",
      bankAccountNumber: "",
      ifscCode: "",
      upiId: ""
    }
  });

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(API_ENDPOINTS.getProfile,{
          headers: { Authorization: `Bearer ${token}` }
        }); // Adjust endpoint as needed
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...profile[field]];
    newArray[index] = value;
    setProfile(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], "New Item"]
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleEdit = (section) => {
    setEditing(editing === section ? null : section);
  };

  const saveChanges = async () => {
    try {
      await axios.put('/api/user/profile', profile); // Adjust endpoint as needed
      setEditing(null);
      // Optional: Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      // Optional: Show error message
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Left Column */}
        <div className="column">
          {/* Basic Information Card */}
          <div className="card">
            <div className="card-header">
              <h3>Basic Information</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('basicInfo')}
              >
                {editing === 'basicInfo' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="basic-info">
              <div className="left">
                <img
                  src={profile.profilePic || "/default-avatar.jpg"}
                  alt="Profile"
                  className="avatar"
                />
                {editing === 'basicInfo' ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <h2>{profile.name}</h2>
                )}
                
                <div className="info-item">
                   Email: 
                  {editing === 'basicInfo' ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>
                <div className="info-item">
                   Phone: 
                  {editing === 'basicInfo' ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.phone}</span>
                  )}
                </div>
                <div className="info-item">
                   Address: 
                  {editing === 'basicInfo' ? (
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.address}</span>
                  )}
                </div>
                <div className="info-item">
                   Blood Group: 
                  {editing === 'basicInfo' ? (
                    <input
                      type="text"
                      value={profile.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.bloodGroup}</span>
                  )}
                </div>
              </div>
            </div>
            {editing === 'basicInfo' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Education Card */}
          <div className="card">
            <div className="card-header">
              <h3>Education & Qualification</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('education')}
              >
                {editing === 'education' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="education-info">
              <div className="info-row">
                 Qualification: 
                {editing === 'education' ? (
                  <input
                    type="text"
                    value={profile.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.qualification}</span>
                )}
              </div>
            </div>
            {editing === 'education' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Skills Card */}
          <div className="card">
            <div className="card-header">
              <h3>Skills</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('skills')}
              >
                {editing === 'skills' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="skills-info">
              {profile.skills.map((skill, index) => (
                <div key={index} className="skill-item-container">
                  {editing === 'skills' ? (
                    <>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        className="edit-input skill-input"
                      />
                      <button 
                        className="remove-skill-btn"
                        onClick={() => removeArrayItem('skills', index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="skill-item">{skill}</div>
                  )}
                </div>
              ))}
              {editing === 'skills' && (
                <button className="add-skill-btn" onClick={() => addArrayItem('skills')}>
                  + Add Skill
                </button>
              )}
            </div>
            {editing === 'skills' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Roles & Responsibilities Card */}
          <div className="card">
            <div className="card-header">
              <h3>Roles & Responsibilities</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('rolesAndResponsibility')}
              >
                {editing === 'rolesAndResponsibility' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="roles-info">
              {profile.rolesAndResponsibility.map((role, index) => (
                <div key={index} className="role-item-container">
                  {editing === 'rolesAndResponsibility' ? (
                    <>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => handleArrayChange('rolesAndResponsibility', index, e.target.value)}
                        className="edit-input role-input"
                      />
                      <button 
                        className="remove-role-btn"
                        onClick={() => removeArrayItem('rolesAndResponsibility', index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="role-item">• {role}</div>
                  )}
                </div>
              ))}
              {editing === 'rolesAndResponsibility' && (
                <button className="add-role-btn" onClick={() => addArrayItem('rolesAndResponsibility')}>
                  + Add Responsibility
                </button>
              )}
            </div>
            {editing === 'rolesAndResponsibility' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="column">
          {/* Personal Details Card */}
          {/* <div className="card">
            <div className="card-header">
              <h3>Personal Details</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('personalDetails')}
              >
                {editing === 'personalDetails' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="personal-details">
              <div className="info-row">
                 Blood Group: 
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <span>{profile.bloodGroup}</span>
                )}
              </div>
              <div className="info-row">
                 Role: 
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="edit-select"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span>{profile.role}</span>
                )}
              </div>
            </div>
            {editing === 'personalDetails' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div> */}

          {/* Banking Details Card */}
          <div className="card">
            <div className="card-header">
              <h3>Banking Details</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('bankDetails')}
              >
                {editing === 'bankDetails' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="banking-info">
              <div className="info-row">
                 Bank Name: 
                {editing === 'bankDetails' ? (
                  <input
                    type="text"
                    value={profile.bankDetails.bankingName}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankingName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.bankingName}</span>
                )}
              </div>
              <div className="info-row">
                 Account Number: 
                {editing === 'bankDetails' ? (
                  <input
                    type="text"
                    value={profile.bankDetails.bankAccountNumber}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankAccountNumber', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.bankAccountNumber}</span>
                )}
              </div>
              <div className="info-row">
                 IFSC Code: 
                {editing === 'bankDetails' ? (
                  <input
                    type="text"
                    value={profile.bankDetails.ifscCode}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'ifscCode', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.ifscCode}</span>
                )}
              </div>
              <div className="info-row">
                 UPI ID: 
                {editing === 'bankDetails' ? (
                  <input
                    type="text"
                    value={profile.bankDetails.upiId}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'upiId', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.bankDetails.upiId}</span>
                )}
              </div>
            </div>
            {editing === 'bankDetails' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Company & Position Card */}
          <div className="card">
            <div className="card-header">
              <h3>Company & Position</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('company')}
              >
                {editing === 'company' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="company-info">
              <div className="info-row">
                 Position: 
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.position}</span>
                )}
              </div>
              <div className="info-row">
                 Company: 
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company}</span>
                )}
              </div>
              <div className="info-row">
                 Department: 
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.department}</span>
                )}
              </div>
              <div className="info-row">
                 Salary: 
                {editing === 'company' ? (
                  <input
                    type="number"
                    value={profile.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>${profile.salary.toLocaleString()}/year</span>
                )}
              </div>
              <div className="info-row">
                 Date of Joining: 
                {editing === 'company' ? (
                  <input
                    type="date"
                    value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'Not set'}</span>
                )}
              </div>
            </div>
            {editing === 'company' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}