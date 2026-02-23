import React, { useRef, useState } from "react";
import "./otp.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/api";
import useAuthStore from "../../store/authStore";
import { getUserService } from "../../services/userServices";

function Otp() {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef([]);
    const eFromState = location?.state?.email;
    const { login } = useAuthStore();

    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;
        const copy = [...otp];
        copy[index] = value;
        setOtp(copy);
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const submitOTP = async () => {
        const code = otp.join("");
        if (code.length !== 4) {
            toast.error("Enter 4 digit OTP");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${BASE_URL}/sendotp`, { otp: code, email: eFromState });

            if (res.data.success) {
                toast.success("OTP Verified!");

                const userRes = await getUserService(res.data.id);
                if (userRes.data?.success && userRes.data.data?.length > 0) {
                    const userData = userRes.data.data[0];
                    const token = localStorage.getItem("token");
                    login(userData, token);
                }

                navigate("/dashboard");
            } else {
                toast.error(res.data.message || "Invalid OTP");
            }
        } catch (err) {
            toast.error("Failed to verify");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-bg">
            <div className="otp-card">
                <h2>Verify OTP</h2>
                <p className="otp-sub">Enter the 4-digit code sent to your email</p>

                <div className="otp-input-wrapper">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="otp-box"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                    ))}
                </div>

                <button className="otp-btn" onClick={submitOTP} disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="otp-resend" onClick={() => toast.info("Resend OTP feature coming soon")}>
                    Resend OTP
                </p>
            </div>
        </div>
    );
}

export default Otp;
