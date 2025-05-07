import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminBlogManager.css"; // Thêm file CSS riêng

const AdminBlogManager = () => {
  // State management
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    image_url: "",
    image_file: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API functions
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/blogs/ReadBlogAll`,
        {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        }
      );
      setBlogs(response.data);
    } catch (err) {
      console.error("Error fetching blog list:", err);
      toast.error("Failed to load blog list!");
    } finally {
      setIsLoading(false);
    }
  };

  const submitBlog = async (data, isEdit) => {
    const config = {
      headers: {
        "API-Key": process.env.REACT_APP_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    };

    const url = isEdit
      ? `${process.env.REACT_APP_API_URL}/blogs/UpdateBlog/${formData.id}`
      : `${process.env.REACT_APP_API_URL}/blogs/CreateBlog`;

    const method = isEdit ? axios.put : axios.post;

    try {
      await method(url, data, config);
      fetchBlogs();
      resetForm();
      toast.success(
        isEdit ? "Blog updated successfully!" : "Blog created successfully!"
      );
    } catch (err) {
      console.error("Error submitting blog:", err);
      toast.error(isEdit ? "Failed to update blog!" : "Failed to create blog!");
    }
  };

  // Handlers
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image_file: e.target.files[0] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("content", formData.content);
    if (formData.image_file) {
      formDataObj.append("image", formData.image_file);
    }
    submitBlog(formDataObj, isEditing);
  };

  const handleEdit = (blog) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      image_url: blog.image_url,
      image_file: null,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/blogs/DeleteBlog/${id}`,
        {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        }
      );
      fetchBlogs();
      toast.success("Blog deleted successfully!");
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error("Failed to delete blog!");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      content: "",
      image_url: "",
      image_file: null,
    });
    setIsEditing(false);
  };

  // Effects
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="admin-blog-container">
      {/* Form Section */}
      <section className="blog-form-section card shadow-sm mb-5">
        <div className="card-body">
          <h2 className="card-title mb-4">
            {isEditing ? "Edit Blog" : "Create New Blog"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title*</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter blog title"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Content*</label>
              <textarea
                className="form-control"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                required
                placeholder="Write your blog content here..."
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Blog Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small className="text-muted">
                {formData.image_url && isEditing && "Current image will be replaced"}
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary me-2">
                {isEditing ? (
                  <>
                    <i className="bi bi-save me-1"></i> Update
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"></i> Create
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="blog-list-section">
        <h3 className="mb-4">Blog List</h3>
        
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="alert alert-info">No blogs found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th width="5%">ID</th>
                  <th width="20%">Title</th>
                  <th width="15%">Image</th>
                  <th width="40%">Content Preview</th>
                  <th width="20%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>{blog.id}</td>
                    <td className="fw-semibold">{blog.title}</td>
                    <td>
                      {blog.image_url ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}${blog.image_url}`}
                          alt={blog.title}
                          className="img-thumbnail"
                          style={{ maxWidth: "100px" }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>
                      <div className="content-preview">
                        {blog.content.length > 100
                          ? `${blog.content.substring(0, 100)}...`
                          : blog.content}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(blog)}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AdminBlogManager;