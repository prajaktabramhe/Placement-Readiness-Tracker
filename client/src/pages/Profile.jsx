import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [resume, setResume] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [education, setEducation] = useState({
    degree: "",
    branch: "",
    gpa: "",
    graduationYear: "",
  });

  // Skills input state
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("Frontend");
  const [skillLevel, setSkillLevel] = useState("Beginner");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/me");
      if (response.data.success) {
        const user = response.data.user;
        setProfile(user);
        setPhone(user.phone || "");
        setPreferredRole(user.preferredRole || "");
        setResume(user.resume || "");
        setLinkedin(user.linkedin || "");
        setGithub(user.github || "");
        setEducation({
          degree: user.education?.degree || "",
          branch: user.education?.branch || "",
          gpa: user.education?.gpa || "",
          graduationYear: user.education?.graduationYear || "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        phone,
        preferredRole,
        resume,
        linkedin,
        github,
        education: {
          degree: education.degree,
          branch: education.branch,
          gpa: education.gpa ? parseFloat(education.gpa) : null,
          graduationYear: education.graduationYear ? parseInt(education.graduationYear) : null,
        },
      };

      const response = await API.put("/users/me", payload);
      if (response.data.success) {
        toast.success("Profile details updated!");
        setProfile(response.data.user);
        setEditMode(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) {
      return toast.warning("Skill name cannot be empty");
    }

    try {
      const currentSkills = [...(profile.skills || [])];
      // Check if skill already exists
      const exists = currentSkills.find(
        (s) => s.name.toLowerCase() === skillName.trim().toLowerCase()
      );
      if (exists) {
        return toast.warning("Skill is already listed in your profile");
      }

      const updatedSkills = [
        ...currentSkills,
        { name: skillName.trim(), category: skillCategory, level: skillLevel },
      ];

      const response = await API.put("/users/me/skills", { skills: updatedSkills });
      if (response.data.success) {
        toast.success("Skill added successfully!");
        setProfile({
          ...profile,
          skills: response.data.skills,
          readinessScore: response.data.readinessScore,
          readinessStatus: response.data.readinessStatus,
        });
        setSkillName("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const updatedSkills = profile.skills.filter((s) => s._id !== skillId);
      const response = await API.put("/users/me/skills", { skills: updatedSkills });
      if (response.data.success) {
        toast.success("Skill removed successfully");
        setProfile({
          ...profile,
          skills: response.data.skills,
          readinessScore: response.data.readinessScore,
          readinessStatus: response.data.readinessStatus,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove skill");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Calculate missing elements checklist
  const checklist = [];
  if (!phone) checklist.push({ field: "Phone number", reason: "Required for recruiters to contact you" });
  if (!education.degree || !education.branch || !education.gpa || !education.graduationYear) {
    checklist.push({ field: "Education details", reason: "Add degree, branch, GPA, and graduation year" });
  }
  if (!resume) checklist.push({ field: "Resume profile", reason: "Upload/link your PDF resume" });
  if (!linkedin) checklist.push({ field: "LinkedIn profile", reason: "Connect your professional network" });
  if (!github) checklist.push({ field: "GitHub profile", reason: "Share your project repositories" });
  if (!preferredRole) checklist.push({ field: "Preferred job role", reason: "Select target designation" });
  if (!profile.skills || profile.skills.length < 3) {
    checklist.push({ field: "Technical Skills", reason: "Add at least 3 skills to demonstrate preparation" });
  }

  const scoreColor = (score) => {
    if (score >= 75) return "text-green-600 border-green-600 bg-green-50";
    if (score >= 50) return "text-yellow-600 border-yellow-600 bg-yellow-50";
    return "text-red-600 border-red-600 bg-red-50";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Placement Readiness Profile</h1>
        <p className="text-gray-500 mt-2">Manage your skill set, qualifications, links, and track your readiness progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Score & Checklist */}
        <div className="space-y-8 lg:col-span-1">
          {/* Readiness Score Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 text-center space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Readiness Meter</h3>
            
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Simple Circular Progress representation using borders */}
              <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
              <div 
                className={`absolute inset-0 rounded-full border-8 border-amber-600 transition-all duration-700`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${profile.readinessScore >= 25 ? "100% 0%," : ""} ${profile.readinessScore >= 50 ? "100% 100%," : ""} ${profile.readinessScore >= 75 ? "0% 100%," : ""} ${profile.readinessScore === 100 ? "0% 0%," : ""} 50% 0%)`
                }}
              ></div>
              <div className="z-10 text-center">
                <span className="text-4xl font-extrabold text-gray-800">{profile.readinessScore}%</span>
                <p className="text-gray-400 text-xs font-semibold uppercase mt-0.5">Ready</p>
              </div>
            </div>

            <div className="pt-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${scoreColor(profile.readinessScore)}`}>
                {profile.readinessStatus === "Ready" ? "🚀 PLACEMENT ZONE READY" : "⚠️ NEEDS IMPROVEMENT"}
              </span>
            </div>
            
            <p className="text-xs text-gray-400">
              Reach a minimum of <span className="font-bold">75%</span> score to unlock placement coordinators approval.
            </p>
          </div>

          {/* Checklist Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Readiness Checklist</h3>
            
            {checklist.length === 0 ? (
              <div className="text-center py-6 bg-green-50 border border-green-100 rounded-xl">
                <span className="text-3xl">🎉</span>
                <h4 className="font-bold text-green-800 mt-2">All tasks completed!</h4>
                <p className="text-green-600 text-xs mt-1">You are fully eligible for postings.</p>
              </div>
            ) : (
              <ul className="space-y-3.5">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-yellow-500 shrink-0 text-lg">⚠️</span>
                    <div>
                      <h5 className="font-bold text-gray-800 leading-tight">{item.field}</h5>
                      <p className="text-gray-400 text-xs mt-0.5">{item.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: Profile Details & Skills Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Fields Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-xl">Personal & Academic Details</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                  editMode
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                }`}
              >
                {editMode ? "Cancel" : "✏️ Edit Details"}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Target Job Designation</label>
                    <select
                      value={preferredRole}
                      onChange={(e) => setPreferredRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                    >
                      <option value="">Select Role</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full-Stack Developer">Full-Stack Developer</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="QA Engineer">QA Engineer</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-700 text-sm mb-3">Academic Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech"
                        value={education.degree}
                        onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Branch / Major</label>
                      <input
                        type="text"
                        placeholder="e.g. CSE"
                        value={education.branch}
                        onChange={(e) => setEducation({ ...education, branch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">GPA / CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 9.1"
                        value={education.gpa}
                        onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Grad Year</label>
                      <input
                        type="number"
                        placeholder="e.g. 2026"
                        value={education.graduationYear}
                        onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h4 className="font-bold text-gray-700 text-sm">Professional Web Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Resume Profile Link</label>
                      <input
                        type="text"
                        placeholder="e.g. Drive / Dropbox URL"
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">LinkedIn Profile Link</label>
                      <input
                        type="text"
                        placeholder="linkedin.com/in/user"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">GitHub / Portfolio Link</label>
                      <input
                        type="text"
                        placeholder="github.com/user"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-bold rounded-xl transition duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Save Academic Info
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                    <p className="text-gray-800 font-medium mt-1">{profile.phone || "Not Specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Target Role</span>
                    <p className="text-gray-800 font-medium mt-1">{profile.preferredRole || "Not Specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Degree & Branch</span>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.education?.degree ? `${profile.education.degree} (${profile.education.branch})` : "Not Specified"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">GPA Score</span>
                    <p className="text-gray-800 font-medium mt-1">{profile.education?.gpa || "Not Specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Graduation Year</span>
                    <p className="text-gray-800 font-medium mt-1">{profile.education?.graduationYear || "Not Specified"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Academic Status</span>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.education?.graduationYear ? "Registered Student" : "Incomplete Profile"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">Professional Links</span>
                  <div className="flex gap-4 flex-wrap">
                    {profile.resume ? (
                      <a href={profile.resume} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition">
                        📄 Resume Link
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">No Resume Listed</span>
                    )}

                    {profile.linkedin ? (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition">
                        🔗 LinkedIn Connect
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">No LinkedIn Listed</span>
                    )}

                    {profile.github ? (
                      <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold transition">
                        🐙 GitHub Profile
                      </a>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">No GitHub Listed</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills Management Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6">
            <h3 className="font-bold text-gray-800 text-xl">Technical & Soft Skills</h3>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Category</label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Problem Solving">Problem Solving</option>
                  <option value="Communication">Communication</option>
                  <option value="Resume Readiness">Resume Readiness</option>
                  <option value="Interview Readiness">Interview Readiness</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Proficiency Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="Beginner">Beginner (5 pts)</option>
                  <option value="Intermediate">Intermediate (10 pts)</option>
                  <option value="Advanced">Advanced (15 pts)</option>
                  <option value="Placement Ready">Placement Ready (20 pts)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/15 cursor-pointer"
              >
                + Add Skill
              </button>
            </form>

            {/* Skills List */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700 text-sm">Listed Skills</h4>
              {!profile.skills || profile.skills.length === 0 ? (
                <p className="text-gray-400 text-sm">No skills added yet. Use the form above to list your preparation credentials.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill) => (
                    <div key={skill._id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-gray-800 text-sm">{skill.name}</h5>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                            {skill.category}
                          </span>
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                            {skill.level}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill._id)}
                        className="text-gray-400 hover:text-red-600 p-1 text-sm transition cursor-pointer"
                        title="Remove Skill"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

