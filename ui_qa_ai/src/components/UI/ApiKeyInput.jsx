import React from 'react';
import './styleui/ApiKeyInput.css'
const ApiKeyInput = ({ apiKey, setApiKey }) => {
  return (
    <div className="api-key-section">
      <label htmlFor="apiKey">API Key:</label>
      <input
        type="text"
        id="apiKey"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Nhập API Key"
      />
    </div>
  );
};

export default ApiKeyInput;