import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminBlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    image_url: "",
    image_file: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/blogs/ReadBlogAll`, {
        headers: {
          "API-Key": process.env.REACT_APP_API_KEY,
        },
      })
      .then((res) => setBlogs(res.data))
      .catch((err) => {
        console.error("Error fetching blog list:", err);
        toast.error("Failed to load blog list!");
      });
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image_file: e.target.files[0] }));
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image_file) {
      data.append("image", formData.image_file);
    }

    const config = {
      headers: {
        "API-Key": process.env.REACT_APP_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    };

    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/blogs/UpdateBlog/${formData.id}`
      : `${process.env.REACT_APP_API_URL}/blogs/CreateBlog`;

    const method = isEditing ? axios.put : axios.post;

    method(url, data, config)
      .then(() => {
        fetchBlogs();
        resetForm();
        toast.success(isEditing ? "Blog updated successfully!" : "Blog created successfully!");
      })
      .catch((err) => {
        console.error("Error submitting blog:", err);
        toast.error(isEditing ? "Failed to update blog!" : "Failed to create blog!");
      });
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
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    axios
      .delete(`${process.env.REACT_APP_API_URL}/blogs/DeleteBlog/${id}`, {
        headers: {
          "API-Key": process.env.REACT_APP_API_KEY,
        },
      })
      .then(() => {
        fetchBlogs();
        toast.success("Blog deleted successfully!");
      })
      .catch((err) => {
        console.error("Error deleting blog:", err);
        toast.error("Failed to delete blog!");
      });
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

  return (
    <div className="container my-5">
      <h2 className="mb-4">{isEditing ? "Edit Blog" : "Create New Blog"}</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            name="content"
            rows="4"
            value={formData.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Select image (optional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-success me-2">
          {isEditing ? "Update" : "Create"}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <h3 className="mb-3">Blog List</h3>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Image</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.id}</td>
                <td>{blog.title}</td>
                <td>
                  {blog.image_url ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${blog.image_url}`}
                      alt="thumb"
                      width="80"
                    />
                  ) : (
                    "None"
                  )}
                </td>
                <td>
                  {blog.content.length > 80
                    ? blog.content.slice(0, 80) + "..."
                    : blog.content}
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleEdit(blog)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(blog.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AdminBlogManager;
