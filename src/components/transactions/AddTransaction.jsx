import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./addTransaction.css";
import useAuthStore from "../../store/authStore";
import { createTransactionService } from "../../services/transactionServices";
import { getCategoriesService } from "../../services/categoryServices";
import { toast } from "react-toastify";

function AddTransaction() {
    const [form, setForm] = useState({
        mode: "DEBIT",
        categoryId: "",
        amount: "",
        description: "",
        time: ""
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        setForm(prev => ({
            ...prev,
            time: getCurrentTime()
        }));
    }, []);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const res = await getCategoriesService();
            if (res.data?.success) {
                setCategories(res.data.data || []);
            }
        } catch {
            toast.error("Failed to fetch categories");
        } finally {
            setCategoriesLoading(false);
        }
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                userId: user.id,
                categoryId: form.categoryId ? Number(form.categoryId) : "",
                mode: form.mode,
                amount: form.amount ? Number(form.amount) : "",
                description: form.description,
                time: form.time
            };

            const res = await createTransactionService(payload);

            if (res.data?.success) {
                toast.success(res.data.message);
                navigate("/transactions");
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-transaction-container">
            <span className="back-link" onClick={() => navigate(-1)}>
                ← Back
            </span>

            <div className="form-card">
                <div className="form-header">
                    <h2>Add Transaction</h2>
                    <p>Track your income or expense</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mode-selector">
                        <div
                            className={`mode-option credit ${form.mode === "CREDIT" ? "active" : ""}`}
                            onClick={() => updateField("mode", "CREDIT")}
                        >
                            <div className="mode-icon">💰</div>
                            <div className="mode-label">Income</div>
                        </div>
                        <div
                            className={`mode-option debit ${form.mode === "DEBIT" ? "active" : ""}`}
                            onClick={() => updateField("mode", "DEBIT")}
                        >
                            <div className="mode-icon">💸</div>
                            <div className="mode-label">Expense</div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Amount *</label>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={form.amount}
                                onChange={(e) => updateField("amount", e.target.value)}
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => updateField("categoryId", e.target.value)}
                            disabled={categoriesLoading}
                        >
                            <option value="">
                                {categoriesLoading ? "Loading..." : "Select Category"}
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Time *</label>
                        <input
                            type="text"
                            placeholder="e.g., 10:30 AM"
                            value={form.time}
                            onChange={(e) => updateField("time", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Add a note about this transaction..."
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Adding..." : "Add Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddTransaction;
