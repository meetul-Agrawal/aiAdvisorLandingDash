import { useState } from 'react';
import { 
  ShoppingCart, FileText, CreditCard, Truck, ClipboardList,
  Download, Filter, Search, Calendar, AlertCircle, CheckCircle,
  TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  salesDocuments, receivablesAging, salesSummary, monthlyTrends 
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

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
  { name: 'Sales', value: 145, amount: 8500000 },
  { name: 'Credit Note', value: 12, amount: -125000 },
  { name: 'Receipt', value: 89, amount: 7200000 },
  { name: 'Sales Order', value: 34, amount: 3200000 },
  { name: 'Delivery Note', value: 28, amount: 0 }
];

export default function SalesTab() {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = salesDocuments.filter(doc => {
    if (activeSubTab === 'all') return true;
    if (activeSubTab === 'receivables') return doc.voucher_type === 'Receipt';
    return doc.voucher_type.toLowerCase().replace(' ', '') === activeSubTab.toLowerCase();
  }).filter(doc => 
    doc.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.voucher_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = salesSummary.reduce((sum, s) => sum + (s.net_amount > 0 ? s.net_amount : 0), 0);
  const totalReceipts = monthlyTrends[monthlyTrends.length - 1]?.receipt_amount || 0;
  const pendingReceivables = totalSales - totalReceipts;

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Sales" 
          value={formatCurrency(totalSales)}
          subtitle="Sales invoices this month"
          icon={ShoppingCart}
          color="green"
          trend={12.5}
          onClick={() => setActiveSubTab('sales')}
        />
        <KPICard 
          title="Credit Notes" 
          value={formatCurrency(125000)}
          subtitle="Returns & adjustments"
          icon={FileText}
          color="orange"
          onClick={() => setActiveSubTab('creditnote')}
        />
        <KPICard 
          title="Receipts" 
          value={formatCurrency(totalReceipts)}
          subtitle="Payments received"
          icon={CreditCard}
          color="blue"
          trend={8.3}
          onClick={() => setActiveSubTab('receipts')}
        />
        <KPICard 
          title="Pending Receivables" 
          value={formatCurrency(pendingReceivables)}
          subtitle="Outstanding from customers"
          icon={AlertCircle}
          color="red"
          onClick={() => setActiveSubTab('receivables')}
        />
        <KPICard 
          title="Sales Orders" 
          value={"34"}
          subtitle="Pending orders"
          icon={ClipboardList}
          color="purple"
          onClick={() => setActiveSubTab('salesorder')}
        />
        <KPICard 
          title="Delivery Notes" 
          value={"28"}
          subtitle="Pending deliveries"
          icon={Truck}
          color="cyan"
          onClick={() => setActiveSubTab('deliverynote')}
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
            className={`tab ${activeSubTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sales')}
          >
            Sales
          </button>
          <button 
            className={`tab ${activeSubTab === 'creditnote' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('creditnote')}
          >
            Credit Note
          </button>
          <button 
            className={`tab ${activeSubTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('receipts')}
          >
            Receipt
          </button>
          <button 
            className={`tab ${activeSubTab === 'receivables' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('receivables')}
          >
            Receivables
          </button>
          <button 
            className={`tab ${activeSubTab === 'salesorder' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('salesorder')}
          >
            Sales Order
          </button>
          <button 
            className={`tab ${activeSubTab === 'deliverynote' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('deliverynote')}
          >
            Delivery Note
          </button>
        </div>

        {/* Charts for Overview */}
        {activeSubTab === 'all' && (
          <div className="two-column" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <TrendingUp size={18} />
                  Sales Trend
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000000}M`} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Area type="monotone" dataKey="sales_amount" name="Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales2)" />
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

        {/* Receivables Aging View */}
        {activeSubTab === 'receivables' && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '12px', 
              marginBottom: '20px' 
            }}>
              {[
                { label: 'Current', amount: 1250000, count: 45, color: '#10b981' },
                { label: '1-30 Days', amount: 850000, count: 32, color: '#3b82f6' },
                { label: '31-60 Days', amount: 420000, count: 18, color: '#f59e0b' },
                { label: '61-90 Days', amount: 280000, count: 12, color: '#8b5cf6' },
                { label: '90+ Days', amount: 155000, count: 8, color: '#ef4444' }
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
                    {bucket.count} customers
                  </div>
                </div>
              ))}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Voucher #</th>
                    <th>Date</th>
                    <th className="numeric">Amount</th>
                    <th>Days</th>
                    <th>Aging</th>
                  </tr>
                </thead>
                <tbody>
                  {receivablesAging.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{item.customer_name}</td>
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
        {activeSubTab !== 'receivables' && (
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
                          doc.voucher_type === 'Sales' ? 'badge-success' :
                          doc.voucher_type === 'Credit Note' ? 'badge-warning' :
                          doc.voucher_type === 'Receipt' ? 'badge-info' :
                          doc.voucher_type === 'Sales Order' ? 'badge-secondary' :
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
