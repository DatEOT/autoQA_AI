import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UploadSection from './UploadSection';
import TotalQuestions from './TotalQuestions';
import ApiKeyInput from './ApiKeyInput';
import BloomLevels from './BloomLevels';
import GenerateButton from './GenerateButton';
import ResultSection from './ResultSection';
import { useNavigate } from 'react-router-dom';
import './styleui/Dashboard.css';

const Dashboard = () => {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bloomSum, setBloomSum] = useState(0);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/homedashboard')
  };

  const handleGenerateQuestions = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file trước khi tạo câu hỏi.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (!apiKey) {
      toast.error('Vui lòng nhập API Key.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (bloomSum !== totalQuestions) {
      toast.error(`Tổng số câu hỏi Bloom (${bloomSum}) không khớp với số lượng câu hỏi yêu cầu (${totalQuestions}).`, { position: 'top-right', autoClose: 3000 });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('num_questions', totalQuestions);
    const bloomLevels = document.querySelectorAll('.bloom-levels input');
    formData.append('level_1', bloomLevels[0]?.value || 0);
    formData.append('level_2', bloomLevels[1]?.value || 0);
    formData.append('level_3', bloomLevels[2]?.value || 0);
    formData.append('level_4', bloomLevels[3]?.value || 0);
    formData.append('level_5', bloomLevels[4]?.value || 0);
    formData.append('level_6', bloomLevels[5]?.value || 0);

    try {
      const trimmedApiKey = apiKey.trim();
      const response = await axios.post(
        'http://127.0.0.1:8000/questions/generate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'API-Key': trimmedApiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setResults(response.data);
      toast.success('Tạo câu hỏi thành công!', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      let errorMessage = err.response?.data?.detail || err.message || 'Đã xảy ra lỗi khi tạo câu hỏi.';
      const levelsNotSupported = [];
      const levelRegex = /Cấp độ (\d+)/g;
      let match;
      while ((match = levelRegex.exec(errorMessage)) !== null) {
        levelsNotSupported.push(parseInt(match[1]));
      }

      if (levelsNotSupported.length > 0) {
        errorMessage = `Không thể tạo cấp độ ${levelsNotSupported.join(', ')} do văn bản quá ít.`;
      }

      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Đăng xuất
        </button>
      </div>

      <h1>Tạo Câu Hỏi Tự Luận từ File DOCX, PDF, TXT</h1>
      <UploadSection onFileSelect={setFile} />
      <TotalQuestions totalQuestions={totalQuestions} setTotalQuestions={setTotalQuestions} />
      <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
      <h3>Cấp độ Bloom:</h3>
      <BloomLevels totalQuestions={totalQuestions} onSumChange={setBloomSum} />
      <p className="bloom-sum">
        Tổng số câu hỏi đã chọn: {bloomSum} / {totalQuestions}
      </p>
      <div className="generate-button">
        <GenerateButton onClick={handleGenerateQuestions} loading={loading} />
      </div>
      {results && <ResultSection results={results} />}
    </div>
  );
};

export default Dashboard;
