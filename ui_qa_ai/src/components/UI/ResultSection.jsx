import React from 'react';

const ResultSection = ({ results }) => {
  if (!results) {
    return (
      <div className="result-section">
        <h2>Danh Sách Câu Hỏi</h2>
        <div id="questionsList">
          <p>Chưa có dữ liệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-section">
      <h2>Danh Sách Câu Hỏi</h2>
      <div id="questionsList">
        <p><strong>File ID:</strong> {results.file_id}</p>
        <p><strong>Tên file gốc:</strong> {results.original_filename}</p>
        <p><strong>Số đoạn:</strong> {results.num_segments}</p>
        <h3>Câu hỏi và đáp án:</h3>
        {results.questions_and_answers.map((qa, index) => (
          <pre key={index}>{qa}</pre>
        ))}
      </div>
    </div>
  );
};

export default ResultSection;