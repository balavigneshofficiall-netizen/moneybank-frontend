import React, { useState, useEffect } from "react";
import "./profile.css";
import useAuthStore from "../../store/authStore";
import { updateUserService } from "../../services/userServices";
import { uploadImageService } from "../../services/uploadServices";
import { IMAGE_PATH } from "../../config/api";
import { toast } from "react-toastify";

function Profile() {
    const { user, updateUser } = useAuthStore();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                password: ""
            });
        }
    }, [user]);

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadImageService(file);
            if (res.data?.success) {
                const filename = res.data.file.filename;
                const updateRes = await updateUserService({
                    id: user.id,
                    image: filename
                });

                if (updateRes.data?.success) {
                    updateUser({ image: filename });
                    toast.success("Profile photo updated!");
                } else {
                    toast.error(updateRes.data.message || "Failed to update photo");
                }
            } else {
                toast.error(res.data.message || "Upload failed");
            }
        } catch (err) {
            console.error("Image upload error:", err);
            toast.error("Something went wrong");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                id: user.id,
                name: form.name,
                email: form.email,
                phone: form.phone,
                ...(form.password && { password: form.password })
            };

            const res = await updateUserService(payload);

            if (res.data?.success) {
                toast.success(res.data.message);
                updateUser({
                    name: form.name,
                    email: form.email,
                    phone: form.phone
                });
                setIsEditing(false);
                setShowPasswordForm(false);
                setForm(prev => ({ ...prev, password: "" }));
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (user?.image && user.image !== "NA") {
            return `${IMAGE_PATH}${user.image}`;
        }
        return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10a37f&color=fff&size=200`;
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-wrapper">
                    <img
                        src={getAvatarUrl()}
                        alt="Profile"
                        className="profile-avatar"
                    />
                    <label className="avatar-upload-btn">
                        📷
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>
                <h1 className="profile-name">{user?.name || "User"}</h1>
                <p className="profile-email">{user?.email}</p>
            </div>

            <div className="profile-card">
                <h3 className="profile-section-title">Personal Information</h3>

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="profile-form-row">
                        <div className="profile-form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="profile-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="profile-form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {isEditing && (
                        <div className="change-password-section">
                            <div
                                className="password-toggle"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                            >
                                <span>🔐</span>
                                <span>Change Password</span>
                            </div>

                            {showPasswordForm && (
                                <div className="password-form">
                                    <div className="profile-form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => updateField("password", e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="profile-buttons">
                        {isEditing ? (
                            <>
                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    className="profile-edit-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setShowPasswordForm(false);
                                        setForm(prev => ({
                                            ...prev,
                                            name: user?.name || "",
                                            email: user?.email || "",
                                            phone: user?.phone || "",
                                            password: ""
                                        }));
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="profile-save-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>
                </form>

                <div className="profile-info-card">
                    <span className="info-icon">💡</span>
                    <p>
                        Keep your profile information up to date for better security
                        and personalized experience.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
