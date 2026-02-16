import { useState } from 'react';
import { 
  AlertTriangle, Users, Package, Clock, TrendingDown, 
  Mail, Phone, ArrowRight, Filter, AlertCircle 
} from 'lucide-react';
import { inactiveCustomers, inactiveStocks } from '../../data/dummyData';

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

const AlertCard = ({ title, count, icon: Icon, color, description }) => (
  <div className="kpi-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="kpi-header">
      <div>
        <span className="kpi-label">{title}</span>
        <div style={{ fontSize: '2rem', fontWeight: 700, color, marginTop: '8px' }}>
          {count}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
          {description}
        </p>
      </div>
      <div className={`kpi-icon`} style={{ background: `${color}15`, color }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function NeedAttentionTab() {
  const [customerDays, setCustomerDays] = useState(90);
  const [stockDays, setStockDays] = useState(90);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCustomers = inactiveCustomers.filter(c => c.days_since_last_txn >= customerDays);
  const filteredStocks = inactiveStocks.filter(s => s.days_since_last_movement >= stockDays);

  const totalCustomerValue = filteredCustomers.reduce((sum, c) => sum + c.closing_balance, 0);
  const totalStockValue = filteredStocks.reduce((sum, s) => sum + s.closing_value, 0);

  return (
    <div className="fade-in">
      {/* Alert Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <AlertCard 
          title="Inactive Customers"
          count={filteredCustomers.length}
          icon={Users}
          color="#ef4444"
          description="No transactions in 90+ days"
        />
        <AlertCard 
          title="Inactive Stock Items"
          count={filteredStocks.length}
          icon={Package}
          color="#f59e0b"
          description="No movement in 90+ days"
        />
        <AlertCard 
          title="Customer Outstanding"
          value={formatCurrency(totalCustomerValue)}
          icon={TrendingDown}
          color="#8b5cf6"
          description="Total receivables at risk"
        />
        <AlertCard 
          title="Dead Stock Value"
          value={formatCurrency(totalStockValue)}
          icon={AlertCircle}
          color="#06b6d4"
          description="Capital tied in inactive stock"
        />
      </div>

      <div className="two-column">
        {/* Inactive Customers Section */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <AlertTriangle size={18} color="#ef4444" />
              Inactive Customers
            </h3>
            <div className="section-actions">
              <select 
                className="select-input"
                value={customerDays}
                onChange={(e) => setCustomerDays(Number(e.target.value))}
              >
                <option value={30}>30+ days inactive</option>
                <option value={60}>60+ days inactive</option>
                <option value={90}>90+ days inactive</option>
                <option value={180}>180+ days inactive</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>
                Attention Required
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
              {filteredCustomers.length} customers have not made any transactions in the last {customerDays} days. 
              Total outstanding balance: {formatCurrency(totalCustomerValue)}
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th className="numeric">Balance</th>
                  <th>Last Transaction</th>
                  <th>Days Inactive</th>
                  <th className="numeric">Lifetime Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{customer.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {customer.total_transactions} transactions
                        </div>
                      </div>
                    </td>
                    <td className="numeric" style={{ fontWeight: 600, color: '#ef4444' }}>
                      {formatCurrency(customer.closing_balance)}
                    </td>
                    <td>
                      <div>
                        <div>{formatDate(customer.last_transaction_date)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {customer.last_voucher}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${customer.days_since_last_txn > 180 ? 'badge-danger' : 'badge-warning'}`}>
                        <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                        {customer.days_since_last_txn} days
                      </span>
                    </td>
                    <td className="numeric">{formatCurrency(customer.total_sales_value)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" title="Send Email">
                          <Mail size={14} />
                        </button>
                        <button className="btn btn-sm btn-secondary" title="Call Customer">
                          <Phone size={14} />
                        </button>
                        <button className="btn btn-sm btn-primary" title="View Details">
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No inactive customers found for the selected period.</p>
            </div>
          )}
        </div>

        {/* Inactive Stocks Section */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <Package size={18} color="#f59e0b" />
              Inactive Stock Items
            </h3>
            <div className="section-actions">
              <select 
                className="select-input"
                value={stockDays}
                onChange={(e) => setStockDays(Number(e.target.value))}
              >
                <option value={30}>30+ days</option>
                <option value={60}>60+ days</option>
                <option value={90}>90+ days</option>
                <option value={180}>180+ days</option>
                <option value={365}>365+ days</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={16} color="#f59e0b" />
              <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>
                Stock Alert
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
              {filteredStocks.length} stock items have not had any movement in the last {stockDays} days. 
              Total value at risk: {formatCurrency(totalStockValue)}
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock Item</th>
                  <th>Category</th>
                  <th className="numeric">Closing Qty</th>
                  <th className="numeric">Stock Value</th>
                  <th>Last Movement</th>
                  <th className="numeric">Lifetime Sales</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.stock_item_name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{item.category}</span>
                    </td>
                    <td className="numeric">{item.closing_qty}</td>
                    <td className="numeric" style={{ fontWeight: 500 }}>
                      {formatCurrency(item.closing_value)}
                    </td>
                    <td>
                      <div>
                        <span className={`badge ${item.days_since_last_movement > 365 ? 'badge-danger' : 'badge-warning'}`}>
                          <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                          {item.days_since_last_movement} days
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                          {item.last_movement_date ? formatDate(item.last_movement_date) : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="numeric">
                      <div>
                        <div>{formatCurrency(item.total_sold_value)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Qty: {item.total_sold_qty}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStocks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No inactive stock items found for the selected period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">
            <AlertCircle size={18} />
            Recommended Actions
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <h4 style={{ fontWeight: 600, color: '#991b1b', marginBottom: '8px' }}>
              Follow-up Campaign
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '12px' }}>
              Send reminder emails to {filteredCustomers.length} inactive customers about their outstanding balance.
            </p>
            <button className="btn btn-sm" style={{ background: '#ef4444', color: 'white' }}>
              <Mail size={14} style={{ marginRight: '4px', display: 'inline' }} />
              Send Campaign
            </button>
          </div>
          
          <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <h4 style={{ fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
              Stock Clearance
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '12px' }}>
              Consider discounting or bundling {filteredStocks.length} inactive stock items to free up capital.
            </p>
            <button className="btn btn-sm" style={{ background: '#f59e0b', color: 'white' }}>
              <Filter size={14} style={{ marginRight: '4px', display: 'inline' }} />
              Create Offers
            </button>
          </div>
          
          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>
              Review Credit Limits
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#1e3a8a', marginBottom: '12px' }}>
              Review and potentially reduce credit limits for customers with long inactivity periods.
            </p>
            <button className="btn btn-sm" style={{ background: '#2563eb', color: 'white' }}>
              <ArrowRight size={14} style={{ marginRight: '4px', display: 'inline' }} />
              Review Limits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
