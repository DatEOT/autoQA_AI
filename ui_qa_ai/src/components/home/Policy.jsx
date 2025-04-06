import React from 'react';
import './stylehome/Policy.css';

function Policy() {
  return (
    <section className="bg-light py-5">
      <div className="container">
        <h3 className="text-center fw-bold mb-5">Chính sách & Điều khoản</h3>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="policy-box h-100">
              <h5 className="fw-bold mb-3">Chính sách bảo mật</h5>
              <p>
                Chúng tôi cam kết bảo vệ thông tin người dùng, không chia sẻ cho bên thứ ba nếu không có sự cho phép.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="policy-box h-100">
              <h5 className="fw-bold mb-3">Điều khoản sử dụng</h5>
              <p>
                Người dùng cần tuân thủ các quy định về nội dung, không sử dụng hệ thống vào mục đích xấu hay gian lận.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Policy;
