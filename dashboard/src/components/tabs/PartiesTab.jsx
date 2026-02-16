import { useState } from 'react';
import { 
  Users, UserCheck, UserMinus, Building2, Phone, Mail, MapPin,
  Download, Filter, Search, ChevronRight, MoreHorizontal,
  TrendingUp, TrendingDown, CreditCard, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { partyMaster } from '../../data/dummyData';

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

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

const KPICard = ({ title, value, subtitle, icon: Icon, color, count }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <span className="kpi-label">{title}</span>
      <div className={`kpi-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="kpi-value">{count}</div>
    <div className="kpi-subtitle">
      {value && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>}
      {subtitle}
    </div>
  </div>
);

export default function PartiesTab() {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);

  const customers = partyMaster.filter(p => p.party_type === 'Customer');
  const suppliers = partyMaster.filter(p => p.party_type === 'Supplier');
  const others = partyMaster.filter(p => p.party_type === 'Other');

  const filteredParties = partyMaster.filter(party => {
    if (activeSubTab === 'all') return true;
    return party.party_type.toLowerCase() === activeSubTab.toLowerCase();
  }).filter(party => 
    party.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (party.gstin && party.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalReceivables = customers.reduce((sum, c) => sum + (c.closing_balance > 0 ? c.closing_balance : 0), 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + (s.closing_balance > 0 ? s.closing_balance : 0), 0);

  const partyTypeData = [
    { name: 'Customers', value: customers.length },
    { name: 'Suppliers', value: suppliers.length },
    { name: 'Others', value: others.length }
  ];

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Parties" 
          count={partyMaster.length}
          subtitle="Active accounts"
          icon={Users}
          color="blue"
        />
        <KPICard 
          title="Customers" 
          count={customers.length}
          value={formatCurrency(totalReceivables)}
          subtitle=" total receivables"
          icon={UserCheck}
          color="green"
        />
        <KPICard 
          title="Suppliers" 
          count={suppliers.length}
          value={formatCurrency(totalPayables)}
          subtitle=" total payables"
          icon={UserMinus}
          color="orange"
        />
        <KPICard 
          title="Other Ledgers" 
          count={others.length}
          subtitle="Bank, Cash, Expenses"
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Sub Tabs */}
      <div className="section">
        <div className="tabs">
          <button 
            className={`tab ${activeSubTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('all')}
          >
            All Parties
          </button>
          <button 
            className={`tab ${activeSubTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('customer')}
          >
            <UserCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Customers
          </button>
          <button 
            className={`tab ${activeSubTab === 'supplier' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('supplier')}
          >
            <UserMinus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Suppliers
          </button>
          <button 
            className={`tab ${activeSubTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('other')}
          >
            <Building2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Others
          </button>
        </div>

        {/* Charts for Overview */}
        {activeSubTab === 'all' && (
          <div className="two-column" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <Users size={18} />
                  Party Distribution
                </h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {partyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                <h3 className="section-title">
                  <TrendingUp size={18} />
                  Balance Summary
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: '#f0fdf4', 
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserCheck size={24} color="#10b981" />
                      <div>
                        <div style={{ fontWeight: 600 }}>Total Receivables</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>From {customers.length} customers</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(totalReceivables)}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: '#fffbeb', 
                  borderRadius: '8px',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserMinus size={24} color="#f59e0b" />
                      <div>
                        <div style={{ fontWeight: 600 }}>Total Payables</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>To {suppliers.length} suppliers</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                      {formatCurrency(totalPayables)}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: '#eff6ff', 
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CreditCard size={24} color="#3b82f6" />
                      <div>
                        <div style={{ fontWeight: 600 }}>Net Position</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Receivables - Payables</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                      {formatCurrency(totalReceivables - totalPayables)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name or GSTIN..."
              className="search-input"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="select-input">
            <option>All Groups</option>
            <option>Sundry Debtors</option>
            <option>Sundry Creditors</option>
            <option>Bank Accounts</option>
            <option>Cash-in-Hand</option>
          </select>
          <select className="select-input">
            <option>Sort by Balance</option>
            <option>Sort by Name</option>
            <option>Sort by Transactions</option>
          </select>
          <button className="btn btn-secondary btn-sm">
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Party List */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Type</th>
                <th>Group</th>
                <th>GSTIN</th>
                <th>Contact</th>
                <th className="numeric">Opening</th>
                <th className="numeric">Closing</th>
                <th>Status</th>
                <th className="numeric">Transactions</th>
                <th>Last Txn</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParties.map((party, idx) => (
                <tr key={idx} onClick={() => setSelectedParty(party)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 500 }}>{party.party_name}</td>
                  <td>
                    <span className={`badge ${
                      party.party_type === 'Customer' ? 'badge-success' :
                      party.party_type === 'Supplier' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {party.party_type}
                    </span>
                  </td>
                  <td>{party.group_name}</td>
                  <td>{party.gstin || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {party.phone && <Phone size={14} color="#64748b" />}
                      {party.email && <Mail size={14} color="#64748b" />}
                    </div>
                  </td>
                  <td className="numeric">{formatCurrency(party.opening_balance)}</td>
                  <td className="numeric" style={{ 
                    fontWeight: 600, 
                    color: party.closing_balance > 0 ? '#10b981' : party.closing_balance < 0 ? '#ef4444' : 'inherit'
                  }}>
                    {formatCurrency(Math.abs(party.closing_balance))}
                  </td>
                  <td>
                    <span className={`badge ${
                      party.balance_status === 'Receivable' ? 'badge-success' :
                      party.balance_status === 'Payable' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {party.balance_status}
                    </span>
                  </td>
                  <td className="numeric">{party.total_transactions}</td>
                  <td>{formatDate(party.last_transaction_date)}</td>
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

        {/* Party Detail Modal */}
        {selectedParty && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setSelectedParty(null)}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              width: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '24px'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedParty.party_name}</h3>
                <button onClick={() => setSelectedParty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Party Type</div>
                  <span className={`badge ${
                    selectedParty.party_type === 'Customer' ? 'badge-success' :
                    selectedParty.party_type === 'Supplier' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {selectedParty.party_type}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Group</div>
                  <div>{selectedParty.group_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>GSTIN</div>
                  <div>{selectedParty.gstin || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>State</div>
                  <div>{selectedParty.state_name || '-'}</div>
                </div>
                {selectedParty.email && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Email</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} />
                      {selectedParty.email}
                    </div>
                  </div>
                )}
                {selectedParty.phone && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Phone</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} />
                      {selectedParty.phone}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '16px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Opening Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {formatCurrency(selectedParty.opening_balance)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Closing Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: selectedParty.closing_balance > 0 ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(Math.abs(selectedParty.closing_balance))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Transactions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {selectedParty.total_transactions}
                  </div>
                </div>
              </div>

              {selectedParty.total_sales > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Sales Summary</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Sales</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(selectedParty.total_sales)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span>Total Receipts</span>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(selectedParty.total_receipts)}</span>
                  </div>
                </div>
              )}

              {selectedParty.total_purchases > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Purchase Summary</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Purchases</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(selectedParty.total_purchases)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span>Total Payments</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{formatCurrency(selectedParty.total_payments)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary">
                  <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  View Ledger
                </button>
                <button className="btn btn-primary">
                  <ChevronRight size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
