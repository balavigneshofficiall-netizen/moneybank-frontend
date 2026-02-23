import React, { useState, useEffect } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/api";
import useAuthStore from "../../store/authStore";
import MoneyBankLogo from "../../assets/moneybank-logo.svg";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, setToken } = useAuthStore();

    useEffect(() => {
        const fixHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        fixHeight();
        window.addEventListener("resize", fixHeight);

        if (isAuthenticated) {
            navigate("/dashboard");
        }

        return () => window.removeEventListener("resize", fixHeight);
    }, [isAuthenticated, navigate]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${BASE_URL}/login`, { email, password });
            if (res.data.success) {
                toast.success(res.data.message);
                localStorage.setItem("token", res.data.token);
                setToken(res.data.token);
                navigate("/otp", { state: { email } });
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
        <div className="login-page">
            {/* Desktop: Left Side - Branding */}
            <div className="login-left">
                <div className="login-brand">
                    <img
                        src={MoneyBankLogo}
                        alt="MoneyBank Logo"
                        className="login-logo-large"
                    />
                    <h1 className="brand-title">MoneyBank</h1>
                    <p className="brand-tagline">
                        Your trusted partner for smart financial management
                    </p>
                </div>
            </div>

            {/* Desktop: Right Side / Mobile: Full Screen */}
            <div className="login-right">
                <div className="login-card">
                    {/* Mobile Logo */}
                    <div className="mobile-logo-wrapper">
                        <img
                            src={MoneyBankLogo}
                            alt="MoneyBank Logo"
                            className="mobile-logo"
                        />
                    </div>

                    <h2>Welcome Back!</h2>
                    <p className="subtitle">Sign in to manage your finances</p>

                    <form onSubmit={submit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                        <button className="login-btn" disabled={loading} type="submit">
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="footer-text">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="register-link"
                        >
                            Register
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
