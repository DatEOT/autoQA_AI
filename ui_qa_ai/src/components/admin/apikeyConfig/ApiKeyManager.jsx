import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Tabs, Button, Table, Tooltip, Tag, Space, Card, Spin } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import './ApiKeyManager.css';

const { TabPane } = Tabs;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'API-Key': process.env.REACT_APP_API_KEY,
    accept: 'application/json',
  },
});

const ApiKeyManager = () => {
  const [providers, setProviders] = useState([]);
  const [dataByProvider, setDataByProvider] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const fetchAllKeys = useCallback(() => {
    setLoading(true);
    api.get('/apikeys/')
      .then((res) => {
        const groups = {};
        res.data.forEach((row) => {
          if (!groups[row.provider]) groups[row.provider] = [];
          groups[row.provider].push(row);
        });
        setProviders(Object.keys(groups));
        setDataByProvider(groups);
        if (!activeTab && Object.keys(groups).length > 0) {
          setActiveTab(Object.keys(groups)[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching API keys:', err);
        toast.error('Failed to load API keys');
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    fetchAllKeys();
  }, [fetchAllKeys]);

  const rotateKey = async (provider, variant) => {
    const { value: api_key } = await Swal.fire({
      title: `Rotate API Key`,
      html: `<p>For <strong>${provider}/${variant}</strong></p>`,
      input: 'text',
      inputLabel: 'Enter new API key',
      inputPlaceholder: 'sk-xxxxxxxxxxxx',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: (v) => (!v ? 'Key is required' : undefined),
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (!api_key) return;

    try {
      await api.put(`/apikeys/${provider}/${variant}`, { api_key });
      toast.success('Key rotated successfully!');
      fetchAllKeys();
    } catch (e) {
      console.error(e);
      toast.error('Failed to rotate key');
    }
  };

  const showKey = async (provider, variant) => {
    try {
      const res = await api.get(`/apikeys/${provider}/${variant}?raw=true`);
      Swal.fire({
        title: `${provider} / ${variant}`,
        html: `<div class="api-key-display"><code>${res.data.api_key}</code></div>`,
        confirmButtonText: 'Close',
        customClass: {
          popup: 'swal-wide'
        }
      });
    } catch (e) {
      toast.error('Failed to fetch key');
    }
  };

  const columns = (prov) => [
    {
      title: 'Model Variant',
      dataIndex: 'model_variant',
      key: 'model',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'upd',
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'desc',
      render: (d) => d || <span className="text-muted">No description</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View API Key">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              className="action-btn view-btn"
              onClick={() => showKey(prov, record.model_variant)}
            />
          </Tooltip>
          <Tooltip title="Rotate API Key">
            <Button
              icon={<ReloadOutlined />}
              shape="circle"
              className="action-btn rotate-btn"
              onClick={() => rotateKey(prov, record.model_variant)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="api-key-manager-container">
      <Card
        className="api-key-card"
      >
        {loading && providers.length === 0 ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            animated
            className="api-key-tabs"
          >
            {providers.map((prov) => (
              <TabPane
                tab={
                  <span className="provider-tab">
                    {prov.toUpperCase()}
                    <Tag className="count-tag">{dataByProvider[prov]?.length || 0}</Tag>
                  </span>
                }
                key={prov}
              >
                <Table
                  rowKey="model_variant"
                  loading={loading}
                  columns={columns(prov)}
                  dataSource={dataByProvider[prov]}
                  pagination={false}
                  className="api-key-table"
                  bordered
                  size="middle"
                />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default ApiKeyManager;