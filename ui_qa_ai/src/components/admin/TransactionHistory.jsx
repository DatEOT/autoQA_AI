import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchId, setSearchId] = useState("");

  // Hàm lấy tất cả giao dịch
  const fetchAllTransactions = () => {
    axios
      .get("http://127.0.0.1:8000/transactionHistory/", {
        headers: { "API-Key": process.env.REACT_APP_API_KEY },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Lỗi khi lấy giao dịch:", err));
  };

  // Lấy tất cả giao dịch khi component được mount
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Hàm xử lý tìm kiếm giao dịch theo idUser
  const handleSearch = () => {
    if (searchId.trim() === "") {
      fetchAllTransactions();
      return;
    }
    axios
      .get(`http://127.0.0.1:8000/transactionHistory/${searchId}`, {
        headers: { "API-Key": process.env.REACT_APP_API_KEY },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Lỗi khi tìm kiếm giao dịch:", err));
  };

  return (
    <div className="container p-4">
      <h2 className="mb-4">Transaction History</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID User"
          value={searchId}
          onChange={(e) => {
            setSearchId(e.target.value);
            // Khi ô tìm kiếm rỗng, tự động reset bảng hiển thị toàn bộ giao dịch
            if (e.target.value.trim() === "") {
              fetchAllTransactions();
            }
          }}
          className="form-control d-inline-block w-auto mr-2"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
      </div>
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>User ID</th>
            <th>Time</th>
            <th>Change Amount</th>
            <th>New Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <tr key={index}>
              <td>{t.idUser}</td>
              <td>{t.timestamp}</td>
              <td className="text-primary">{t.change_amount}</td>
              <td>{t.new_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
