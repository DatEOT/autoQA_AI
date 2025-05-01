import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Form, Input, Button, Upload, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Config = () => {
  const [websiteForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [socialMediaForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null); 
  const [logoFile, setLogoFile] = useState(null);
  const [mapUrl, setMapUrl] = useState("");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/config";
  const fetchConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/getAll/`, {
        headers: {
          "API-Key": process.env.REACT_APP_API_KEY,
          accept: "application/json",
        },
      });

      const firstRow = data.find((item) => item.idConfig === 1);

      if (!firstRow) throw new Error("Không tìm thấy cấu hình với idConfig = 1");

      setConfigData(firstRow);
    } catch (err) { 
      toast.error(
        err.response?.data?.detail || "Failed to fetch configuration"
      );
    }
  }, [API_BASE_URL]);

  const getImageMimeType = (base64) => {
    if (base64.startsWith("/9j/")) return "image/jpeg"; // JPEG
    if (base64.startsWith("iVBORw0KG")) return "image/png"; // PNG
    if (base64.startsWith("UklGR")) return "image/webp"; // WebP
    return "image/*";
  };

  useEffect(() => {
    if (!configData) return;

    websiteForm.setFieldsValue({
      websiteName: configData.websiteName,
      websiteDescription: configData.websiteDescription,
      websiteKeywords: configData.websiteKeywords,
    });
  
    contactForm.setFieldsValue({
      phoneNumber1: configData.phoneNumber1,
      phoneNumber2: configData.phoneNumber2,
      address: configData.address,
    });
    if (configData.address) {
      const encodedAddress = encodeURIComponent(configData.address);
      setMapUrl(`https://www.google.com/maps?q=${encodedAddress}&output=embed`);
    } else {
      setMapUrl("");
    }
  
    socialMediaForm.setFieldsValue({
      tiktok: configData.tiktok,
      facebook: configData.facebook,
      zalo: configData.zalo,
    });

     // logo base64 từ DB
      if (configData.logo) {
        const mime = getImageMimeType(configData.logo);
        setLogoPreview(`data:${mime};base64,${configData.logo}`);
      } else {
        setLogoPreview(null); 
      }
      
  }, [configData, websiteForm, contactForm, socialMediaForm]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleLogoUpload = ({ fileList }) => {
    const pickedFile = fileList?.[0]?.originFileObj;
    if (!pickedFile || !(pickedFile instanceof Blob)) {
      toast.error("File không hợp lệ");
      return;
    }
  
    setLogoFile(pickedFile);
    setLogoPreview(URL.createObjectURL(pickedFile));
  };
  

  const handleSubmit = async (values, endpoint, form) => {
    setLoading(true);
    try {
      let payload = values;
      let headers = {
        "API-Key": process.env.REACT_APP_API_KEY,
      };

      // special handling for website -> may include logo binary
      if (endpoint === "website") {
        payload = new FormData();
        payload.append("websiteName", values.websiteName || "");
        payload.append("websiteDescription", values.websiteDescription || "");
        payload.append("websiteKeywords", values.websiteKeywords || "");
      
        if (logoFile) {
          payload.append("logo", logoFile);
        }
      
        headers["Content-Type"] = "multipart/form-data";
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/${endpoint}/1`,
        payload,
        {
          headers,
        }
      );

      toast.success(data.message || "Cập nhật thành công", {
        autoClose: 2500,
      });

      // Clean‑up & refresh
      form.resetFields();
      setLogoFile(null);
      setLogoPreview(null);
      fetchConfig();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const websiteTab = (
    <Form
      form={websiteForm}
      layout="vertical"
      onFinish={(vals) => handleSubmit(vals, "website", websiteForm)}
      className="mt-4"
    >
      <Form.Item name="websiteName" label="Website Name">
        <Input placeholder="Enter website name" />
      </Form.Item>

      <Form.Item name="websiteDescription" label="Website Description">
        <Input.TextArea placeholder="Enter website description" />
      </Form.Item>

      <Form.Item name="websiteKeywords" label="Website Keywords">
        <Input placeholder="Enter keywords (comma‑separated)" />
      </Form.Item>
      <Form.Item label="Logo">
      <Upload
        beforeUpload={() => false}
        maxCount={1}
        accept="image/*"
        onChange={handleLogoUpload}
        listType="picture"
      >
        <Button icon={<UploadOutlined />}>Chọn logo</Button>
      </Upload>

        {logoPreview && (
          <Image
            src={logoPreview}
            alt="Logo preview"
            height={80}
            preview={false}
            className="mt-2 rounded-2xl shadow"
          />
        )}
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-blue-500"
        >
          Update Website
        </Button>
      </Form.Item>
    </Form>
  );

  const contactTab = (
    <Form
      form={contactForm}
      layout="vertical"
      onFinish={(vals) => handleSubmit(vals, "contact", contactForm)}
      onValuesChange={(changed, all) => {
        if (changed.address) {
          const encoded = encodeURIComponent(changed.address);
          setMapUrl(`https://www.google.com/maps?q=${encoded}&output=embed`);
        }
      }}
      className="mt-4"
    >
      <Form.Item name="phoneNumber1" label="Phone Number 1">
        <Input placeholder="Enter primary phone number" />
      </Form.Item>
      <Form.Item name="phoneNumber2" label="Phone Number 2">
        <Input placeholder="Enter secondary phone number" />
      </Form.Item>
      <Form.Item name="address" label="Address">
        <Input.TextArea placeholder="Enter address" />
      </Form.Item>
      {mapUrl && (
      <div className="mt-4">
        <h4 className="mb-2 font-medium text-gray-600">Google Map</h4>
        <iframe
          title="Google Map"
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg shadow"
        ></iframe>
      </div>
    )}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-blue-500"
        >
          Update Contact
        </Button>
      </Form.Item>
    </Form>
  );

  const socialMediaTab = (
    <Form
      form={socialMediaForm}
      layout="vertical"
      onFinish={(vals) => handleSubmit(vals, "social-media", socialMediaForm)}
      className="mt-4"
    >
      <Form.Item name="tiktok" label="TikTok URL">
        <Input placeholder="Enter TikTok URL" />
      </Form.Item>
      <Form.Item name="facebook" label="Facebook URL">
        <Input placeholder="Enter Facebook URL" />
      </Form.Item>
      <Form.Item name="zalo" label="Zalo URL">
        <Input placeholder="Enter Zalo URL" />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-blue-500"
        >
          Update Social Media
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    { label: "Website", key: "1", children: websiteTab, forceRender: true },
    { label: "Contact", key: "2", children: contactTab, forceRender: true },
    { label: "Social Media", key: "3", children: socialMediaTab, forceRender: true },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* toast container */}
      <ToastContainer position="top-right" newestOnTop theme="colored" />
      <Tabs defaultActiveKey="1" type="card" items={tabItems} />
    </div>
  );
};

export default Config;
