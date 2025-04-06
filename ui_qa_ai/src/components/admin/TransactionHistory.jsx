import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/transactionHistory/", {
        headers: {
          "API-Key": process.env.REACT_APP_API_KEY,
        },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Lỗi khi lấy giao dịch:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lịch sử giao dịch</h2>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">ID người dùng</th>
            <th className="py-2 px-4 border">Thời gian</th>
            <th className="py-2 px-4 border">Thay đổi</th>
            <th className="py-2 px-4 border">Số dư mới</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border">{t.idUser}</td>
              <td className="py-2 px-4 border">{t.timestamp}</td>
              <td className="py-2 px-4 border text-blue-600">{t.change_amount}</td>
              <td className="py-2 px-4 border">{t.new_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
