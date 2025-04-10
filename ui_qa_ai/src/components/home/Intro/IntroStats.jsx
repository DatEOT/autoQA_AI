import React from 'react';
import './IntroStats.css';

function IntroStats() {
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
            <h3 className="fw-bold text-primary">12,000+</h3>
            <p className="text-muted">Câu hỏi đã tạo</p>
          </div>
          <div>
            <h3 className="fw-bold text-primary">300+</h3>
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
