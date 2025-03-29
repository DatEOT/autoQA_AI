import React, { useRef, useState } from 'react';

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

export default UploadSection;