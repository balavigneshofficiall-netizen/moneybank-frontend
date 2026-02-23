import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import personLogoGreen from "../../assets/person_logo_green.svg";
import personLogoRed from "../../assets/person_logo_red.svg";
import useAuthStore from "../../store/authStore";
import { getTransactionsService } from "../../services/transactionServices";
import { toast } from "react-toastify";
import { IMAGE_PATH } from "../../config/api";
// Base URL for backend images (adjust via REACT_APP_API_URL)
const IMG_BASE = IMAGE_PATH;

function Dashboard() {
    const IMG_BASE = IMAGE_PATH;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });

    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [expandedDescId, setExpandedDescId] = useState(null);
    const [imageCache, setImageCache] = useState({});

    const fetchTransactions = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            // Fetch only today's transactions
            const res = await getTransactionsService(user.id, "", "", "", "true");

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
                    totalIncome: income,
                    totalExpense: expense,
                    balance: income - expense
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

    // Prefetch backend images via API and cache blob URLs for faster rendering
    useEffect(() => {
        if (!transactions || transactions.length === 0) return;

        const categoryImageFiles = {
            'alcohol': 'alchocal.png',
            'snacks & drinks': 'snacks&drinks_grren.png',
            'tea & coffee': 'tea_coffee.png',
            'transport': 'transport.png',
            'food': 'food.png',
            'personal usage': 'person.png'
        };

        let cancelled = false;

        (async () => {
            const needed = new Set();
            transactions.forEach(t => {
                const key = (t.categoryName || '').toLowerCase();
                if (key === 'snacks & drinks') {
                    needed.add('snacks&drinks_grren.png');
                    needed.add('snacks&drinks_red.png');
                } else {
                    const f = categoryImageFiles[key];
                    if (f && key !== 'personal usage') needed.add(f);
                }
            });

            for (const file of needed) {
                if (cancelled) break;
                if (imageCache[file]) continue;
                try {
                    const resp = await fetch(`${IMG_BASE}${file}`);
                    if (!resp.ok) continue;
                    const blob = await resp.blob();
                    const url = URL.createObjectURL(blob);
                    setImageCache(prev => ({ ...prev, [file]: url }));
                } catch (e) {
                    console.log(e);

                }
            }
        })();

        return () => { cancelled = true; };
    }, [transactions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="welcome-section">
                <div className="welcome-content">
                    <p className="welcome-text">Welcome back,</p>
                    <h1 className="welcome-name">{user?.name || "User"} 👋</h1>
                    <p className="welcome-date">{getCurrentDate()}</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon income">💰</span>
                        <span className="stat-label">Total Income</span>
                    </div>
                    <div className="stat-value income">
                        {formatCurrency(stats.totalIncome)}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon expense">💸</span>
                        <span className="stat-label">Total Expense</span>
                    </div>
                    <div className="stat-value expense">
                        {formatCurrency(stats.totalExpense)}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon balance">🏦</span>
                        <span className="stat-label">Balance</span>
                    </div>
                    <div className="stat-value">
                        {formatCurrency(stats.balance)}
                    </div>
                </div>
            </div>

            <div className="recent-transactions">
                <div className="section-header">
                    <h2 className="section-title">Today's Transactions</h2>
                    <span
                        className="view-all-btn"
                        onClick={() => navigate("/transactions")}
                    >
                        View All →
                    </span>
                </div>

                <div className="transactions-card">
                    {transactions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No transactions today</h3>
                            <p>Start tracking your expenses!</p>
                        </div>
                    ) : (
                        transactions.map((transaction) => {
                            // Emoji fallbacks
                            const categoryIcons = {
                                'salary': '💸',
                                'bills': '💡',
                                'health': '💊',
                                'entertainment': '🎬',
                                'investment': '📈',
                                'gift': '🎁',
                                'travel': '✈️',
                                'rent': '🏠',
                                'education': '🎓',
                                'insurance': '🛡️',
                                'recharge': '🔋',
                                'mobile': '📱',
                                'fuel': '⛽',
                                'tax': '🧾',
                                'loan': '💳',
                                'emi': '💰',
                                'fees': '💵',
                                'donation': '🙏',
                                'pets': '🐾',
                                'kids': '🧒',
                                'grocer': '🛒',
                                'uncategorized': '❓'
                            };

                            // Map to backend image filenames (images located in backend `/images` folder)
                            const catKey = (transaction.categoryName || '').toLowerCase();
                            console.log(catKey, "catkey");

                            const categoryImageFiles = {
                                'alcohol': 'alchocal.png',
                                'snacks & drinks': transaction.mode === 'CREDIT' ? 'snacks&drinks_grren.png' : 'snacks&drinks_red.png',
                                'tea & coffee': 'tea_coffee.png',
                                'transport': 'transport.png',
                                'food': 'food.png',
                                'personal usage': 'person.png'
                            };

                            // mark personal categories so we can show local person logos
                            const isPersonal = catKey === 'personal usage';
                            const imageFile = categoryImageFiles[catKey];
                            const logoSrc = isPersonal
                                ? (transaction.mode === 'CREDIT' ? personLogoGreen : personLogoRed)
                                : (imageFile ? `${IMG_BASE}${imageFile}` : null);
                            const icon = categoryIcons[transaction.categoryName] || categoryIcons[catKey] || '❓';
                            return (
                                <div key={transaction.id} className="transaction-item">
                                    <div className="transaction-left">
                                        <div className={`transaction-icon ${transaction.mode?.toLowerCase()} ${isPersonal ? 'personal-icon' : ''}`}>
                                            {logoSrc ? (
                                                <img src={logoSrc} alt="person" className="category-logo" />
                                            ) : (
                                                icon
                                            )}
                                        </div>
                                        <div className="transaction-info">
                                            <h4>{transaction.categoryName || "Uncategorized"}</h4>
                                            <p
                                                title={transaction.description}
                                                className={expandedDescId === transaction.id ? 'expanded' : ''}
                                                onClick={() => {
                                                    if (window.matchMedia('(max-width: 600px)').matches) {
                                                        setExpandedDescId(expandedDescId === transaction.id ? null : transaction.id);
                                                    }
                                                }}
                                            >
                                                {transaction.description || "No description"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="transaction-right">
                                        <div className={`transaction-amount ${transaction.mode === 'CREDIT' ? 'credit' : 'debit'}`} style={{ color: transaction.mode === 'CREDIT' ? '#10a37f' : '#dc3545' }}>
                                            {transaction.mode === "CREDIT" ? "+" : "-"}
                                            {formatCurrency(transaction.amount)}
                                        </div>
                                        <div className="transaction-time">
                                            {transaction.time || transaction.date}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
