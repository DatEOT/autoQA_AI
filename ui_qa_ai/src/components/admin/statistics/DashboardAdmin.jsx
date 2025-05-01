import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Tabs,
  Table,
  DatePicker,
} from 'antd';
import axios from 'axios';
import { FileTextOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import '@ant-design/v5-patch-for-react-19';

const { RangePicker } = DatePicker;
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const Dashboard = () => {
  const [statsToShow, setStatsToShow] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [range, setRange] = useState([null, null]);
  const [rangeStats, setRangeStats] = useState({ creation: 0, questions: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("top-users");
  const [balanceData, setBalanceData] = useState({
    total_added: 0,
    total_subtracted: 0,
    net_change: 0,
  });

  const tokenToVND = (tokens) => Math.round((tokens * 125000) / 300);

  useEffect(() => {
    fetchDefaultStats();
    fetchTopUsers();
  }, []);
  const fetchTopUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/QuestionStats/getAllUserStats`,
        {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        }
      );
      const sorted = res.data
        .sort((a, b) => b.create_count - a.create_count)
        .slice(0, 10);
      setTopUsers(sorted);
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  };

  const fetchDefaultStats = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      setLoading(true);
      const globalStatsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/QuestionStats/getGlobalStats?year=${year}`,
        {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        }
      );
      const questionStats = globalStatsRes.data.question_stats;
      setStatsToShow({
        day: questionStats.day,
        month: questionStats.month,
        year: questionStats.year,
        total: questionStats.total,
      });

      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
      const today = dayjs().format('YYYY-MM-DD');
      const rangeStatsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/QuestionStats/getStatsInRange?start=${startOfMonth}&end=${today}`,
        {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        }
      );
      setRangeStats({
        creation: rangeStatsRes.data.creation_stats.total,
        questions: rangeStatsRes.data.question_stats.total,
      });
    } catch (error) {
      console.error("Error fetching default stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        let url = `${process.env.REACT_APP_API_URL}/QuestionStats/getBalanceBreakdown`;
    
        const isValidRange =
          Array.isArray(range) &&
          range[0] &&
          range[1] &&
          dayjs.isDayjs(range[0]) &&
          dayjs.isDayjs(range[1]);
    
        if (isValidRange) {
          const start = range[0].format("YYYY-MM-DD");
          const end = range[1].format("YYYY-MM-DD");
          url += `?start=${start}&end=${end}`;
        }
    
        const res = await axios.get(url, {
          headers: { "API-Key": process.env.REACT_APP_API_KEY },
        });
    
        const data = res.data ?? {};
    
        setBalanceData({
          total_added: Number(data.total_added ?? 0),
          total_subtracted: Number(data.total_subtracted ?? 0),
          net_change: Number(data.net_change ?? 0),
        });
      } catch (error) {
        console.error("Error fetching balance breakdown:", error);
        if (error.response) {
          console.error("➡ Response:", error.response.data);
        }
      }
    };    
    

    if (activeTab === 'balance') {
      fetchBalanceData();
    }
  }, [activeTab, range]);

  const fetchStatsInRange = async (val) => {
    if (!val || !val[0] || !val[1]) return;
  
    if (loading) return;
    setLoading(true);
  
    try {
      const start = dayjs(val[0]).format("YYYY-MM-DD");
      const end = dayjs(val[1]).format("YYYY-MM-DD");
  
      const [statsRes, usersRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/QuestionStats/getStatsInRange?start=${start}&end=${end}`,
          { headers: { "API-Key": process.env.REACT_APP_API_KEY } }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/QuestionStats/getUserStatsInRange?start=${start}&end=${end}`,
          { headers: { "API-Key": process.env.REACT_APP_API_KEY } }
        ),
      ]);
  
      const stats = statsRes.data;
      const sortedUsers = usersRes.data
        .sort((a, b) => b.create_count - a.create_count)
        .slice(0, 10);
  
      setRangeStats({
        creation: stats.creation_stats.total,
        questions: stats.question_stats.total,
      });
  
      setStatsToShow((prev) => ({
        ...prev,
        month: stats.question_stats.total,
        year: stats.question_stats.total,
      }));
  
      setTopUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching stats or top users in range:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const chartData = {
    labels: ['Created Times', 'Number of Questions'],
    datasets: [
      {
        label: 'Statistics',
        data: [rangeStats.creation, rangeStats.questions],
        backgroundColor: 'rgba(24, 144, 255, 0.6)',
        borderColor: 'rgba(24, 144, 255, 1)',
        borderWidth: 1,
        borderRadius: 10,
        hoverBackgroundColor: 'rgba(24, 144, 255, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ẩn legend nếu không cần
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Ẩn lưới trục X
        },
      },
      y: {
        grid: {
          borderDash: [3, 3], // Đường lưới nét đứt
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const userColumns = [
    { title: 'ID User', dataIndex: 'idUser', key: 'idUser' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Number of creations', dataIndex: 'create_count', key: 'create_count' },
    { title: 'Total number of questions', dataIndex: 'total_questions', key: 'total_questions' },
  ];

  const cardStyle = {
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    background: '#fff',
    textAlign: 'center',
  };

  return (
    <div style={{ padding: '24px 24px 40px 24px', fontFamily: 'Segoe UI, sans-serif' }}>

      <Row gutter={[24, 24]}>
        <AnimatePresence>
          {activeTab === 'balance' ? (
            [
              {
                title: 'Tổng nạp (VND)',
                value: tokenToVND(balanceData.total_added),
                color: '#52c41a',
              },
              {
                title: 'Tổng trừ (VND)',
                value: tokenToVND(Math.abs(balanceData.total_subtracted)),
                color: '#f5222d',
              },
              {
                title: 'Chênh lệch (VND)',
                value: tokenToVND(balanceData.net_change),
                color:
                  balanceData.net_change > 0
                    ? '#52c41a'
                    : balanceData.net_change < 0
                    ? '#f5222d'
                    : '#999',
              },
            ].map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card style={cardStyle}>
                    <Statistic
                      title={item.title}
                      value={item.value.toLocaleString("vi-VN")}
                      suffix="₫"
                      valueStyle={{ color: item.color }}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))
          ) : activeTab === 'top-users' ? (
            topUsers.slice(0, 4).map((user, index) => (
              <Col xs={24} sm={12} md={6} key={user.idUser}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card style={cardStyle}>
                    <Statistic
                      title={`User ID: ${user.idUser}`}
                      value={user.create_count}
                      suffix="times"
                      prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                    />
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                      Top {index + 1} User
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))
          ) : (
            statsToShow && [
              { title: "Questions Today", value: statsToShow.day },
              { title: "This Month", value: statsToShow.month },
              { title: "This Year", value: statsToShow.year },
              { title: "Total", value: statsToShow.total },
            ].map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card style={cardStyle}>
                    <Statistic
                      title={item.title}
                      value={item.value}
                      prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))
          )}
        </AnimatePresence>
      </Row>

      {activeTab === 'balance' && (
        <div style={{ textAlign: 'right', fontStyle: 'italic', color: '#888', marginTop: 8 }}>
          {Array.isArray(range) && range[0] && range[1]
            ? `Từ ${dayjs(range[0]).format('DD/MM/YYYY')} đến ${dayjs(range[1]).format('DD/MM/YYYY')}`
            : ''}
        </div>
      )}

      <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <RangePicker
            format="YYYY-MM-DD"
            value={range}
            onChange={(val) => {
              setRange(val);

              // Nếu người dùng xóa ngày đã chọn
              if (!val || !val[0] || !val[1]) {
                fetchDefaultStats();
                fetchTopUsers();
                return;
              }

              // Nếu chọn đủ 2 ngày, gọi fetch theo khoảng
              fetchStatsInRange(val);
            }}
            showTime={false}
            allowClear // Cho phép xóa ngày
            panelRender={(panelNode) => <div style={{ maxWidth: 280 }}>{panelNode}</div>}
          />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: 'top-users',
            label: '👥 Top Users',
            children: (
              <Card style={cardStyle}>
                <Table
                  dataSource={topUsers}
                  columns={userColumns}
                  rowKey="idUser"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: 'chart',
            label: '📈 Question Chart',
            children: (
              <Card style={cardStyle}>
                <div style={{ height: 300 }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </Card>
            ),
          },
          
          {
            key: 'balance',
            label: '💰 Balance',
            children: (
              <Card style={cardStyle}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Total Added"
                      value={balanceData.total_added}
                      precision={0}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Total Subtracted"
                      value={Math.abs(balanceData.total_subtracted)}
                      precision={0}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Net Change"
                      value={balanceData.net_change}
                      precision={0}
                      valueStyle={{
                        color:
                          balanceData.net_change > 0
                            ? '#52c41a'
                            : balanceData.net_change < 0
                            ? '#f5222d'
                            : '#999',
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            ),
          }
        ]}
      />
    </div>
  );
};

export default Dashboard;
