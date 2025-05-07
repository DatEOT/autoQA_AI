import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [queryInfo, setQueryInfo] = useState("");
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAllTransactions = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/transactionHistory/`, {
        headers: { "API-Key": process.env.REACT_APP_API_KEY },
      })
      .then((res) => {
        setTransactions(res.data);
        setQueryInfo("Toàn bộ lịch sử giao dịch");
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy giao dịch:", err);
        toast.error("Không thể tải lịch sử giao dịch.");
      });
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const handleSearchFlexible = () => {
    // Nếu email được nhập
    if (email.trim()) {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/transactionHistory/by-email?email=${email}`,
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        )
        .then((res) => {
          setTransactions(res.data);
          setQueryInfo(`Lịch sử giao dịch của ${email}`);
          setCurrentPage(1);
          if (res.data.length === 0) {
            toast.warning("Không tìm thấy giao dịch cho email này.");
          } else {
            toast.success("Tìm kiếm theo email thành công!");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tìm theo email:", err);
          toast.error("Đã xảy ra lỗi khi tìm theo email.");
        });
    }

    // Nếu có day/month/year thì truy vấn theo thời gian
    else if (day || month || year) {
      const params = new URLSearchParams();
      if (day) params.append("day", day);
      if (month) params.append("month", month);
      if (year) params.append("year", year);

      axios
        .get(
          `${process.env.REACT_APP_API_URL}/transactionHistory/by-date?${params.toString()}`,
          {
            headers: { "API-Key": process.env.REACT_APP_API_KEY },
          }
        )
        .then((res) => {
          const data = res.data.results || [];
          setTransactions(data);
          setQueryInfo(res.data.query_info || "");
          setCurrentPage(1);
          if (data.length === 0) {
            toast.warning("Không có giao dịch phù hợp.");
          } else {
            toast.success("Tìm kiếm theo thời gian thành công!");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tìm theo thời gian:", err);
          toast.error("Đã xảy ra lỗi khi tìm kiếm.");
        });
    }

    // Nếu mọi thứ trống → reset lại toàn bộ
    else {
      fetchAllTransactions();
    }
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container p-4">

      {/* Form tìm kiếm */}
      <div className="mb-4 row">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by email..."
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim() === "" && !day && !month && !year) {
                fetchAllTransactions();
              }
            }}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Date"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              if (!email && e.target.value.trim() === "" && !month && !year) {
                fetchAllTransactions();
              }
            }}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              if (!email && !day && e.target.value.trim() === "" && !year) {
                fetchAllTransactions();
              }
            }}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              if (!email && !day && !month && e.target.value.trim() === "") {
                fetchAllTransactions();
              }
            }}
          />
        </div>
        <div className="col-md-3 mb-2">
          <button className="btn btn-primary w-100" onClick={handleSearchFlexible}>
            Search
          </button>
        </div>
      </div>

      {/* Hiển thị mô tả truy vấn */}
      {queryInfo && (
        <div className="alert alert-info text-center">{queryInfo}</div>
      )}

      {/* Bảng kết quả */}
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
          {currentItems.map((t, index) => (
            <tr key={index}>
              <td>{t.idUser}</td>
              <td>{t.timestamp}</td>
              <td className="text-primary">{t.change_amount}</td>
              <td>{t.new_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      {transactions.length > itemsPerPage && (
        <div
          className="d-flex justify-content-between align-items-center mt-4"
          style={{ maxWidth: 300, margin: "auto" }}
        >
          <button
            className="btn btn-outline-primary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="mx-3">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-outline-primary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Toast thông báo */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TransactionHistory;
