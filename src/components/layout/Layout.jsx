import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./layout.css";
import useAuthStore from "../../store/authStore";
import { IMAGE_PATH } from "../../config/api";

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const closeSidebar = () => setSidebarOpen(false);

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/transactions", label: "Transactions", icon: "💸" },
        { path: "/add-transaction", label: "Add Transaction", icon: "➕" },
        { path: "/categories", label: "Categories", icon: "📁" },
        { path: "/profile", label: "Profile", icon: "👤" },
    ];

    return (
        <div className="layout-container">
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img
                        src={`${IMAGE_PATH}logo.png`}
                        alt="MoneyBank"
                        className="sidebar-logo"
                    />
                    <span className="sidebar-title">MoneyBank</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={closeSidebar}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a5c46" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <h1 className="page-title">MoneyBank</h1>
                    </div>

                    <div className="header-right">
                        <div className="user-profile" onClick={() => navigate("/profile")}>
                            <img
                                src={user?.image && user.image !== "NA"
                                    ? `${IMAGE_PATH}${user.image}`
                                    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10a37f&color=fff`
                                }
                                alt="Profile"
                                className="user-avatar"
                            />
                            <span className="user-name">{user?.name || "User"}</span>
                        </div>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
