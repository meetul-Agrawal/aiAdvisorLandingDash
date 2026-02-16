import { useState } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Users, Package, 
  CreditCard, ArrowUpRight, ArrowDownRight, Filter, Download,
  Calendar, Building2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  kpiData, cashBankBalances, cashBankTransactions, inventorySummary, 
  payablesSummary, monthlyTrends 
} from '../../data/dummyData';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

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

export default function SummaryTab() {
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  const filteredTransactions = cashBankTransactions.filter(txn => {
    if (transactionFilter === 'all') return true;
    return txn.transaction_direction.toLowerCase() === transactionFilter;
  });

  const totalCashBank = kpiData.total_cash + kpiData.total_bank;
  const workingCapital = kpiData.total_receivables - kpiData.total_payables;

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Cash & Bank" 
          value={formatCurrency(totalCashBank)}
          subtitle="Current liquidity position"
          icon={Wallet}
          color="blue"
          trend={12.5}
        />
        <KPICard 
          title="Total Receivables" 
          value={formatCurrency(kpiData.total_receivables)}
          subtitle="Amount due from customers"
          icon={TrendingUp}
          color="green"
          trend={8.3}
        />
        <KPICard 
          title="Total Payables" 
          value={formatCurrency(kpiData.total_payables)}
          subtitle="Amount due to suppliers"
          icon={TrendingDown}
          color="orange"
          trend={-5.2}
        />
        <KPICard 
          title="Net Working Capital" 
          value={formatCurrency(workingCapital)}
          subtitle="Receivables - Payables"
          icon={CreditCard}
          color="cyan"
        />
        <KPICard 
          title="MTD Sales" 
          value={formatCurrency(kpiData.mtd_sales)}
          subtitle={`This month: ${new Date().toLocaleString('en-IN', { month: 'long' })}`}
          icon={Building2}
          color="purple"
          trend={15.7}
        />
        <KPICard 
          title="MTD Purchases" 
          value={formatCurrency(kpiData.mtd_purchases)}
          subtitle="Purchase expenses"
          icon={Package}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="two-column">
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <TrendingUp size={18} />
              Monthly Trends
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000000}M`} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Area type="monotone" dataKey="sales_amount" name="Sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchase_amount" name="Purchases" stroke="#ef4444" fillOpacity={1} fill="url(#colorPurchase)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <Wallet size={18} />
              Cash & Bank Balances
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cashBankBalances}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="closing_balance"
                >
                  {cashBankBalances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cash & Bank Transactions */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">
            <CreditCard size={18} />
            Cash & Bank Transactions
          </h3>
          <div className="section-actions">
            <select 
              className="select-input"
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="inflow">Inflow Only</option>
              <option value="outflow">Outflow Only</option>
            </select>
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
                <th>Date</th>
                <th>Voucher</th>
                <th>Type</th>
                <th>Party Name</th>
                <th>Account</th>
                <th>Direction</th>
                <th className="numeric">Amount</th>
                <th>Payment Mode</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{formatDate(txn.date)}</td>
                  <td>{txn.voucher_number}</td>
                  <td>{txn.voucher_type}</td>
                  <td>{txn.party_name}</td>
                  <td>{txn.account_name}</td>
                  <td>
                    <span className={`badge ${txn.transaction_direction === 'Inflow' ? 'badge-success' : 'badge-danger'}`}>
                      {txn.transaction_direction}
                    </span>
                  </td>
                  <td className="numeric">{formatCurrency(txn.absolute_amount)}</td>
                  <td>{txn.payment_mode}</td>
                  <td>{txn.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory & Payables */}
      <div className="two-column">
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <Package size={18} />
              Recent Inventory Movements
            </h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Party</th>
                  <th>Type</th>
                  <th className="numeric">Qty</th>
                  <th className="numeric">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inventorySummary.slice(0, 6).map((item, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.stock_item_name}</td>
                    <td>{item.party_name}</td>
                    <td>
                      <span className={`badge ${item.voucher_type === 'Sales' ? 'badge-success' : 'badge-warning'}`}>
                        {item.voucher_type}
                      </span>
                    </td>
                    <td className="numeric">{item.billed_qty}</td>
                    <td className="numeric">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <TrendingDown size={18} />
              Payables Summary
            </h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Party Name</th>
                  <th className="numeric">Amount Due</th>
                  <th>Days Since Last Txn</th>
                  <th>Last Transaction</th>
                </tr>
              </thead>
              <tbody>
                {payablesSummary.filter(p => p.payable_amount > 0).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.party_name}</td>
                    <td className="numeric">{formatCurrency(item.payable_amount)}</td>
                    <td>
                      <span className={`badge ${item.days_since_last_txn > 30 ? 'badge-warning' : 'badge-success'}`}>
                        {item.days_since_last_txn} days
                      </span>
                    </td>
                    <td>{formatDate(item.last_transaction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
