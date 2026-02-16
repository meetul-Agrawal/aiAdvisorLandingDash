import { useState } from 'react';
import { 
  ShoppingBag, FileText, CreditCard, Truck, ClipboardList,
  Download, Filter, Search, Calendar, AlertCircle, CheckCircle,
  TrendingDown, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Package
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  purchaseDocuments, payablesAging, purchaseDocuments as purchaseData, monthlyTrends 
} from '../../data/dummyData';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
  <div 
    className="kpi-card" 
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="kpi-header">
      <span className="kpi-label">{title}</span>
      <div className={`kpi-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-subtitle">
      {trend && (
        <span style={{ 
          color: trend > 0 ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
      {subtitle}
    </div>
  </div>
);

const documentTypeData = [
  { name: 'Purchase', value: 98, amount: 5200000 },
  { name: 'Debit Note', value: 8, amount: -75000 },
  { name: 'Payment', value: 76, amount: 4800000 },
  { name: 'Purchase Order', value: 42, amount: 4500000 },
  { name: 'Receipt Note', value: 35, amount: 0 }
];

export default function PurchaseTab() {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = purchaseDocuments.filter(doc => {
    if (activeSubTab === 'all') return true;
    if (activeSubTab === 'payables') return doc.voucher_type === 'Payment';
    return doc.voucher_type.toLowerCase().replace(' ', '') === activeSubTab.toLowerCase();
  }).filter(doc => 
    doc.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchases = purchaseData.reduce((sum, p) => sum + (p.net_amount > 0 ? p.net_amount : 0), 0);
  const totalPayments = monthlyTrends[monthlyTrends.length - 1]?.payment_amount || 0;
  const pendingPayables = totalPurchases - totalPayments;

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Purchases" 
          value={formatCurrency(totalPurchases)}
          subtitle="Purchase bills this month"
          icon={ShoppingBag}
          color="orange"
          trend={8.2}
          onClick={() => setActiveSubTab('purchase')}
        />
        <KPICard 
          title="Debit Notes" 
          value={formatCurrency(75000)}
          subtitle="Returns & adjustments"
          icon={FileText}
          color="red"
          onClick={() => setActiveSubTab('debitnote')}
        />
        <KPICard 
          title="Payments" 
          value={formatCurrency(totalPayments)}
          subtitle="Payments made"
          icon={CreditCard}
          color="blue"
          trend={5.5}
          onClick={() => setActiveSubTab('payment')}
        />
        <KPICard 
          title="Pending Payables" 
          value={formatCurrency(pendingPayables)}
          subtitle="Outstanding to suppliers"
          icon={AlertCircle}
          color="red"
          onClick={() => setActiveSubTab('payables')}
        />
        <KPICard 
          title="Purchase Orders" 
          value={"42"}
          subtitle="Pending orders"
          icon={ClipboardList}
          color="purple"
          onClick={() => setActiveSubTab('purchaseorder')}
        />
        <KPICard 
          title="Receipt Notes" 
          value={"35"}
          subtitle="Goods received"
          icon={Package}
          color="cyan"
          onClick={() => setActiveSubTab('receiptnote')}
        />
      </div>

      {/* Sub Tabs */}
      <div className="section">
        <div className="tabs">
          <button 
            className={`tab ${activeSubTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('all')}
          >
            All Documents
          </button>
          <button 
            className={`tab ${activeSubTab === 'purchase' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('purchase')}
          >
            Purchase
          </button>
          <button 
            className={`tab ${activeSubTab === 'debitnote' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('debitnote')}
          >
            Debit Note
          </button>
          <button 
            className={`tab ${activeSubTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('payment')}
          >
            Payment
          </button>
          <button 
            className={`tab ${activeSubTab === 'payables' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('payables')}
          >
            Payables
          </button>
          <button 
            className={`tab ${activeSubTab === 'purchaseorder' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('purchaseorder')}
          >
            Purchase Order
          </button>
          <button 
            className={`tab ${activeSubTab === 'receiptnote' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('receiptnote')}
          >
            Receipt Note
          </button>
        </div>

        {/* Charts for Overview */}
        {activeSubTab === 'all' && (
          <div className="two-column" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <TrendingDown size={18} />
                  Purchase Trend
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorPurchase2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000000}M`} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Area type="monotone" dataKey="purchase_amount" name="Purchases" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPurchase2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <FileText size={18} />
                  Documents by Type
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Payables Aging View */}
        {activeSubTab === 'payables' && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '12px', 
              marginBottom: '20px' 
            }}>
              {[
                { label: 'Current', amount: 980000, count: 38, color: '#10b981' },
                { label: '1-30 Days', amount: 750000, count: 28, color: '#3b82f6' },
                { label: '31-60 Days', amount: 420000, count: 15, color: '#f59e0b' },
                { label: '61-90 Days', amount: 250000, count: 10, color: '#8b5cf6' },
                { label: '90+ Days', amount: 80000, count: 5, color: '#ef4444' }
              ].map((bucket, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  background: `${bucket.color}10`, 
                  borderRadius: '8px',
                  border: `1px solid ${bucket.color}30`
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                    {bucket.label}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: bucket.color }}>
                    {formatCurrency(bucket.amount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    {bucket.count} suppliers
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Voucher #</th>
                    <th>Date</th>
                    <th className="numeric">Amount</th>
                    <th>Days</th>
                    <th>Aging</th>
                  </tr>
                </thead>
                <tbody>
                  {payablesAging.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{item.supplier_name}</td>
                      <td>{item.voucher_number}</td>
                      <td>{formatDate(item.transaction_date)}</td>
                      <td className="numeric" style={{ fontWeight: 600 }}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td>{item.days_outstanding}</td>
                      <td>
                        <span className={`badge ${
                          item.aging_bucket === 'Current' ? 'badge-success' :
                          item.aging_bucket === '1-30 Days' ? 'badge-info' :
                          item.aging_bucket === '31-60 Days' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {item.aging_bucket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Documents List */}
        {activeSubTab !== 'payables' && (
          <>
            <div className="filter-bar">
              <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search by party or voucher..."
                  className="search-input"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <input type="date" className="select-input" />
              <input type="date" className="select-input" />
              <button className="btn btn-secondary btn-sm">
                <Filter size={14} />
                Filter
              </button>
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Voucher #</th>
                    <th>Date</th>
                    <th>Party</th>
                    <th>GSTIN</th>
                    <th className="numeric">Gross</th>
                    <th className="numeric">Discount</th>
                    <th className="numeric">Net</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge ${
                          doc.voucher_type === 'Purchase' ? 'badge-warning' :
                          doc.voucher_type === 'Debit Note' ? 'badge-danger' :
                          doc.voucher_type === 'Payment' ? 'badge-info' :
                          doc.voucher_type === 'Purchase Order' ? 'badge-secondary' :
                          'badge-secondary'
                        }`}>
                          {doc.voucher_type}
                        </span>
                      </td>
                      <td>{doc.voucher_number}</td>
                      <td>{formatDate(doc.date)}</td>
                      <td>{doc.party_name}</td>
                      <td>{doc.party_gstin}</td>
                      <td className="numeric">{formatCurrency(Math.abs(doc.gross_amount))}</td>
                      <td className="numeric">{formatCurrency(doc.discount_amount)}</td>
                      <td className="numeric" style={{ fontWeight: 600 }}>
                        {formatCurrency(Math.abs(doc.net_amount))}
                      </td>
                      <td>
                        <span className={`badge ${doc.is_cancelled ? 'badge-danger' : 'badge-success'}`}>
                          {doc.is_cancelled ? 'Cancelled' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary" style={{ padding: '4px 8px' }}>
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDocuments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No documents found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
