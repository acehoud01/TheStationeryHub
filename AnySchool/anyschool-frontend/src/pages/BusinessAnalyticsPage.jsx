import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import '../App.css';

/**
 * Business Analytics Page
 * 
 * Dashboard showing key business metrics
 * Used for:
 * - Supplier negotiations
 * - Business intelligence
 * - Growth tracking
 */
function BusinessAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await apiService.getBusinessAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `R ${amount?.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
    };

    const downloadReport = () => {
        const reportContent = `
ANYSCHOOL BUSINESS ANALYTICS REPORT
Generated: ${new Date(analytics.reportGeneratedAt).toLocaleString()}

========================================
PLATFORM METRICS
========================================
Total Schools: ${analytics.totalSchools}
Total Parents: ${analytics.totalParents}
Total Orders: ${analytics.totalOrders}
Total Revenue: ${formatCurrency(analytics.totalRevenue)}
Average Order Value: ${formatCurrency(analytics.averageOrderValue)}

========================================
RECENT PERFORMANCE
========================================
Orders (Last 30 Days): ${analytics.ordersLast30Days}
Revenue (Last 30 Days): ${formatCurrency(analytics.revenueLast30Days)}
Orders (Last 90 Days): ${analytics.ordersLast90Days}
Revenue (Last 90 Days): ${formatCurrency(analytics.revenueLast90Days)}
Month-over-Month Growth: ${analytics.monthOverMonthGrowth}
Projected Monthly Orders: ${analytics.projectedMonthlyOrders}

========================================
SOCIAL IMPACT
========================================
Donation Orders: ${analytics.donationOrders}
Total Donation Value: ${formatCurrency(analytics.totalDonationValue)}
Schools Receiving Donations: ${analytics.schoolsReceivingDonations}

========================================
CATALOG & SUPPLIERS
========================================
Total Products: ${analytics.totalProducts}
Total Suppliers: ${analytics.totalSuppliers}

