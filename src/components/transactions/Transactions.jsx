import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./transactions.css";
import useAuthStore from "../../store/authStore";
import { getTransactionsService, deleteTransactionService } from "../../services/transactionServices";
import { toast } from "react-toastify";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        mode: "",
        startDate: "",
        endDate: ""
    });
    const [stats, setStats] = useState({ income: 0, expense: 0, total: 0 });

    const { user } = useAuthStore();
    const navigate = useNavigate();

    const fetchTransactions = useCallback(async (filterParams = {}) => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const res = await getTransactionsService(
                user.id,
                filterParams.mode || "",
                filterParams.startDate || "",
                filterParams.endDate || ""
            );

            if (res.data?.success) {
                const data = res.data.data || [];
                setTransactions(data);

                const income = data
                    .filter(t => t.mode === "CREDIT")
                    .reduce((sum, t) => sum + (t.amount || 0), 0);

                const expense = data
                    .filter(t => t.mode === "DEBIT")
                    .reduce((sum, t) => sum + (t.amount || 0), 0);

                setStats({
                    income,
                    expense,
                    total: data.length
                });
            }
        } catch {
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        fetchTransactions(filters);
    };

    const clearFilters = () => {
        setFilters({ mode: "", startDate: "", endDate: "" });
        fetchTransactions({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const res = await deleteTransactionService(id);
            if (res.data?.success) {
                toast.success(res.data.message);
                fetchTransactions(filters);
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
            </div>
        );
    }

    return (
        <div className="transactions-container">
            <div className="filters-section">
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Transaction Type</label>
                        <select
                            value={filters.mode}
                            onChange={(e) => handleFilterChange("mode", e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="CREDIT">Income (Credit)</option>
                            <option value="DEBIT">Expense (Debit)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        />
                    </div>

                    <div className="filter-actions">
                        <button className="filter-btn" onClick={applyFilters}>
                            Apply Filters
                        </button>
                        <button className="clear-btn" onClick={clearFilters}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="summary-section">
                <div className="summary-card income">
                    <div className="summary-label">Total Income</div>
                    <div className="summary-value">{formatCurrency(stats.income)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="summary-label">Total Expense</div>
                    <div className="summary-value">{formatCurrency(stats.expense)}</div>
                </div>
                <div className="summary-card total">
                    <div className="summary-label">Transactions</div>
                    <div className="summary-value">{stats.total}</div>
                </div>
            </div>

            {transactions.length === 0 ? (
                <div className="empty-transactions">
                    <div className="empty-icon">📊</div>
                    <h3>No transactions found</h3>
                    <p>Start tracking your income and expenses</p>
                    <button className="add-btn" onClick={() => navigate("/add-transaction")}>
                        <span>➕</span> Add Transaction
                    </button>
                </div>
            ) : (
                <div className="transactions-list">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="transaction-card">
                            <div className="transaction-card-left">
                                <div className={`transaction-mode-icon ${transaction.mode?.toLowerCase()}`}>
                                    {transaction.mode === "CREDIT" ? "↓" : "↑"}
                                </div>
                                <div className="transaction-details">
                                    <h3>{transaction.categoryName || "Uncategorized"}</h3>
                                    <div className="transaction-meta">
                                        <span>📅 {transaction.date}</span>
                                        <span>🕐 {transaction.time}</span>
                                        {transaction.description && (
                                            <span>📝 {transaction.description}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="transaction-card-right">
                                <div className={`transaction-card-amount ${transaction.mode?.toLowerCase()}`}>
                                    {transaction.mode === "CREDIT" ? "+" : "-"}
                                    {formatCurrency(transaction.amount)}
                                </div>
                                <div className="transaction-actions">
                                    <button
                                        className="action-btn edit"
                                        onClick={() => navigate(`/edit-transaction/${transaction.id}`, { state: transaction })}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(transaction.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Transactions;
