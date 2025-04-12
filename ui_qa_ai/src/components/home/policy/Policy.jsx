import React, { useState } from 'react';
import './Policy.css';

function Policy() {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type) => {
    if (type === 'privacy') {
      setModalContent({
        title: 'Chính sách bảo mật',
        content: 'Chúng tôi cam kết bảo vệ thông tin người dùng, không chia sẻ cho bên thứ ba nếu không có sự cho phép.'
      });
    } else if (type === 'terms') {
      setModalContent({
        title: 'Điều khoản sử dụng',
        content: 'Người dùng cần tuân thủ các quy định về nội dung, không sử dụng hệ thống vào mục đích xấu hay gian lận.'
      });
    }
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <section className="bg-light py-5">
      <div className="container">
        <h3 className="text-center fw-bold mb-5">Chính sách & Điều khoản</h3>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="policy-box h-100" onClick={() => openModal('privacy')}>
              <h5 className="fw-bold mb-3">Chính sách bảo mật</h5>
              <p className="text-muted">Nhấn để xem chi tiết...</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="policy-box h-100" onClick={() => openModal('terms')}>
              <h5 className="fw-bold mb-3">Điều khoản sử dụng</h5>
              <p className="text-muted">Nhấn để xem chi tiết...</p>
            </div>
          </div>
        </div>
      </div>

      {modalContent && (
        <div className="custom-modal-overlay" onClick={closeModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5 className="fw-bold mb-3">{modalContent.title}</h5>
            <p>{modalContent.content}</p>
            <button className="btn btn-secondary mt-3" onClick={closeModal}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Policy;