Products by Category:
${Object.entries(analytics.productsByCategory || {}).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

Suppliers by Type:
${Object.entries(analytics.suppliersByType || {}).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

========================================
TOP SELLING PRODUCTS
========================================
${analytics.topSellingProducts?.map((p, i) => 
    `${i + 1}. ${p.productName} (${p.category})
   Sold: ${p.totalSold} units | Revenue: ${formatCurrency(p.totalRevenue)}`
).join('\n\n')}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anyschool-business-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="page-container">
                <div className="alert alert-danger">{error || 'No data available'}</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="analytics-header">
                <div>
                    <h1>Business Analytics</h1>
                    <p>Comprehensive platform metrics for strategic decisions</p>
                </div>
                <button className="btn btn-primary" onClick={downloadReport}>
                    📥 Download Report
                </button>
            </div>

            {/* Key Metrics Overview */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">🏫</div>
                    <div className="metric-content">
                        <h3>{analytics.totalSchools}</h3>
                        <p>Active Schools</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon">👨‍👩‍👧‍👦</div>
                    <div className="metric-content">
                        <h3>{analytics.totalParents}</h3>
                        <p>Parent Users</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon">📦</div>
                    <div className="metric-content">
                        <h3>{analytics.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="metric-card highlight">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <h3>{formatCurrency(analytics.totalRevenue)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            {/* Recent Performance */}
            <div className="section-card">
                <h2>Recent Performance</h2>
                <div className="performance-grid">
                    <div className="performance-item">
                        <div className="performance-label">Last 30 Days</div>
                        <div className="performance-value">
                            <strong>{analytics.ordersLast30Days}</strong> orders
                        </div>
                        <div className="performance-value">
                            {formatCurrency(analytics.revenueLast30Days)}
                        </div>
                    </div>
                    <div className="performance-item">
                        <div className="performance-label">Last 90 Days</div>
                        <div className="performance-value">
                            <strong>{analytics.ordersLast90Days}</strong> orders
                        </div>
                        <div className="performance-value">
                            {formatCurrency(analytics.revenueLast90Days)}
                        </div>
                    </div>
                    <div className="performance-item">
                        <div className="performance-label">Growth Rate</div>
                        <div className="performance-value growth">
                            {analytics.monthOverMonthGrowth}
                        </div>
                    </div>
                    <div className="performance-item">
                        <div className="performance-label">AOV</div>
                        <div className="performance-value">
                            {formatCurrency(analytics.averageOrderValue)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Negotiation Power Section - Key for Suppliers */}
            <div className="section-card highlight-section">
                <h2>🎯 Supplier Negotiation Power</h2>
                <div className="negotiation-points">
                    <div className="negotiation-item">
                        <span className="negotiation-label">Monthly Order Volume:</span>
                        <span className="negotiation-value">{analytics.ordersLast30Days} orders</span>
                    </div>
                    <div className="negotiation-item">
                        <span className="negotiation-label">Projected Monthly Orders:</span>
                        <span className="negotiation-value">{analytics.projectedMonthlyOrders} orders</span>
                    </div>
                    <div className="negotiation-item">
                        <span className="negotiation-label">Monthly Revenue:</span>
                        <span className="negotiation-value">{formatCurrency(analytics.revenueLast30Days)}</span>
                    </div>
                    <div className="negotiation-item">
                        <span className="negotiation-label">Market Reach:</span>
                        <span className="negotiation-value">{analytics.totalSchools} schools, {analytics.totalParents} parents</span>
                    </div>
                    <div className="negotiation-item">
                        <span className="negotiation-label">Growth Trend:</span>
                        <span className="negotiation-value success">{analytics.monthOverMonthGrowth}</span>
                    </div>
                </div>
                <div className="negotiation-summary">
                    <p><strong>Your Value Proposition to Suppliers:</strong></p>
                    <ul>
                        <li>Consolidated bulk orders from {analytics.totalSchools} verified schools</li>
                        <li>Predictable monthly volume of ~{analytics.projectedMonthlyOrders} orders</li>
                        <li>Growing platform with {analytics.monthOverMonthGrowth} growth rate</li>
                        <li>Social impact angle: {formatCurrency(analytics.totalDonationValue)} in donations</li>
                        <li>Direct access to education sector market</li>
                    </ul>
                </div>
            </div>

            {/* Social Impact */}
            <div className="section-card">
                <h2>❤️ Social Impact</h2>
                <div className="impact-grid">
                    <div className="impact-item">
                        <h4>{analytics.donationOrders}</h4>
                        <p>Donation Orders</p>
                    </div>
                    <div className="impact-item">
                        <h4>{formatCurrency(analytics.totalDonationValue)}</h4>
                        <p>Total Donations</p>
                    </div>
                    <div className="impact-item">
                        <h4>{analytics.schoolsReceivingDonations}</h4>
                        <p>Schools Supported</p>
                    </div>
                </div>
            </div>

            {/* Product Performance */}
            <div className="section-card">
                <h2>📊 Top Selling Products</h2>
                <div className="products-table">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Units Sold</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.topSellingProducts?.map((product, index) => (
                                <tr key={product.productId}>
                                    <td>{index + 1}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.category}</td>
                                    <td>{product.totalSold}</td>
                                    <td>{formatCurrency(product.totalRevenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Catalog Overview */}
            <div className="two-column-section">
                <div className="section-card">
                    <h2>📦 Products by Category</h2>
                    <div className="category-list">
                        {Object.entries(analytics.productsByCategory || {}).map(([category, count]) => (
                            <div key={category} className="category-item">
                                <span className="category-name">{category}</span>
                                <span className="category-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card">
                    <h2>🤝 Suppliers by Type</h2>
                    <div className="category-list">
                        {Object.entries(analytics.suppliersByType || {}).map(([type, count]) => (
                            <div key={type} className="category-item">
                                <span className="category-name">{type}</span>
                                <span className="category-count">{count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="supplier-note">
                        <p>Total: {analytics.totalSuppliers} suppliers | {analytics.totalProducts} products</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BusinessAnalyticsPage;
