// src/components/UI/BloomLevels.jsx
import React, { useEffect, useState } from 'react';

const BloomLevels = ({ totalQuestions, onSumChange }) => {
  const [levels, setLevels] = useState({
    level_1: 0,
    level_2: 0,
    level_3: 0,
    level_4: 0,
    level_5: 0,
    level_6: 0,
  });

  useEffect(() => {
    const sum = Object.values(levels).reduce((acc, val) => acc + Number(val), 0);
    onSumChange(sum);
  }, [levels, onSumChange]);

  const handleChange = (level, value) => {
    setLevels((prev) => ({
      ...prev,
      [level]: Math.max(0, Number(value) || 0),
    }));
  };

  return (
    <div className="bloom-levels">
      <div>
        <label>Cấp độ 1 (Nhớ):</label>
        <input
          type="number"
          value={levels.level_1}
          onChange={(e) => handleChange('level_1', e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Cấp độ 2 (Hiểu):</label>
        <input
          type="number"
          value={levels.level_2}
          onChange={(e) => handleChange('level_2', e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Cấp độ 3 (Áp dụng):</label>
        <input
          type="number"
          value={levels.level_3}
          onChange={(e) => handleChange('level_3', e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Cấp độ 4 (Phân tích):</label>
        <input
          type="number"
          value={levels.level_4}
          onChange={(e) => handleChange('level_4', e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Cấp độ 5 (Đánh giá):</label>
        <input
          type="number"
          value={levels.level_5}
          onChange={(e) => handleChange('level_5', e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Cấp độ 6 (Sáng tạo):</label>
        <input
          type="number"
          value={levels.level_6}
          onChange={(e) => handleChange('level_6', e.target.value)}
          min="0"
        />
      </div>
    </div>
  );
};

export default BloomLevels;