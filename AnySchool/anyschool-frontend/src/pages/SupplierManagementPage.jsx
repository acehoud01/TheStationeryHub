import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import '../App.css';

/**
 * Supplier Management Page
 * 
 * Admin interface for managing suppliers
 * Features:
 * - View all suppliers
 * - Add new supplier
 * - Edit existing supplier
 * - Filter by supplier type
 * - Track contract details
 */
function SupplierManagementPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        supplierType: 'RETAILER',
        notes: '',
        paymentTerms: '',
        minimumOrderValue: '',
        deliveryTime: '',
        active: true
    });

    useEffect(() => {
        fetchSuppliers();
    }, [filterType]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            let data;
            if (filterType === 'ALL') {
                data = await apiService.getAllSuppliers();
            } else {
                data = await apiService.getSuppliersByType(filterType);
            }
            setSuppliers(data);
        } catch (err) {
            setError('Failed to load suppliers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await apiService.updateSupplier(editingSupplier.id, formData);
            } else {
                await apiService.createSupplier(formData);
            }
            setShowAddForm(false);
            setEditingSupplier(null);
            resetForm();
            fetchSuppliers();
        } catch (err) {
            setError('Failed to save supplier');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            supplierType: 'RETAILER',
            notes: '',
            paymentTerms: '',
            minimumOrderValue: '',
            deliveryTime: '',
            active: true
        });
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            supplierType: supplier.supplierType,
            notes: supplier.notes || '',
            paymentTerms: supplier.paymentTerms || '',
            minimumOrderValue: supplier.minimumOrderValue || '',
            deliveryTime: supplier.deliveryTime || '',
            active: supplier.active
        });
        setShowAddForm(true);
    };

    const handleDeactivate = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this supplier?')) {
            try {
                await apiService.deactivateSupplier(id);
                fetchSuppliers();
            } catch (err) {
                setError('Failed to deactivate supplier');
                console.error(err);
            }
        }
    };

    const supplierTypes = ['MANUFACTURER', 'WHOLESALER', 'RETAILER', 'DISTRIBUTOR'];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Supplier Management</h1>
                <p>Manage your supplier partnerships and vendor relationships</p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="supplier-actions">
                <div className="filter-section">
                    <label>Filter by Type:</label>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="form-select"
                        >
                            <option value="ALL">All Suppliers</option>
                            {supplierTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingSupplier(null);
                            resetForm();
                        }}
                    >
                        {showAddForm ? 'Cancel' : '+ Add New Supplier'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label>Supplier Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label>Supplier Type *</label>
                                        <select
                                            name="supplierType"
                                            value={formData.supplierType}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            {supplierTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label>Contact Person</label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label>Payment Terms</label>
                                        <input
                                            type="text"
                                            name="paymentTerms"
                                            value={formData.paymentTerms}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g., Net 30, COD"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label>Minimum Order Value</label>
                                        <input
                                            type="text"
                                            name="minimumOrderValue"
                                            value={formData.minimumOrderValue}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g., R 1000"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label>Delivery Time</label>
                                        <input
                                            type="text"
                                            name="deliveryTime"
                                            value={formData.deliveryTime}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g., 3-5 business days"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="2"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>

                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        className="form-check-input"
                                        id="activeCheck"
                                    />
                                    <label className="form-check-label" htmlFor="activeCheck">
                                        Active
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-success">
                                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p>Loading suppliers...</p>
                ) : (
                    <div className="suppliers-grid">
                        {suppliers.length === 0 ? (
                            <p>No suppliers found. Add your first supplier to get started!</p>
                        ) : (
                            suppliers.map(supplier => (
                                <div key={supplier.id} className="card supplier-card">
                                    <div className="card-body">
                                        <div className="supplier-header">
                                            <h4>{supplier.name}</h4>
                                            <span className={`badge ${supplier.active ? 'bg-success' : 'bg-secondary'}`}>
                                                {supplier.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="supplier-type">
                                            <strong>Type:</strong> {supplier.supplierType}
                                        </p>
                                        {supplier.contactPerson && (
                                            <p><strong>Contact:</strong> {supplier.contactPerson}</p>
                                        )}
                                        {supplier.email && (
                                            <p><strong>Email:</strong> {supplier.email}</p>
                                        )}
                                        {supplier.phone && (
                                            <p><strong>Phone:</strong> {supplier.phone}</p>
                                        )}
                                        {supplier.paymentTerms && (
                                            <p><strong>Payment:</strong> {supplier.paymentTerms}</p>
                                        )}
                                        {supplier.deliveryTime && (
                                            <p><strong>Delivery:</strong> {supplier.deliveryTime}</p>
                                        )}
                                        {supplier.productCount > 0 && (
                                            <p><strong>Products:</strong> {supplier.productCount}</p>
                                        )}
                                        <div className="supplier-actions-btns">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleEdit(supplier)}
                                            >
                                                Edit
                                            </button>
                                            {supplier.active && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeactivate(supplier.id)}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

        </div>
    );
}

export default SupplierManagementPage;
