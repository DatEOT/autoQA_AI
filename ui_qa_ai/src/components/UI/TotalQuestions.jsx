import React from 'react';

const TotalQuestions = ({ totalQuestions, setTotalQuestions }) => {
  return (
    <div className="total-questions">
      <label htmlFor="totalQuestions">Tổng số câu hỏi:</label>
      <input
        type="number"
        id="totalQuestions"
        min="0"
        value={totalQuestions}
        onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10) || 0)}
      />
    </div>
  );
};

export default TotalQuestions;