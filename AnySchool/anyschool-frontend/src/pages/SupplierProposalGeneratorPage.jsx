import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import '../App.css';

/**
 * Supplier Proposal Generator
 * 
 * Generate professional proposals for potential suppliers
 * using your actual business metrics
 */
function SupplierProposalGeneratorPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        supplierName: '',
        supplierContactPerson: '',
        category: 'Stationery Supplies',
        yourName: '',
        yourEmail: '',
        yourPhone: '',
        proposalType: 'retail' // retail, wholesale, or manufacturer
    });
    const [generatedProposal, setGeneratedProposal] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const data = await apiService.getBusinessAnalytics();
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateProposal = () => {
        if (!analytics) return;

        const formatCurrency = (amount) => {
            return `R ${amount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}`;
        };

        let proposal = '';

        // Email version
        if (formData.proposalType === 'retail') {
            proposal = `Subject: Partnership Opportunity - School Procurement Platform

Dear ${formData.supplierContactPerson || formData.supplierName},

My name is ${formData.yourName}, and I'm reaching out regarding a potential partnership with AnySchool, a B2B school procurement platform serving verified schools across South Africa.

WHY PARTNER WITH US?

We're not just another reseller - we're building South Africa's leading school procurement platform with a unique social impact component. Here's our current traction:

Platform Metrics:
• ${analytics.totalSchools} verified schools actively using our platform
• ${analytics.totalParents} parent users
• ${analytics.totalOrders} total orders processed
• ${formatCurrency(analytics.totalRevenue)} in total revenue

Recent Performance:
• ${analytics.ordersLast30Days} orders in the last 30 days
• ${formatCurrency(analytics.revenueLast30Days)} revenue (last 30 days)
• ${formatCurrency(analytics.averageOrderValue)} average order value
• ${analytics.monthOverMonthGrowth} month-over-month growth

Social Impact (Our Unique Differentiator):
• ${analytics.donationOrders} donation orders processed
• ${formatCurrency(analytics.totalDonationValue)} donated to underprivileged students
• ${analytics.schoolsReceivingDonations} schools received donation support

WHAT WE'RE LOOKING FOR:

We're seeking a reliable supplier partner for ${formData.category}. As a B2B platform, we provide you with:

✓ Aggregated bulk orders from multiple verified schools
✓ Predictable monthly order volumes (${analytics.ordersLast30Days}+ orders/month and growing)
✓ Direct access to the education sector market
✓ Growing platform with ${analytics.monthOverMonthGrowth} monthly growth
✓ Professional partnership with proper business processes
✓ Corporate Social Responsibility angle through our donations program

PROPOSAL:

We'd like to discuss establishing a wholesale/bulk pricing agreement. We're looking for:
• Competitive pricing (10-20% below retail)
• Reliable delivery timeframes
• Product quality assurance
• Flexible payment terms (Net 30 preferred)

NEXT STEPS:

I'd love to schedule a call to discuss this opportunity in detail. I can share our full business analytics report and discuss specific products and volumes.

Are you available for a brief call next week?

Best regards,

${formData.yourName}
Founder, AnySchool Platform
${formData.yourEmail}
${formData.yourPhone}

---
Learn more: [Your Website]
Platform: [Your Platform URL]
`; 
        } else if (formData.proposalType === 'manufacturer') {
            // Get top products for manufacturer pitch
            const topProducts = analytics.topSellingProducts?.slice(0, 5) || [];
            
            proposal = `Subject: Direct Supply Partnership - High-Volume School Platform

Dear ${formData.supplierContactPerson || formData.supplierName},

My name is ${formData.yourName}, and I'm reaching out about a direct supply partnership for AnySchool, a B2B school procurement platform with proven monthly volumes in the education sector.

WHY THIS IS A STRONG OPPORTUNITY:

Unlike typical retailers, we represent aggregated demand from ${analytics.totalSchools} verified schools, providing you with:

1. PREDICTABLE BULK VOLUMES
   • ${analytics.ordersLast30Days} orders per month (current)
   • ${analytics.projectedMonthlyOrders} projected orders per month
   • ${formatCurrency(analytics.revenueLast30Days)} monthly revenue
   • Consistent ${analytics.monthOverMonthGrowth} growth rate

2. VERIFIED B2B MARKET
   • ${analytics.totalSchools} institutional clients (not individual consumers)
   • ${analytics.totalParents} end users through school networks
   • Education sector focus (stable, recurring demand)
   • Professional procurement processes

3. PRODUCT PERFORMANCE DATA
Our top-selling products in ${formData.category}:

${topProducts.map((p, i) => `   ${i + 1}. ${p.productName}
      • ${p.totalSold} units sold
      • ${formatCurrency(p.totalRevenue)} revenue
`).join('\n')}

4. SOCIAL IMPACT PARTNERSHIP
   • ${formatCurrency(analytics.totalDonationValue)} in donations processed
   • ${analytics.schoolsReceivingDonations} schools supported
   • Strong CSR alignment for your brand

WHAT WE'RE SEEKING:

Direct supply partnership for ${formData.category} products, specifically:

Product Categories:
${Object.entries(analytics.productsByCategory || {}).map(([cat, count]) => 
    `• ${cat} (${count} SKUs)`).join('\n')}

Partnership Terms:
• Manufacturer direct pricing
• Bulk ordering (monthly consolidated orders)
• 30-60 day payment terms
• Quality assurance and certifications
• Co-branding opportunities

BUSINESS VALIDATION:

Total Platform Transaction Value: ${formatCurrency(analytics.totalRevenue)}
Active Monthly Volume: ${analytics.ordersLast30Days} orders
Quarter-over-Quarter Growth: [${Math.round(analytics.ordersLast90Days / 3)} → ${analytics.ordersLast30Days} orders/month]
Market Position: Leading school-focused procurement platform in region

NEXT STEPS:

I'd like to schedule a meeting to:
1. Share detailed sales data for your product categories
2. Discuss specific volume commitments
3. Explore pricing structures and terms
4. Review logistics and delivery requirements

Would you be available for a call next week? I can provide our full business analytics report and specific product performance data.

Best regards,

${formData.yourName}
Founder, AnySchool Platform
${formData.yourEmail}
${formData.yourPhone}

---
Attachments: Business Analytics Report (available upon request)
Platform: [Your Platform URL]
`;
        } else { // wholesale
            proposal = `Subject: Wholesale Account Request - Growing School Platform

Dear ${formData.supplierContactPerson || formData.supplierName},

I'm ${formData.yourName}, founder of AnySchool, a B2B platform serving schools across South Africa.

We're reaching out to establish a wholesale account for ${formData.category}.

OUR PLATFORM:
• ${analytics.totalSchools} verified schools
• ${analytics.totalParents} active parents/users
• ${analytics.ordersLast30Days} monthly orders
• ${formatCurrency(analytics.revenueLast30Days)} monthly revenue
• ${analytics.monthOverMonthGrowth} growth rate

WHAT WE NEED:
✓ Wholesale pricing (15-20% below retail preferred)
✓ Consistent product availability
✓ Reliable delivery (3-7 business days)
✓ Net 30 payment terms

WHAT YOU GET:
✓ Bulk orders from multiple schools
✓ Professional B2B client
✓ Predictable monthly volume
✓ Growing partnership opportunity

Can we discuss wholesale terms? I'm available next week for a call.

Full analytics report available upon request.

Best regards,

${formData.yourName}
${formData.yourEmail}
${formData.yourPhone}

AnySchool Platform
[Your Website]
`;
        }

        setGeneratedProposal(proposal);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedProposal);
        alert('Proposal copied to clipboard!');
    };

    const downloadProposal = () => {
        const blob = new Blob([generatedProposal], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `supplier-proposal-${formData.supplierName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📧 Supplier Proposal Generator</h1>
                <p>Create professional proposals using your real business metrics</p>
            </div>

            <div className="proposal-form-card">
                <h2>Proposal Details</h2>
                
                <div className="form-section">
                    <h3>Supplier Information</h3>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Supplier/Company Name *</label>
                            <input
                                type="text"
                                name="supplierName"
                                value={formData.supplierName}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="e.g., ABC Stationery Ltd"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Contact Person Name</label>
                            <input
                                type="text"
                                name="supplierContactPerson"
                                value={formData.supplierContactPerson}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="e.g., John Smith"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label>Product Category *</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="e.g., Stationery Supplies, School Uniforms"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Your Information</h3>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label>Your Name *</label>
                            <input
                                type="text"
                                name="yourName"
                                value={formData.yourName}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Your Email *</label>
                            <input
                                type="email"
                                name="yourEmail"
                                value={formData.yourEmail}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Your Phone</label>
                            <input
                                type="tel"
                                name="yourPhone"
                                value={formData.yourPhone}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Proposal Type</h3>
                    <div className="proposal-types">
                        <div className="proposal-type-option">
                            <input
                                type="radio"
                                id="retail"
                                name="proposalType"
                                value="retail"
                                checked={formData.proposalType === 'retail'}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="retail">
                                <strong>Retail Partner</strong>
                                <small>Established online stores, easy to start with</small>
                            </label>
                        </div>
                        <div className="proposal-type-option">
                            <input
                                type="radio"
                                id="wholesale"
                                name="proposalType"
                                value="wholesale"
                                checked={formData.proposalType === 'wholesale'}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="wholesale">
                                <strong>Wholesaler</strong>
                                <small>Bulk suppliers, good pricing, medium barrier</small>
                            </label>
                        </div>
                        <div className="proposal-type-option">
                            <input
                                type="radio"
                                id="manufacturer"
                                name="proposalType"
                                value="manufacturer"
                                checked={formData.proposalType === 'manufacturer'}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="manufacturer">
                                <strong>Manufacturer</strong>
                                <small>Direct from source, best margins, needs traction</small>
                            </label>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn btn-primary btn-lg"
                    onClick={generateProposal}
                    disabled={!formData.supplierName || !formData.yourName || !formData.yourEmail}
                >
                    🎯 Generate Proposal
                </button>
            </div>

            {generatedProposal && (
                <div className="proposal-output-card">
                    <div className="proposal-header">
                        <h2>Generated Proposal</h2>
                        <div className="proposal-actions">
                            <button className="btn btn-outline-primary" onClick={copyToClipboard}>
                                📋 Copy to Clipboard
                            </button>
                            <button className="btn btn-outline-success" onClick={downloadProposal}>
                                📥 Download
                            </button>
                        </div>
                    </div>
                    <pre className="proposal-content">{generatedProposal}</pre>
                </div>
            )}
        </div>
    );
}

export default SupplierProposalGeneratorPage;
