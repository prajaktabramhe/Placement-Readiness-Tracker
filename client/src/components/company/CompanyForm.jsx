import { useState } from "react";

const CompanyForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(
  initialData || {
    companyName: "",
    role: "",
    location: "",
    status: "Applied",
    notes: "",
  }
);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

   if (!initialData) {
  setFormData({
    companyName: "",
    role: "",
    location: "",
    status: "Applied",
    notes: "",
  });
}
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "8px",
      }}
    >
      <h2>Add Company</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Company Name</label>
        <br />
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Role</label>
        <br />
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Location</label>
        <br />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Status</label>
        <br />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Selected</option>
          <option>Rejected</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Notes</label>
        <br />
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit">Save</button>

      <button
        type="button"
        onClick={onCancel}
        style={{ marginLeft: "10px" }}
      >
        Cancel
      </button>
    </form>
  );
};

export default CompanyForm;