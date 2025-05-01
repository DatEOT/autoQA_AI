import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select } from 'antd';
const { Option } = Select;


const ApiKeySelector = ({ provider, setProvider, modelVariant, setModelVariant }) => {
  const [providers, setProviders] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loadingPvd, setLoadingPvd] = useState(false);
  const [loadingVar, setLoadingVar] = useState(false);

  // --- Lấy danh sách providers ---
  useEffect(() => {
    (async () => {
      setLoadingPvd(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/apikeys/`,
          {
            headers: {
              'API-Key': process.env.REACT_APP_API_KEY,
            },
          }
        );
        setProviders([...new Set(data.map((row) => row.provider))]);
      } catch (err) {
        console.error('Lỗi lấy providers', err);
      } finally {
        setLoadingPvd(false);
      }
    })();
  }, []);

  // --- Khi provider thay đổi -> load variants ---
  useEffect(() => {
    if (!provider) {
      setVariants([]);
      setModelVariant('');
      return;
    }
    (async () => {
      setLoadingVar(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/apikeys/${provider}/Listvariants`,
          {
            headers: {
              'API-Key': process.env.REACT_APP_API_KEY,
            },
          }
        );
        setVariants(data);
      } catch (err) {
        console.error('Lỗi lấy variants', err);
      } finally {
        setLoadingVar(false);
      }
    })();
  }, [provider, setModelVariant]);

  return (
    <div className="api-key-selector" style={{ marginBottom: 24 }}>
      <label>Provider:</label>
      <Select
        className="api-select"
        style={{ width: '100%' }}
        placeholder="Chọn provider"
        value={provider || undefined}
        onChange={(val) => setProvider(val)}
        loading={loadingPvd}
        allowClear
      >
        {providers.map((p) => (
          <Option key={p} value={p}>
            {p}
          </Option>
        ))}
      </Select>

      <label style={{ marginTop: 12 }}>Model variant:</label>
      <Select
        className="api-select"
        style={{ width: '100%' }}
        placeholder="Chọn model_variant"
        value={modelVariant || undefined}
        onChange={(val) => setModelVariant(val)}
        loading={loadingVar}
        disabled={!provider}
        allowClear
      >
        {variants.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default ApiKeySelector;