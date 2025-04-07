import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminBlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ id: null, title: "", content: "", image_url: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    axios.get(`http://127.0.0.1:8000/blogs/ReadBlogAll`, {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    })
      .then(res => setBlogs(res.data))
      .catch(err => {
        console.error("Lỗi khi tải danh sách blog:", err);
        toast.error("Không thể tải danh sách blog!");
      });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const config = {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    };

    if (isEditing) {
      axios.put(`http://127.0.0.1:8000/blogs/UpdateBlog/${formData.id}`, formData, config)
        .then(() => {
          fetchBlogs();
          resetForm();
          toast.success("Cập nhật blog thành công!");
        })
        .catch(err => {
          console.error("Lỗi khi cập nhật blog:", err);
          toast.error("Cập nhật blog thất bại!");
        });
    } else {
      axios.post(`http://127.0.0.1:8000/blogs/CreateBlog`, formData, config)
        .then(() => {
          fetchBlogs();
          resetForm();
          toast.success("Tạo blog thành công!");
        })
        .catch(err => {
          console.error("Lỗi khi tạo blog:", err);
          toast.error("Tạo blog thất bại!");
        });
    }
  };

  const handleEdit = (blog) => {
    setFormData(blog);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa blog này?")) return;

    axios.delete(`http://127.0.0.1:8000/blogs/DeleteBlog/${id}`, {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    })
      .then(() => {
        fetchBlogs();
        toast.success("Xoá blog thành công!");
      })
      .catch(err => {
        console.error("Lỗi khi xóa blog:", err);
        toast.error("Xoá blog thất bại!");
      });
  };

  const resetForm = () => {
    setFormData({ id: null, title: "", content: "", image_url: "" });
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
          <label className="form-label">Image URL (if any)</label>
          <input
            type="text"
            className="form-control"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="btn btn-success me-2">
          {isEditing ? "Cập nhật" : "Create"}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Hủy
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
                    <img src={blog.image_url} alt="thumb" width="80" />
                  ) : (
                    "Không có"
                  )}
                </td>
                <td>
                  {blog.content.length > 80
                    ? blog.content.slice(0, 80) + "..."
                    : blog.content}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(blog)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(blog.id)}>
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
