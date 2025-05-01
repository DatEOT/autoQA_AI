 import React, { useEffect, useState, useCallback } from 'react';
 import axios from 'axios';
 import { Tabs, Button, Table, Tooltip } from 'antd';
 import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
 import { toast } from 'react-toastify';
 import Swal from 'sweetalert2';
 import 'react-toastify/dist/ReactToastify.css';
//  import './ApiKeyManager.css';
 
 const { TabPane } = Tabs;
 
 /* ---------- axios instance with global header ---------- */
 const api = axios.create({
   baseURL: process.env.REACT_APP_API_URL,
   headers: {
     'API-Key': process.env.REACT_APP_API_KEY,
     accept: 'application/json',
   },
 });
 
 const ApiKeyManager = () => {
   /* ---------------- state ---------------- */
   const [providers, setProviders] = useState([]);          // ['openai', 'gemini', ...]
   const [dataByProvider, setDataByProvider] = useState({}); // {provider:[rows]}
   const [loading, setLoading]   = useState(false);
 
   /* ---------------- helpers ---------------- */
   const fetchAllKeys = useCallback(() => {
     setLoading(true);
     api.get('/apikeys/')
       .then((res) => {
         // group rows by provider
         const groups = {};
         res.data.forEach((row) => {
           if (!groups[row.provider]) groups[row.provider] = [];
           groups[row.provider].push(row);
         });
         setProviders(Object.keys(groups));
         setDataByProvider(groups);
       })
       .catch((err) => {
         console.error('Error fetching API keys:', err);
         toast.error('Failed to load API keys');
       })
       .finally(() => setLoading(false));
   }, []);
 
   useEffect(() => {
     fetchAllKeys();
   }, [fetchAllKeys]);
 
   /* rotate key for 1 model */
   const rotateKey = async (provider, variant) => {
     const { value: api_key } = await Swal.fire({
       title: `Rotate key for ${provider} / ${variant}`,
       input: 'text',
       inputLabel: 'Enter new API-key',
       inputPlaceholder: 'sk-xxxxxxxxxxxx',
       showCancelButton: true,
       confirmButtonText: 'Save',
       cancelButtonText: 'Cancel',
       inputValidator: (v) => (!v ? 'Key is required' : undefined),
     });
 
     if (!api_key) return;          // cancel
 
     try {
       await api.put(`/apikeys/${provider}/${variant}`, { api_key });
       toast.success('Key rotated!');
       fetchAllKeys();
     } catch (e) {
       console.error(e);
       toast.error('Rotate failed');
     }
   };
 
   /* reveal plaintext key once (swal) */
   const showKey = async (provider, variant) => {
     try {
       const res = await api.get(`/apikeys/${provider}/${variant}?raw=true`);
       Swal.fire({
         title: `${provider} / ${variant}`,
         html: `<code>${res.data.api_key}</code>`,
         confirmButtonText: 'Close',
       });
     } catch (e) {
       toast.error('Failed to fetch key');
     }
   };
 
   /* ---------------- columns for AntD table ---------------- */
   const columns = (prov) => [
     { title: 'Model', dataIndex: 'model_variant', key: 'model' },
     {
       title: 'Updated',
       dataIndex: 'updated_at',
       key: 'upd',
       render: (t) => new Date(t).toLocaleString(),
     },
     {
       title: 'Description',
       dataIndex: 'description',
       key: 'desc',
       render: (d) => d || '—',
     },
     {
       title: 'Actions',
       key: 'act',
       render: (_, r) => (
         <>
           <Tooltip title="Show key">
             <Button
               icon={<EyeOutlined />}
               shape="circle"
               onClick={() => showKey(prov, r.model_variant)}
             />
           </Tooltip>
           <Tooltip title="Rotate key">
             <Button
               icon={<ReloadOutlined />}
               shape="circle"
               style={{ marginLeft: 8 }}
               onClick={() => rotateKey(prov, r.model_variant)}
             />
           </Tooltip>
         </>
       ),
     },
   ];
 
   /* ---------------- render ---------------- */
   return (
     <div className="apikey-manager">
 
       <Tabs type="card" animated>
         {providers.map((prov) => (
           <TabPane tab={prov.toUpperCase()} key={prov}>
             <Table
               rowKey="model_variant"
               loading={loading}
               columns={columns(prov)}
               dataSource={dataByProvider[prov]}
               pagination={false}
             />
           </TabPane>
         ))}
       </Tabs>
     </div>
   );
 };
 
 export default ApiKeyManager;
 