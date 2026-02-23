import React, { useState, useEffect, useRef } from "react";
import "./register.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL, IMAGE_PATH } from "../../config/api";
import { uploadImageService } from "../../services/uploadServices";
import MoneyBankLogo from "../../assets/moneybank-logo.svg";

function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        image: ""
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fixHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        fixHeight();
        window.addEventListener("resize", fixHeight);
        return () => window.removeEventListener("resize", fixHeight);
    }, []);

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleImage = async (file) => {
        if (!file) return;

        // Show local preview first
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        try {
            const res = await uploadImageService(file);
            if (res.data.success) {
                const filename = res.data.file.filename;
                updateField("image", filename);
                // Set preview from server URL after successful upload
                setImagePreview(`${IMAGE_PATH}${filename}`);
                toast.success(res.data.message || "Image uploaded!");
            } else {
                toast.error(res.data.message || "Upload failed");
                setImagePreview(null);
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Something went wrong");
            setImagePreview(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleImage(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        } else {
            toast.error("Please drop an image file");
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        updateField("image", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${BASE_URL}/register`, form);
            if (res.data?.success) {
                toast.success(res.data.message);
                navigate("/");
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
        <div className="register-page">
            {/* Desktop: Left Side - Branding */}
            <div className="register-left">
                <div className="register-brand">
                    <img
                        src={MoneyBankLogo}
                        alt="MoneyBank Logo"
                        className="register-logo-large"
                    />
                    <h1 className="brand-title">MoneyBank</h1>
                    <p className="brand-tagline">
                        Your trusted partner for smart financial management
                    </p>
                </div>
            </div>

            {/* Desktop: Right Side / Mobile: Full Screen */}
            <div className="register-right">
                <div className="register-card">
                    {/* Always show logo on top for mobile and desktop */}
                    <div className="mobile-logo-wrapper">
                        <img
                            src={MoneyBankLogo}
                            alt="MoneyBank Logo"
                            className="mobile-logo"
                        />
                    </div>

                    <h2>Create Account</h2>
                    <p className="subtitle">Fill the details to get started</p>

                    {/* Stylish Avatar Upload */}
                    <div className="avatar-upload-wrapper">
                        <div
                            className={`avatar-upload ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                hidden
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Avatar" className="avatar-image" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                                    </svg>
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                        </div>
                        {imagePreview && (
                            <button
                                type="button"
                                className="avatar-remove"
                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                        <p className="avatar-label">{imagePreview ? 'Change Photo' : 'Add Photo'}</p>
                    </div>

                    <form onSubmit={submit} autoComplete="off">
                        <div className="row-2">
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="text"
                                    placeholder="Email ID"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="row-2">
                            <div className="input-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    placeholder="Phone number"
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter password"
                                value={form.confirmPassword}
                                onChange={(e) => updateField("confirmPassword", e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="footer-text">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/")} className="login-link">
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
