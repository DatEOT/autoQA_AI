import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import './Blog.css';

function Blog() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/blogs/ReadBlogAll", {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    })
    .then(res => setBlogs(res.data))
    .catch(err => console.error("Lỗi tải blog:", err));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true, 
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768, // Mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="container my-5">
      <h2 className="fw-bold text-center mb-4">Bài viết nổi bật</h2>

      {blogs.length <= 3 ? (
        <div className="row">
          {blogs.map((blog) => (
            <div className="col-md-4 mb-4" key={blog.id}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      ) : (
        <Slider {...settings}>
          {blogs.map((blog) => (
            <div key={blog.id}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
}

function BlogCard({ blog }) {
  return (
    <div className="card quill-card mx-2 h-100 shadow">
      {blog.image_url && (
        <img
          src={blog.image_url}
          className="card-img-top rounded-top"
          alt={blog.title}
          style={{ height: '180px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="fw-bold mb-2 text-dark">{blog.title}</h5>
        <p className="text-secondary mb-3" style={{ flexGrow: 1 }}>
          {blog.content.length > 100
            ? blog.content.slice(0, 100) + '...'
            : blog.content}
        </p>
        <a href={`/blog/${blog.id}`} className="custom-btn mt-auto align-self-start">
          Đọc thêm
        </a>
      </div>
    </div>
  );
}


export default Blog;
