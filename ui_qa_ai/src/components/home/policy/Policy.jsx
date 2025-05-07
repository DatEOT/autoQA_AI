import React, { useState } from 'react';
import { FiLock, FiFileText, FiX, FiChevronRight } from 'react-icons/fi';
import './Policy.css';

function Policy() {
  const [modalContent, setModalContent] = useState(null);
  const [activeTab, setActiveTab] = useState('privacy');

  const policies = {
    privacy: {
      title: 'Chính sách bảo mật',
      content: [
        'Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo quy định pháp luật.',
        'Mọi thông tin thu thập sẽ chỉ được sử dụng cho mục đích cải thiện trải nghiệm dịch vụ.',
        'Chúng tôi không chia sẻ thông tin cá nhân cho bên thứ ba mà không có sự đồng ý của bạn.',
        'Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân bất cứ lúc nào.'
      ]
    },
    terms: {
      title: 'Điều khoản sử dụng',
      content: [
        'Người dùng phải tuân thủ mọi quy định pháp luật Việt Nam khi sử dụng dịch vụ.',
        'Không được sử dụng hệ thống vào mục đích gian lận, vi phạm pháp luật hoặc gây hại cho người khác.',
        'Mọi nội dung đăng tải phải tuân thủ các chuẩn mực đạo đức và văn hóa.',
        'Chúng tôi có quyền chấm dứt tài khoản nếu phát hiện hành vi vi phạm điều khoản.'
      ]
    }
  };

  const openModal = (type) => {
    setModalContent(policies[type]);
    setActiveTab(type);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <section className="policy-section">
      <div className="policy-container">
        <h2 className="policy-main-title">Chính sách & Điều khoản</h2>
        <p className="policy-subtitle">Tìm hiểu về các quy định và cam kết của chúng tôi</p>
        
        <div className="policy-grid">
          <div 
            className={`policy-card ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => openModal('privacy')}
          >
            <div className="policy-icon">
              <FiLock size={24} />
            </div>
            <div className="policy-card-content">
              <h3>Chính sách bảo mật</h3>
              <p>Xem cách chúng tôi bảo vệ thông tin của bạn</p>
              <div className="policy-read-more">
                <span>Xem chi tiết</span>
                <FiChevronRight size={18} />
              </div>
            </div>
          </div>

          <div 
            className={`policy-card ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => openModal('terms')}
          >
            <div className="policy-icon">
              <FiFileText size={24} />
            </div>
            <div className="policy-card-content">
              <h3>Điều khoản sử dụng</h3>
              <p>Quy định khi sử dụng dịch vụ của chúng tôi</p>
              <div className="policy-read-more">
                <span>Xem chi tiết</span>
                <FiChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalContent && (
        <div className="policy-modal-overlay" onClick={closeModal}>
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <button className="policy-modal-close" onClick={closeModal}>
              <FiX size={24} />
            </button>
            
            <h3 className="policy-modal-title">{modalContent.title}</h3>
            
            <div className="policy-modal-content">
              <ul>
                {modalContent.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="policy-modal-footer">
              <button className="policy-modal-button" onClick={closeModal}>
                Tôi đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Policy;