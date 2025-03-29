import React from 'react';
import './styleui/GenerateButton.css'
const GenerateButton = ({ onClick, loading }) => {
  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
          Đang tạo...
        </>
      ) : (
        <>
          <i className="fas fa-question-circle" style={{ marginRight: '8px' }}></i>
          Tạo Câu Hỏi
        </>
      )}
    </button>
  );
};

export default GenerateButton;