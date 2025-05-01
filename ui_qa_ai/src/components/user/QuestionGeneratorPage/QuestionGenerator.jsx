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
      [level]: Math.max(0, Number(value) || 0),
    }));
  };

  const labels = [
    { key: 'level_1', text: 'Cấp độ 1 (Nhớ)' },
    { key: 'level_2', text: 'Cấp độ 2 (Hiểu)' },
    { key: 'level_3', text: 'Cấp độ 3 (Áp dụng)' },
    { key: 'level_4', text: 'Cấp độ 4 (Phân tích)' },
    { key: 'level_5', text: 'Cấp độ 5 (Đánh giá)' },
    { key: 'level_6', text: 'Cấp độ 6 (Sáng tạo)' },
  ];

  return (
    <div className="bloom-levels">
      <div className="bloom-grid">
        {labels.map(({ key, text }) => (
          <div className="bloom-item" key={key}>
            <label>{text}</label>
            <input
              type="number"
              value={levels[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              min="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const GenerateButton = ({ onClick, loading }) => {
  return (
    <button className="generate-main-btn" onClick={onClick} disabled={loading}>
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin" /> Đang tạo...
        </>
      ) : (
        <>
          <i className="fas fa-question-circle" /> Tạo Câu Hỏi
        </>
      )}
    </button>
  );
};

// Component DownloadSection: hiển thị thông tin file và các nút tải file Word về
const DownloadSection = ({ results }) => {
  if (!results) {
    return (
      <div className="result-section">
        <h2>Tải xuống File Word</h2>
        <p>Chưa có dữ liệu.</p>
      </div>
    );
  }

  const zipUrl = `${process.env.REACT_APP_API_URL}/questions/download/zip/${results.file_id}`;
  return (
    <div className="result-section">
      <h2>Tải xuống File Word (ZIP)</h2>
      <p>
        <strong>File ID:</strong> {results.file_id}
      </p>
      <p>
        <strong>Tên file gốc:</strong> {results.original_filename}
      </p>
      <p>
        <strong>Số đoạn:</strong> {results.num_segments}
      </p>
      <div className="download-buttons">
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size="large"
        href={zipUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tải file ZIP
      </Button>
      </div>
    </div>
  );
};

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

const UploadSection = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="upload-section">
      <button onClick={handleSelectFile}>
        <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
        Chọn File
      </button>
      {selectedFile && (
        <p className="selected-file">
          <i className="fas fa-file-alt" style={{ marginRight: '8px', color: '#3498db' }}></i>
          {selectedFile.name}
        </p>
      )}
      <input
        type="file"
        id="docxFile"
        accept=".docx,.pdf,.txt"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

// Component nhập thông tin môn thi và thời gian thi
const ExamDetails = ({ examSubject, setExamSubject, examDuration, setExamDuration }) => {
  return (
    <div className="exam-details">
      <div className="exam-input">
        <label htmlFor="examSubject">Tên Môn Thi:</label>
        <input
          type="text"
          id="examSubject"
          value={examSubject}
          onChange={(e) => setExamSubject(e.target.value)}
        />
      </div>
      <div className="exam-input">
        <label htmlFor="examDuration">Thời Gian Thi:</label>
        <input
          type="text"
          id="examDuration"
          value={examDuration}
          onChange={(e) => setExamDuration(e.target.value)}
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
      toast.error('Vui lòng chọn file trước khi tạo câu hỏi.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (bloomSum !== totalQuestions) {
      toast.error(
        `Tổng số câu hỏi Bloom (${bloomSum}) không khớp với số lượng câu hỏi yêu cầu (${totalQuestions}).`,
        { position: 'top-right', autoClose: 3000 }
      );
      return;
    }

    if (!examSubject || !examDuration) {
      toast.error('Vui lòng nhập đầy đủ thông tin môn thi và thời gian thi.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (!provider || !modelVariant) {
      toast.error('Vui lòng chọn provider & model_variant.', {
        position: 'top-right',
        autoClose: 3000,
      });
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

    // Lấy giá trị các input của BloomLevels thông qua DOM
    const bloomLevels = document.querySelectorAll('.bloom-levels input');
    formData.append('level_1', bloomLevels[0]?.value || 0);
    formData.append('level_2', bloomLevels[1]?.value || 0);
    formData.append('level_3', bloomLevels[2]?.value || 0);
    formData.append('level_4', bloomLevels[3]?.value || 0);
    formData.append('level_5', bloomLevels[4]?.value || 0);
    formData.append('level_6', bloomLevels[5]?.value || 0);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/questions/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'API-Key': process.env.REACT_APP_API_KEY,
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setResults(response.data);
      toast.success('Tạo câu hỏi thành công!', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      let errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Đã xảy ra lỗi khi tạo câu hỏi.';
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
      <h1>Tạo Câu Hỏi Tự Luận từ File DOCX, PDF, TXT</h1>
      <ApiKeySelector
        provider={provider}
        setProvider={setProvider}
        modelVariant={modelVariant}
        setModelVariant={setModelVariant}
      />
      
      {/* Phần nhập thông tin môn thi và thời gian thi */}
      <ExamDetails
        examSubject={examSubject}
        setExamSubject={setExamSubject}
        examDuration={examDuration}
        setExamDuration={setExamDuration}
      />

      <UploadSection onFileSelect={setFile} />
      <TotalQuestions totalQuestions={totalQuestions} setTotalQuestions={setTotalQuestions} />
      <div className="bloom-section">
        <h3>Cấp độ Bloom</h3>
        <BloomLevels totalQuestions={totalQuestions} onSumChange={setBloomSum} />
        <p className="bloom-sum">
        Tổng số câu hỏi đã chọn: {bloomSum} / {totalQuestions}
      </p>
      </div>
      
      <div className="generate-button">
        <GenerateButton onClick={handleGenerateQuestions} loading={loading} />
      </div>
      {results && <DownloadSection results={results} />}
    </div>
  );
};

export default QuestionGenerator;
