import './ProfileCard.css';
import { useState } from 'react';

export default function ProfileCard() {
  const [profile, setProfile] = useState({
    basicInfo: {
      name: "Sruthi joseph",
      id: "1210372726433743682",
      gender: "Female",
      email: "sruthijoseph5@gmail.com",
      phone: "081323323311",
      avatar: "/Myphoto.jpg"
    },
    education: {
      degree: "Master Degree - Public administration",
      years: "2016-2018"
    },
    skills: ["HTML & CSS", "JavaScript (ES6+)", "React.js", "Node.js", "Python", "SQL & MongoDB", "Git & GitHub", "Docker"],
    personalDetails: {
      birthPlace: "chennai",
      birthDate: "30 Oct 1994",
      bloodType: "AB",
      maritalStatus: "Single",
      religion: "Christian"
    },
    banking: {
      name: "sruthi joseph",
      bankingName: "SBI",
      upiId: "12233",
      ifscCode:"SBI0987",
      accountNumber: "081324815250"
    },
    company: {
      position: "Senior Developer",
      company: "TechCorp Solutions",
      department: "Software Development",
      salary: "85,000/year",
      startDate: "March 2022",
      employmentType: "Full-time"
    }
  });

  const [editing, setEditing] = useState(null);

  const handleInputChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...profile.skills];
    newSkills[index] = value;
    setProfile(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, "New Skill"]
    }));
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const toggleEdit = (section) => {
    setEditing(editing === section ? null : section);
  };

  const saveChanges = () => {
    setEditing(null);
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Left Column */}
        <div className="column">
          {/* Basic Information Card */}
          <div className="card">
            <div className="card-header">
              <h3>Basic information</h3>
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
                  src={profile.basicInfo.avatar}
                  alt="Profile"
                  className="avatar"
                />
                {editing === 'basicInfo' ? (
                  <input
                    type="text"
                    value={profile.basicInfo.name}
                    onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <h2>{profile.basicInfo.name}</h2>
                )}
                <p>ID: {profile.basicInfo.id}</p>
                <div className="info-item">
                  {editing === 'basicInfo' ? (
                    <select
                      value={profile.basicInfo.gender}
                      onChange={(e) => handleInputChange('basicInfo', 'gender', e.target.value)}
                      className="edit-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{profile.basicInfo.gender}</span>
                  )}
                </div>
                <div className="info-item">
                  {editing === 'basicInfo' ? (
                    <input
                      type="email"
                      value={profile.basicInfo.email}
                      onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.basicInfo.email}</span>
                  )}
                </div>
                <div className="info-item">
                  {editing === 'basicInfo' ? (
                    <input
                      type="tel"
                      value={profile.basicInfo.phone}
                      onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{profile.basicInfo.phone}</span>
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
              <h3>Education</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('education')}
              >
                {editing === 'education' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="education-info">
              <div className="info-row">
                <strong>Degree:</strong>
                {editing === 'education' ? (
                  <input
                    type="text"
                    value={profile.education.degree}
                    onChange={(e) => handleInputChange('education', 'degree', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.education.degree}</span>
                )}
              </div>
              {/* <div className="info-row">
                <strong>Field:</strong>
                {editing === 'education' ? (
                  <input
                    type="text"
                    value={profile.education.field}
                    onChange={(e) => handleInputChange('education', 'field', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.education.field}</span>
                )}
              </div> */}
              
              <div className="info-row">
                <strong>Years:</strong>
                {editing === 'education' ? (
                  <input
                    type="text"
                    value={profile.education.years}
                    onChange={(e) => handleInputChange('education', 'years', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.education.years}</span>
                )}
              </div>
            </div>
            {editing === 'education' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Tech Skills Card */}
          <div className="card">
            <div className="card-header">
              <h3>Tech Skills</h3>
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
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className="edit-input skill-input"
                      />
                      <button 
                        className="remove-skill-btn"
                        onClick={() => removeSkill(index)}
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
                <button className="add-skill-btn" onClick={addSkill}>
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
        </div>

        {/* Right Column */}
        <div className="column">
          {/* Place of Birth Card */}
          <div className="card">
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
                <strong>Birth Place:</strong>
                {editing === 'personalDetails' ? (
                  <input
                    type="text"
                    value={profile.personalDetails.birthPlace}
                    onChange={(e) => handleInputChange('personalDetails', 'birthPlace', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.personalDetails.birthPlace}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Birth Date:</strong>
                {editing === 'personalDetails' ? (
                  <input
                    type="text"
                    value={profile.personalDetails.birthDate}
                    onChange={(e) => handleInputChange('personalDetails', 'birthDate', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.personalDetails.birthDate}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Blood Type:</strong>
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.personalDetails.bloodType}
                    onChange={(e) => handleInputChange('personalDetails', 'bloodType', e.target.value)}
                    className="edit-select"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                ) : (
                  <span>{profile.personalDetails.bloodType}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Marital Status:</strong>
                {editing === 'personalDetails' ? (
                  <select
                    value={profile.personalDetails.maritalStatus}
                    onChange={(e) => handleInputChange('personalDetails', 'maritalStatus', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    {/* <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option> */}
                  </select>
                ) : (
                  <span>{profile.personalDetails.maritalStatus}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Religion:</strong>
                {editing === 'personalDetails' ? (
                  <input
                    type="text"
                    value={profile.personalDetails.religion}
                    onChange={(e) => handleInputChange('personalDetails', 'religion', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.personalDetails.religion}</span>
                )}
              </div>
            </div>
            {editing === 'personalDetails' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Banking Details Card */}
          <div className="card">
            <div className="card-header">
              <h3>Banking details</h3>
              <button 
                className="edit-btn" 
                onClick={() => toggleEdit('banking')}
              >
                {editing === 'banking' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="banking-info">
              <div className="info-row">
                <strong> Banking Name:</strong>
                {editing === 'banking' ? (
                  <input
                    type="text"
                    value={profile.banking.name}
                    onChange={(e) => handleInputChange('banking', 'name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.banking.name}</span>
                )}
              </div>
              <div className="info-row">
                <strong>UPI ID:</strong>
                {editing === 'banking' ? (
                  <input
                    type="text"
                    value={profile.banking.upiId}
                    onChange={(e) => handleInputChange('banking', 'upiId', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.banking.upiId}</span>
                )}
              </div>
              <div className="info-row">
                <strong>IFSC Code:</strong>
                {editing === 'banking' ? (
                  <input
                    type="text"
                    value={profile.banking.ifscCode}
                    onChange={(e) => handleInputChange('banking', 'ifscCode', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.banking.ifscCode}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Account Number:</strong>
                {editing === 'banking' ? (
                  <input
                    type="text"
                    value={profile.banking.accountNumber}
                    onChange={(e) => handleInputChange('banking', 'accountNumber', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.banking.accountNumber}</span>
                )}
              </div>
            </div>
            {editing === 'banking' && (
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}
          </div>

          {/* Company/Position Card */}
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
                <strong>Position:</strong>
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company.position}
                    onChange={(e) => handleInputChange('company', 'position', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company.position}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Company:</strong>
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company.company}
                    onChange={(e) => handleInputChange('company', 'company', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company.company}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Department:</strong>
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company.department}
                    onChange={(e) => handleInputChange('company', 'department', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company.department}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Salary:</strong>
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company.salary}
                    onChange={(e) => handleInputChange('company', 'salary', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company.salary}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Start Date:</strong>
                {editing === 'company' ? (
                  <input
                    type="text"
                    value={profile.company.startDate}
                    onChange={(e) => handleInputChange('company', 'startDate', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{profile.company.startDate}</span>
                )}
              </div>
              <div className="info-row">
                <strong>Employment Type:</strong>
                {editing === 'company' ? (
                  <select
                    value={profile.company.employmentType}
                    onChange={(e) => handleInputChange('company', 'employmentType', e.target.value)}
                    className="edit-select"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                ) : (
                  <span>{profile.company.employmentType}</span>
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