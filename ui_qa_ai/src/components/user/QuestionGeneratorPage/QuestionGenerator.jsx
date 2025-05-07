import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QuestionGenerator.css';
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ApiKeySelector from './ApiKeySelector';

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
    setLevels(prev => ({
      ...prev,
      [level]: Math.max(0, Math.min(totalQuestions, Number(value) || 0)),
    }));
  };

  const labels = [
    { key: 'level_1', text: 'Cấp độ 1 (Nhớ)', color: '#3498db' },
    { key: 'level_2', text: 'Cấp độ 2 (Hiểu)', color: '#2ecc71' },
    { key: 'level_3', text: 'Cấp độ 3 (Áp dụng)', color: '#f39c12' },
    { key: 'level_4', text: 'Cấp độ 4 (Phân tích)', color: '#e74c3c' },
    { key: 'level_5', text: 'Cấp độ 5 (Đánh giá)', color: '#9b59b6' },
    { key: 'level_6', text: 'Cấp độ 6 (Sáng tạo)', color: '#1abc9c' },
  ];

  return (
    <div className="bloom-levels-container">
      <div className="bloom-grid">
        {labels.map(({ key, text, color }) => (
          <div className="bloom-card" key={key} style={{ borderTop: `4px solid ${color}` }}>
            <label>{text}</label>
            <input
              type="number"
              value={levels[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              min="0"
              max={totalQuestions}
              className="bloom-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const GenerateButton = ({ onClick, loading, disabled }) => {
  return (
    <button 
      className={`generate-btn ${loading ? 'loading' : ''}`} 
      onClick={onClick} 
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Đang tạo...
        </>
      ) : (
        <>
          Tạo Câu Hỏi
        </>
      )}
    </button>
  );
};

const DownloadSection = ({ results }) => {
  if (!results) return null;

  const zipUrl = `${process.env.REACT_APP_API_URL}/questions/download/zip/${results.file_id}`;
  return (
    <div className="download-section">
      <h2>Tải xuống File Word (ZIP)</h2>
      <div className="file-info">
        <div className="info-item">
          <span className="label">File ID:</span>
          <span className="value">{results.file_id}</span>
        </div>
        <div className="info-item">
          <span className="label">Tên file:</span>
          <span className="value">{results.original_filename}</span>
        </div>
        <div className="info-item">
          <span className="label">Số đoạn:</span>
          <span className="value">{results.num_segments}</span>
        </div>
      </div>
      <div className="download-btn-container">
        <Button
          type="primary"
          shape="round"
          icon={<DownloadOutlined />}
          size="large"
          href={zipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn"
        >
          Tải file ZIP
        </Button>
      </div>
    </div>
  );
};

const TotalQuestions = ({ totalQuestions, setTotalQuestions }) => {
  return (
    <div className="total-questions-container">
      <label>Tổng số câu hỏi:</label>
      <input
        type="number"
        value={totalQuestions}
        onChange={(e) => setTotalQuestions(Math.max(0, parseInt(e.target.value, 10) || 0))}
        min="0"
        className="total-input"
      />
    </div>
  );
};

const UploadSection = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectFile = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="upload-container">
      <button className="file-select-btn" onClick={handleSelectFile}>
        <span className="upload-icon">↑</span>
        Chọn File
      </button>
      <input
        type="file"
        accept=".docx,.pdf,.txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />
      {selectedFile && (
        <div className="file-preview">
          <span className="file-icon">📄</span>
          <span className="file-name">{selectedFile.name}</span>
        </div>
      )}
    </div>
  );
};

const ExamDetails = ({ examSubject, setExamSubject, examDuration, setExamDuration }) => {
  return (
    <div className="exam-details-container">
      <div className="exam-input-group">
        <label>Tên Môn Thi:</label>
        <input
          type="text"
          value={examSubject}
          onChange={(e) => setExamSubject(e.target.value)}
          placeholder="Nhập tên môn học"
        />
      </div>
      <div className="exam-input-group">
        <label>Thời Gian Thi:</label>
        <input
          type="text"
          value={examDuration}
          onChange={(e) => setExamDuration(e.target.value)}
          placeholder="VD: 60 phút"
        />
      </div>
    </div>
  );
};

const QuestionGenerator = () => {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bloomSum, setBloomSum] = useState(0);
  const [examSubject, setExamSubject] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [provider, setProvider] = useState('');
  const [modelVariant, setModelVariant] = useState('');

  const handleGenerateQuestions = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file trước khi tạo câu hỏi.', { position: 'top-right' });
      return;
    }

    if (bloomSum !== totalQuestions) {
      toast.error(`Tổng số câu hỏi Bloom (${bloomSum}) không khớp với yêu cầu (${totalQuestions}).`, { 
        position: 'top-right' 
      });
      return;
    }

    if (!examSubject || !examDuration) {
      toast.error('Vui lòng nhập đầy đủ thông tin môn thi và thời gian thi.', { position: 'top-right' });
      return;
    }

    if (!provider || !modelVariant) {
      toast.error('Vui lòng chọn provider & model_variant.', { position: 'top-right' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('exam_subject', examSubject);
    formData.append('exam_duration', examDuration);
    formData.append('num_questions', totalQuestions);
    formData.append('provider', provider);
    formData.append('model_variant', modelVariant);

    // Add Bloom levels
    Object.keys({
      level_1: 0, level_2: 0, level_3: 0, 
      level_4: 0, level_5: 0, level_6: 0
    }).forEach((key, index) => {
      const input = document.querySelectorAll('.bloom-input')[index];
      formData.append(key, input?.value || 0);
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/questions/generate`, 
        formData,
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setResults(response.data);
      toast.success('Tạo câu hỏi thành công!', { position: 'top-right' });
    } catch (err) {
      let errorMessage = err.response?.data?.detail || err.message || 'Đã xảy ra lỗi khi tạo câu hỏi.';
      const levelsNotSupported = [...errorMessage.matchAll(/Cấp độ (\d+)/g)]
        .map(match => parseInt(match[1]));
      
      if (levelsNotSupported.length) {
        errorMessage = `Không thể tạo cấp độ ${levelsNotSupported.join(', ')} do văn bản quá ít.`;
      }

      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-generator-container">
      <header className="generator-header">
        <h1>Tạo Câu Hỏi Tự Luận từ File DOCX, PDF, TXT</h1>
      </header>

      <div className="generator-content">
        <ApiKeySelector
          provider={provider}
          setProvider={setProvider}
          modelVariant={modelVariant}
          setModelVariant={setModelVariant}
        />
        
        <ExamDetails
          examSubject={examSubject}
          setExamSubject={setExamSubject}
          examDuration={examDuration}
          setExamDuration={setExamDuration}
        />

        <UploadSection onFileSelect={setFile} />
        <TotalQuestions 
          totalQuestions={totalQuestions} 
          setTotalQuestions={setTotalQuestions} 
        />

        <div className="bloom-section">
          <h3>Cấp độ Bloom</h3>
          <BloomLevels 
            totalQuestions={totalQuestions} 
            onSumChange={setBloomSum} 
          />
          <div className="bloom-summary">
            Tổng số câu hỏi đã chọn: <strong>{bloomSum}</strong> / {totalQuestions}
          </div>
        </div>
        
        <div className="action-section">
          <GenerateButton 
            onClick={handleGenerateQuestions} 
            loading={loading}
            disabled={bloomSum !== totalQuestions}
          />
        </div>

        {results && <DownloadSection results={results} />}
      </div>
    </div>
  );
};

export default QuestionGenerator;