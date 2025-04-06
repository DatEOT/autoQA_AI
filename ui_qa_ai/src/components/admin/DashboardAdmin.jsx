import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Tabs,
  Table,
  Typography,
  DatePicker,
  Button,
} from 'antd';
import axios from 'axios';
import { FileTextOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import dayjs from 'dayjs';
import '@ant-design/v5-patch-for-react-19';
const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [defaultStats, setDefaultStats] = useState({
    creation_stats: { day: 0, month: 0, year: 0, total: 0 },
    question_stats: { day: 0, month: 0, year: 0, total: 0 },
  });
  const [statsToShow, setStatsToShow] = useState({
    day: 0,
    month: 0,
    year: 0,
    total: 0,
  });
  const [topUsers, setTopUsers] = useState([]);
  const [range, setRange] = useState([null, null]);
  const [rangeStats, setRangeStats] = useState({ creation: 0, questions: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();

    const fetchDefaultStats = async () => {
      try {
        setLoading(true);
        const globalStatsRes = await axios.get(
          `http://127.0.0.1:8000/QuestionStats/getGlobalStats?year=${year}`,
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        );
        const questionStats = globalStatsRes.data.question_stats;
        setDefaultStats(globalStatsRes.data);
        setStatsToShow({
          day: questionStats.day,
          month: questionStats.month,
          year: questionStats.year,
          total: questionStats.total,
        });

        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        const rangeStatsRes = await axios.get(
          `http://127.0.0.1:8000/QuestionStats/getStatsInRange?start=${startOfMonth}&end=${today}`,
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

    const fetchTopUsers = async () => {
      try {
        const res = await axios.get(
          'http://127.0.0.1:8000/QuestionStats/getAllUserStats',
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        );
        const sorted = res.data
          .sort((a, b) => b.total_questions - a.total_questions)
          .slice(0, 10);
        setTopUsers(sorted);
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    };

    fetchDefaultStats();
    fetchTopUsers();
  }, []);

  const fetchStatsInRange = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (range[0] && range[1]) {
        const start = dayjs(range[0]).format('YYYY-MM-DD');
        const end = dayjs(range[1]).format('YYYY-MM-DD');

        const res = await axios.get(
          `http://127.0.0.1:8000/QuestionStats/getStatsInRange?start=${start}&end=${end}`,
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        );

        const newStats = {
          month: res.data.question_stats.total,
          year: res.data.question_stats.total,
        };

        setRangeStats({
          creation: res.data.creation_stats.total,
          questions: res.data.question_stats.total,
        });

        setStatsToShow((prev) =>
          prev.month === newStats.month && prev.year === newStats.year
            ? prev
            : { ...prev, ...newStats }
        );
      } else {
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        const res = await axios.get(
          `http://127.0.0.1:8000/QuestionStats/getStatsInRange?start=${startOfMonth}&end=${today}`,
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        );
        setRangeStats({
          creation: res.data.creation_stats.total,
          questions: res.data.question_stats.total,
        });

        setStatsToShow((prev) => ({
          ...prev,
          month: defaultStats.question_stats.month,
          year: defaultStats.question_stats.year,
        }));
      }
    } catch (error) {
      console.error("Error fetching stats in range:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Lần tạo đề', value: rangeStats.creation },
    { name: 'Số câu hỏi', value: rangeStats.questions },
  ];

  const userColumns = [
    { title: 'ID Người dùng', dataIndex: 'idUser', key: 'idUser' },
    { title: 'Số lần tạo', dataIndex: 'create_count', key: 'create_count' },
    { title: 'Tổng số câu hỏi', dataIndex: 'total_questions', key: 'total_questions' },
  ];

  const cardStyle = {
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    background: '#fff',
    textAlign: 'center',
  };

  return (
    <div style={{ padding: '24px 24px 40px 24px', fontFamily: 'Segoe UI, sans-serif' }}>
      <Title level={2} style={{ marginBottom: 24 }}>📊 Thống kê câu hỏi</Title>

      <Row gutter={[24, 24]}>
        {[
          { title: "Số câu hỏi hôm nay", value: statsToShow.day },
          { title: "Trong tháng", value: statsToShow.month },
          { title: "Trong năm", value: statsToShow.year },
          { title: "Tổng số câu hỏi", value: statsToShow.total },
        ].map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card style={cardStyle}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <RangePicker
          format="YYYY-MM-DD"
          value={range}
          onChange={(val) => setRange(val)}
        />
        <Button
          type="primary"
          onClick={fetchStatsInRange}
          loading={loading}
          disabled={loading}
        >
          Thống kê
        </Button>
      </div>

      <Tabs
        defaultActiveKey="chart"
        items={[
          {
            key: 'chart',
            label: '📈 Biểu đồ số câu hỏi',
            children: (
              <Card style={cardStyle}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} barSize={60}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1890ff" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#91d5ff" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ccc' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#colorBar)"
                      radius={[10, 10, 0, 0]}
                      animationDuration={1000}
                    >
                      <LabelList dataKey="value" position="top" style={{ fill: '#000', fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ),
          },
          {
            key: 'top-users',
            label: '👥 Top người dùng',
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
        ]}
      />
    </div>
  );
};

export default Dashboard;
