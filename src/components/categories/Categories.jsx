import React, { useState, useEffect, useCallback } from "react";
import "./categories.css";
import {
    getCategoriesService,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService
} from "../../services/categoryServices";
import { toast } from "react-toastify";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getCategoriesService();
            if (res.data?.success) {
                setCategories(res.data.data || []);
            }
        } catch {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setAdding(true);

        try {
            const res = await createCategoryService({ name: newCategory });

            if (res.data?.success) {
                toast.success(res.data.message);
                setNewCategory("");
                fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = async (id) => {
        try {
            const res = await updateCategoryService({
                id,
                name: editingName
            });

            if (res.data?.success) {
                toast.success(res.data.message);
                setEditingId(null);
                setEditingName("");
                fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await deleteCategoryService(id);
            if (res.data?.success) {
                toast.success(res.data.message);
                fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const getCategoryIcon = (name) => {
        const icons = {
            food: "🍔",
            transport: "🚗",
            shopping: "🛍️",
            entertainment: "🎬",
            health: "💊",
            education: "📚",
            bills: "📄",
            salary: "💼",
            investment: "📈",
            other: "📁"
        };

        const lowerName = name.toLowerCase();
        for (const [key, icon] of Object.entries(icons)) {
            if (lowerName.includes(key)) return icon;
        }
        return "📁";
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="categories-container">
            <div className="add-category-section">
                <div className="add-category-header">
                    <h3>Add New Category</h3>
                </div>
                <form className="add-category-form" onSubmit={handleAddCategory}>
                    <input
                        type="text"
                        placeholder="Enter category name (e.g., Food, Transport)"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="add-category-btn"
                        disabled={adding}
                    >
                        {adding ? "Adding..." : "Add Category"}
                    </button>
                </form>
            </div>

            {categories.length === 0 ? (
                <div className="empty-categories">
                    <div className="empty-icon">📁</div>
                    <h3>No categories yet</h3>
                    <p>Create your first category to organize transactions</p>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card">
                            {editingId === category.id ? (
                                <div className="category-edit-form">
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        className="save-btn"
                                        onClick={() => handleSaveEdit(category.id)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="category-card-left">
                                        <div className="category-icon">
                                            {getCategoryIcon(category.name)}
                                        </div>
                                        <div className="category-info">
                                            <h4>{category.name}</h4>
                                            <p>ID: #{category.id}</p>
                                        </div>
                                    </div>
                                    <div className="category-actions">
                                        <button
                                            className="category-action-btn edit"
                                            onClick={() => handleEdit(category)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="category-action-btn delete"
                                            onClick={() => handleDelete(category.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Categories;
