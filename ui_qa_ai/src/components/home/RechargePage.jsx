import React, { useState } from 'react';
import QRBank from '../../assets/images/QRBank.jpg';
import HomeHeader from './header/HomeHeader';
function RechargePage() {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  return (
    <div className='app'>
      <HomeHeader />
      <div className="container py-5">
        <h1 className="fw-bold mb-4 text-center">Nạp Tiền Vào Tài Khoản</h1>

        <h3 className="text-center text-success mb-5">125.000đ = 300 Token</h3>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="mb-4">
              <h5 className="fw-bold">Thông tin chuyển khoản:</h5>
              <ul className="list-unstyled fs-5">
                <li>🏦 Ngân hàng: <strong>BIDV</strong></li>
                <li>🔢 Số tài khoản: <strong>7500608182</strong></li>
                <li>👤 Chủ tài khoản: <strong>NGUYEN THANH DAT</strong></li>
              </ul>
              <p className="text-muted fst-italic">
                * Ghi rõ nội dung chuyển khoản: <strong>Email đã đăng kí</strong>
              </p>
            </div>

            <div className="text-center mb-3">
              <img
                src={QRBank}
                alt="QR ngân hàng"
                className="img-fluid rounded shadow"
                width="220"
              />
              <p className="mt-2 text-muted">Quét mã QR để chuyển khoản nhanh</p>
            </div>

            <div className="text-center">
              <button className="btn btn-primary fw-bold me-3" onClick={handleConfirm}>
                Tôi đã chuyển khoản
              </button>

              {confirmed && (
                <div className="alert alert-success mt-3">
                  ✅ Yêu cầu xác nhận đã được gửi. Vui lòng chờ admin cộng token.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RechargePage;
