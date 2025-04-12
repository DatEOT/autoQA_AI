import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './IntroStats.css';

function IntroStats() {
  const [totalQuestions, setTotalQuestions] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    // Gọi API lấy tổng số câu hỏi
    axios.get('http://127.0.0.1:8000/QuestionStats/getTotalQuestions', {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    })
      .then((res) => {
        setTotalQuestions(res.data.total_questions);
      })
      .catch((err) => console.error('Error fetching questions:', err));

    axios.get('http://127.0.0.1:8000/Usermanagement/countUsers', {
      headers: {
        'API-Key': process.env.REACT_APP_API_KEY,
      },
    })
      .then((res) => {
        setTotalUsers(res.data.total_users);
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  return (
    <div className="intro-stats-wrapper">
      {/* PHẦN GIỚI THIỆU */}
      <section className="intro-section text-center py-5 px-3">
        <div className="container">
          <h2 className="fw-bold mb-3">
            Tối ưu trải nghiệm học tập bằng câu hỏi chất lượng
          </h2>
          <p className="text-muted lead">
            Nền tảng của chúng tôi giúp bạn tạo ra câu hỏi thông minh, đánh giá hiệu quả
            và tăng sự tương tác trong quá trình học.
          </p>
          <a href="/about" className="custom-btn mt-3">Tìm hiểu thêm</a>
        </div>
      </section>

      {/* PHẦN THỐNG KÊ */}
      <section className="stats-section py-4 text-center">
        <div className="container d-flex justify-content-around flex-wrap gap-4">
          <div>
            <h3 className="fw-bold text-primary">
              {totalQuestions !== null ? totalQuestions.toLocaleString() : '...'}
            </h3>
            <p className="text-muted">Câu hỏi đã tạo</p>
          </div>
          <div>
            <h3 className="fw-bold text-primary">
              {totalUsers !== null ? totalUsers.toLocaleString() : '...'}
            </h3>
            <p className="text-muted">Người dùng đang sử dụng</p>
          </div>
          <div>
            <h3 className="fw-bold text-primary">5 giây</h3>
            <p className="text-muted">Thời gian tạo 1 câu hỏi</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default IntroStats;
