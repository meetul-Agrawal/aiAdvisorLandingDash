import { useState } from 'react';
import { 
  TrendingUp, Users, Calendar, FileText, Download, 
  ChevronDown, ChevronRight, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  salesSummary, receivablesSummary, monthlyTrends, receivablesAgingSummary 
} from '../../data/dummyData';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="kpi-card">
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

export default function SalesReceivablesTab() {
  const [activeView, setActiveView] = useState('summary');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [searchTerm, setSearchTerm] = useState('');

  const totalSales = salesSummary.reduce((sum, s) => sum + (s.net_amount > 0 ? s.net_amount : 0), 0);
  const totalReceivables = receivablesSummary.reduce((sum, r) => sum + r.receivable_amount, 0);
  const overdueAmount = receivablesSummary
    .filter(r => r.aging_bucket !== 'Current')
    .reduce((sum, r) => sum + r.receivable_amount, 0);

  const filteredReceivables = receivablesSummary.filter(r => 
    r.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Sales (MTD)" 
          value={formatCurrency(totalSales)}
          subtitle="Month to date sales"
          icon={TrendingUp}
          color="green"
          trend={15.7}
        />
        <KPICard 
          title="Total Receivables" 
          value={formatCurrency(totalReceivables)}
          subtitle="Outstanding from customers"
          icon={Users}
          color="blue"
        />
        <KPICard 
          title="Overdue Amount" 
          value={formatCurrency(overdueAmount)}
          subtitle={`${((overdueAmount/totalReceivables)*100).toFixed(1)}% of total receivables`}
          icon={AlertCircle}
          color="orange"
        />
        <KPICard 
          title="Active Customers" 
          value={receivablesSummary.length}
          subtitle="With outstanding balance"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* View Tabs */}
      <div className="section">
        <div className="tabs">
          <button 
            className={`tab ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView('summary')}
          >
            Sales Summary
          </button>
          <button 
            className={`tab ${activeView === 'receivables' ? 'active' : ''}`}
            onClick={() => setActiveView('receivables')}
          >
            Receivables
          </button>
          <button 
            className={`tab ${activeView === 'aging' ? 'active' : ''}`}
            onClick={() => setActiveView('aging')}
          >
            Aging Analysis
          </button>
          <button 
            className={`tab ${activeView === 'drilldown' ? 'active' : ''}`}
            onClick={() => setActiveView('drilldown')}
          >
            Drill Down
          </button>
        </div>

        {/* Sales Summary View */}
        {activeView === 'summary' && (
          <>
            <div className="two-column" style={{ marginBottom: '20px' }}>
              <div>
                <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                  <h3 className="section-title">
                    <TrendingUp size={18} />
                    Sales Trends
                  </h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000000}M`} />
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Legend />
                      <Bar dataKey="sales_amount" name="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                  <h3 className="section-title">
                    <Calendar size={18} />
                    Recent Sales Invoices
                  </h3>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th className="numeric">Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesSummary.filter(s => s.net_amount > 0).map((sale, idx) => (
                        <tr key={idx}>
                          <td>{sale.voucher_number}</td>
                          <td>{formatDate(sale.date)}</td>
                          <td>{sale.party_name}</td>
                          <td className="numeric">{formatCurrency(sale.net_amount)}</td>
                          <td>
                            <span className="badge badge-success">Paid</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="section" style={{ margin: 0 }}>
              <div className="section-header">
                <h3 className="section-title">
                  <FileText size={18} />
                  All Sales Documents
                </h3>
                <div className="section-actions">
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className="search-input"
                    style={{ width: '200px' }}
                  />
                  <button className="btn btn-secondary btn-sm">
                    <Filter size={14} />
                    Filter
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Download size={14} />
                    Export
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Voucher #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th className="numeric">Gross</th>
                      <th className="numeric">Discount</th>
                      <th className="numeric">Net</th>
                      <th className="numeric">Items</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummary.map((sale, idx) => (
                      <tr key={idx}>
                        <td>{sale.voucher_number}</td>
                        <td>{formatDate(sale.date)}</td>
                        <td>{sale.party_name}</td>
                        <td className="numeric">{formatCurrency(sale.gross_amount)}</td>
                        <td className="numeric">{formatCurrency(sale.discount_amount)}</td>
                        <td className="numeric" style={{ fontWeight: 600 }}>
                          {formatCurrency(sale.net_amount)}
                        </td>
                        <td className="numeric">{sale.item_count}</td>
                        <td>
                          <span className={`badge ${sale.net_amount > 0 ? 'badge-success' : 'badge-warning'}`}>
                            {sale.net_amount > 0 ? 'Sales' : 'Credit Note'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Receivables View */}
        {activeView === 'receivables' && (
          <>
            <div className="filter-bar">
              <input 
                type="text" 
                placeholder="Search customers..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="select-input">
                <option>All Aging Buckets</option>
                <option>Current</option>
                <option>1-30 Days</option>
                <option>31-60 Days</option>
                <option>60+ Days</option>
              </select>
              <select className="select-input">
                <option>Sort by Amount</option>
                <option>Sort by Name</option>
                <option>Sort by Days</option>
              </select>
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th className="numeric">Receivable</th>
                    <th>Last Transaction</th>
                    <th>Aging</th>
                    <th className="numeric">Total Sales</th>
                    <th className="numeric">Total Receipts</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceivables.map((rec, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{rec.customer_name}</td>
                      <td className="numeric" style={{ fontWeight: 600, color: '#2563eb' }}>
                        {formatCurrency(rec.receivable_amount)}
                      </td>
                      <td>{rec.days_since_last_txn} days ago</td>
                      <td>
                        <span className={`badge ${
                          rec.aging_bucket === 'Current' ? 'badge-success' :
                          rec.aging_bucket === '1-30 Days Overdue' ? 'badge-info' :
                          rec.aging_bucket === '31-60 Days Overdue' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {rec.aging_bucket}
                        </span>
                      </td>
                      <td className="numeric">{formatCurrency(rec.total_sales_value)}</td>
                      <td className="numeric">{formatCurrency(rec.total_receipts)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ width: '80px' }}>
                            <div 
                              className={`progress-fill ${
                                (rec.receivable_amount/rec.total_sales_value) > 0.3 ? 'danger' :
                                (rec.receivable_amount/rec.total_sales_value) > 0.15 ? 'warning' : 'success'
                              }`}
                              style={{ width: `${Math.min((rec.receivable_amount/rec.total_sales_value)*100, 100)}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>
                            {((rec.receivable_amount/rec.total_sales_value)*100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Aging Analysis View */}
        {activeView === 'aging' && (
          <div className="two-column">
            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <AlertCircle size={18} />
                  Receivables by Aging Bucket
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={receivablesAgingSummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ aging_bucket, amount }) => `${aging_bucket}: ${formatCurrency(amount)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="aging_bucket"
                    >
                      {receivablesAgingSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <Users size={18} />
                  Aging Summary
                </h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Aging Bucket</th>
                      <th className="numeric">Count</th>
                      <th className="numeric">Amount</th>
                      <th className="numeric">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivablesAgingSummary.map((item, idx) => (
                      <tr key={idx}>
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
                        <td className="numeric">{item.count}</td>
                        <td className="numeric" style={{ fontWeight: 600 }}>
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="numeric">
                          {((item.amount / totalReceivables) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ borderTop: '2px solid #e2e8f0', fontWeight: 600 }}>
                    <tr>
                      <td>Total</td>
                      <td className="numeric">
                        {receivablesAgingSummary.reduce((sum, i) => sum + i.count, 0)}
                      </td>
                      <td className="numeric">{formatCurrency(totalReceivables)}</td>
                      <td className="numeric">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Drill Down View */}
        {activeView === 'drilldown' && (
          <div className="two-column">
            <div className="section" style={{ margin: 0 }}>
              <div className="section-header">
                <h3 className="section-title">
                  <Calendar size={18} />
                  Monthly Breakdown
                </h3>
              </div>
              <div className="chart-container large">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000000}M`} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Line type="monotone" dataKey="sales_amount" name="Sales" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="receipt_amount" name="Receipts" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section" style={{ margin: 0 }}>
              <div className="section-header">
                <h3 className="section-title">
                  <TrendingUp size={18} />
                  Performance Metrics
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {monthlyTrends.slice(-3).map((month, idx) => (
                  <div key={idx} style={{ 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{month.month}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        {formatCurrency(month.sales_amount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                      <span>Receipts: {formatCurrency(month.receipt_amount)}</span>
                      <span>Profit: {formatCurrency(month.gross_profit)}</span>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill success"
                          style={{ width: `${(month.receipt_amount/month.sales_amount)*100}%` }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                        Collection Rate: {((month.receipt_amount/month.sales_amount)*100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
