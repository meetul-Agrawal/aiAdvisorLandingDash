import { useState } from 'react';
import { 
  Wallet, Landmark, ArrowDownLeft, ArrowUpRight, Download,
  Filter, Calendar, TrendingUp, TrendingDown, RefreshCw,
  MoreHorizontal, CreditCard, Banknote, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  cashBankBalances, cashBankTransactions, cashPosition, bankPosition, cashFlowDaily 
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

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
          {trend > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
      {subtitle}
    </div>
  </div>
);

export default function CashBankTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');

  const totalCash = cashPosition.reduce((sum, c) => sum + c.closing_balance, 0);
  const totalBank = bankPosition.reduce((sum, b) => sum + b.closing_balance, 0);
  const totalLiquidity = totalCash + totalBank;

  const mtdInflow = cashFlowDaily.reduce((sum, d) => sum + d.inflow, 0);
  const mtdOutflow = cashFlowDaily.reduce((sum, d) => sum + d.outflow, 0);
  const netFlow = mtdInflow - mtdOutflow;

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Cash" 
          value={formatCurrency(totalCash)}
          subtitle="Cash-in-hand"
          icon={Banknote}
          color="green"
        />
        <KPICard 
          title="Total Bank" 
          value={formatCurrency(totalBank)}
          subtitle="All bank accounts"
          icon={Landmark}
          color="blue"
        />
        <KPICard 
          title="Total Liquidity" 
          value={formatCurrency(totalLiquidity)}
          subtitle="Cash + Bank"
          icon={Wallet}
          color="purple"
          trend={12.5}
        />
        <KPICard 
          title="Net Cash Flow (MTD)" 
          value={formatCurrency(netFlow)}
          subtitle={`In: ${formatCurrency(mtdInflow)} | Out: ${formatCurrency(mtdOutflow)}`}
          icon={netFlow >= 0 ? ArrowUpRight : TrendingDown}
          color={netFlow >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Sub Tabs */}
      <div className="section">
        <div className="tabs">
          <button 
            className={`tab ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeSubTab === 'cash' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('cash')}
          >
            Cash Accounts
          </button>
          <button 
            className={`tab ${activeSubTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('bank')}
          >
            Bank Accounts
          </button>
          <button 
            className={`tab ${activeSubTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`tab ${activeSubTab === 'cashflow' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('cashflow')}
          >
            Cash Flow
          </button>
        </div>

        {/* Overview */}
        {activeSubTab === 'overview' && (
          <div className="two-column">
            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <Wallet size={18} />
                  Liquidity Distribution
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Cash', value: totalCash },
                        { name: 'HDFC Bank', value: 3250000 },
                        { name: 'ICICI Bank', value: 2750000 },
                        { name: 'SBI Bank', value: 2750000 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[totalCash, 3250000, 2750000, 2750000].map((entry, index) => (
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
                  <RefreshCw size={18} />
                  Account Summary
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cashBankBalances.map((account, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '16px', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: account.account_type === 'Cash' ? '#10b98115' : '#3b82f615',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: account.account_type === 'Cash' ? '#10b981' : '#3b82f6'
                      }}>
                        {account.account_type === 'Cash' ? <Banknote size={20} /> : <Landmark size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{account.ledger_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{account.parent_group}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                        {formatCurrency(account.closing_balance)}
                      </div>
                      <span className={`badge ${account.closing_balance > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {account.account_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cash Accounts */}
        {activeSubTab === 'cash' && (
          <>
            <div className="filter-bar">
              <select className="select-input">
                <option>All Cash Accounts</option>
                <option>Main Cash</option>
                <option>Petty Cash</option>
              </select>
              <input type="date" className="select-input" />
              <input type="date" className="select-input" />
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th className="numeric">Opening</th>
                    <th className="numeric">Closing</th>
                    <th className="numeric">MTD Movement</th>
                    <th className="numeric">MTD Inflow</th>
                    <th className="numeric">MTD Outflow</th>
                    <th>Last Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {cashPosition.map((cash, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Banknote size={16} color="#10b981" />
                        {cash.cash_account}
                      </td>
                      <td className="numeric">{formatCurrency(cash.opening_balance)}</td>
                      <td className="numeric" style={{ fontWeight: 600, color: '#10b981' }}>
                        {formatCurrency(cash.closing_balance)}
                      </td>
                      <td className="numeric">
                        <span style={{ color: cash.mtd_movement >= 0 ? '#10b981' : '#ef4444' }}>
                          {cash.mtd_movement >= 0 ? '+' : ''}{formatCurrency(cash.mtd_movement)}
                        </span>
                      </td>
                      <td className="numeric" style={{ color: '#10b981' }}>
                        +{formatCurrency(cash.mtd_inflow)}
                      </td>
                      <td className="numeric" style={{ color: '#ef4444' }}>
                        -{formatCurrency(cash.mtd_outflow)}
                      </td>
                      <td>{cash.days_since_last_txn} days ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bank Accounts */}
        {activeSubTab === 'bank' && (
          <>
            <div className="filter-bar">
              <select className="select-input">
                <option>All Banks</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>SBI Bank</option>
              </select>
              <input type="date" className="select-input" />
              <input type="date" className="select-input" />
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bank Account</th>
                    <th>Account #</th>
                    <th className="numeric">Opening</th>
                    <th className="numeric">Closing</th>
                    <th className="numeric">MTD Movement</th>
                    <th className="numeric">MTD Inflow</th>
                    <th className="numeric">MTD Outflow</th>
                    <th>Preferred Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {bankPosition.map((bank, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Landmark size={16} color="#3b82f6" />
                        {bank.bank_account}
                      </td>
                      <td>{bank.account_number}</td>
                      <td className="numeric">{formatCurrency(bank.opening_balance)}</td>
                      <td className="numeric" style={{ fontWeight: 600, color: '#3b82f6' }}>
                        {formatCurrency(bank.closing_balance)}
                      </td>
                      <td className="numeric">
                        <span style={{ color: bank.mtd_movement >= 0 ? '#10b981' : '#ef4444' }}>
                          {bank.mtd_movement >= 0 ? '+' : ''}{formatCurrency(bank.mtd_movement)}
                        </span>
                      </td>
                      <td className="numeric" style={{ color: '#10b981' }}>
                        +{formatCurrency(bank.mtd_inflow)}
                      </td>
                      <td className="numeric" style={{ color: '#ef4444' }}>
                        -{formatCurrency(bank.mtd_outflow)}
                      </td>
                      <td>
                        <span className="badge badge-info">{bank.preferred_payment_mode}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Transactions */}
        {activeSubTab === 'transactions' && (
          <>
            <div className="filter-bar">
              <select className="select-input">
                <option>All Transactions</option>
                <option>Inflow Only</option>
                <option>Outflow Only</option>
              </select>
              <select className="select-input">
                <option>All Accounts</option>
                <option>Cash Account</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>SBI Bank</option>
              </select>
              <input type="date" className="select-input" />
              <input type="date" className="select-input" />
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Account</th>
                    <th>Direction</th>
                    <th className="numeric">Amount</th>
                    <th>Mode</th>
                    <th>Instrument #</th>
                    <th>Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {cashBankTransactions.map((txn, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(txn.date)}</td>
                      <td>{txn.voucher_number}</td>
                      <td>{txn.voucher_type}</td>
                      <td>{txn.party_name}</td>
                      <td>{txn.account_name}</td>
                      <td>
                        <span className={`badge ${txn.transaction_direction === 'Inflow' ? 'badge-success' : 'badge-danger'}`}>
                          {txn.transaction_direction === 'Inflow' ? (
                            <ArrowDownLeft size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          ) : (
                            <ArrowUpRight size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          )}
                          {txn.transaction_direction}
                        </span>
                      </td>
                      <td className="numeric" style={{ fontWeight: 600 }}>
                        {formatCurrency(txn.absolute_amount)}
                      </td>
                      <td>{txn.payment_mode}</td>
                      <td>{txn.instrument_number}</td>
                      <td>{txn.narration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Cash Flow */}
        {activeSubTab === 'cashflow' && (
          <>
            <div className="filter-bar">
              <select 
                className="select-input"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
              <button className="btn btn-secondary btn-sm">
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="chart-container large">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val/1000}K`} />
                  <Tooltip 
                    formatter={(val) => formatCurrency(val)}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Legend />
                  <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="net_flow" name="Net Flow" stroke="#3b82f6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="section" style={{ marginTop: '20px' }}>
              <div className="section-header">
                <h3 className="section-title">
                  <RefreshCw size={18} />
                  Daily Cash Flow Summary
                </h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Account</th>
                      <th>Type</th>
                      <th className="numeric">Inflow</th>
                      <th className="numeric">Outflow</th>
                      <th className="numeric">Net Flow</th>
                      <th className="numeric">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowDaily.map((flow, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(flow.date)}</td>
                        <td>{flow.account_name}</td>
                        <td>
                          <span className={`badge ${flow.account_type === 'Cash' ? 'badge-success' : 'badge-info'}`}>
                            {flow.account_type}
                          </span>
                        </td>
                        <td className="numeric" style={{ color: '#10b981' }}>
                          +{formatCurrency(flow.inflow)}
                        </td>
                        <td className="numeric" style={{ color: '#ef4444' }}>
                          -{formatCurrency(flow.outflow)}
                        </td>
                        <td className="numeric" style={{ fontWeight: 600, color: flow.net_flow >= 0 ? '#10b981' : '#ef4444' }}>
                          {flow.net_flow >= 0 ? '+' : ''}{formatCurrency(flow.net_flow)}
                        </td>
                        <td className="numeric">{flow.transaction_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
