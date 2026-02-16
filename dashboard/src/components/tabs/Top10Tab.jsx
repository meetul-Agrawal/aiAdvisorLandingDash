import { useState } from 'react';
import { 
  Trophy, Users, Package, TrendingUp, TrendingDown,
  ChevronUp, ChevronDown, Medal, Download, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  topCustomersByValue, topSuppliersByValue, topItemsByQuantity, 
  topItemsByValue, topItemsPurchaseQty, topItemsPurchaseValue 
} from '../../data/dummyData';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const COLORS = ['#f59e0b', '#64748b', '#b45309', '#9ca3af', '#d97706', '#6b7280', '#92400e', '#4b5563', '#b45309', '#374151'];

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Medal size={20} color="#f59e0b" />;
  if (rank === 2) return <span style={{ color: '#64748b', fontWeight: 700, fontSize: '1.25rem' }}>#2</span>;
  if (rank === 3) return <span style={{ color: '#b45309', fontWeight: 700, fontSize: '1.25rem' }}>#3</span>;
  return <span style={{ color: '#64748b', fontWeight: 600 }}>#{rank}</span>;
};

const Top10Card = ({ title, data, columns, icon: Icon, color }) => (
  <div className="section" style={{ margin: 0, height: '100%' }}>
    <div className="section-header">
      <h3 className="section-title">
        <Icon size={18} color={color} />
        {title}
      </h3>
      <button className="btn btn-secondary btn-sm">
        <Download size={14} />
      </button>
    </div>
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>Rank</th>
            {columns.map((col, idx) => (
              <th key={idx} className={col.numeric ? 'numeric' : ''}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} style={{ background: idx < 3 ? `${color}08` : 'transparent' }}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RankBadge rank={item.rank} />
                </div>
              </td>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={col.numeric ? 'numeric' : ''} style={{ fontWeight: idx < 3 ? 500 : 'normal' }}>
                  {col.formatter ? col.formatter(item[col.key]) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ChartCard = ({ title, data, dataKey, nameKey, color, icon: Icon }) => (
  <div className="section" style={{ margin: 0 }}>
    <div className="section-header">
      <h3 className="section-title">
        <Icon size={18} color={color} />
        {title}
      </h3>
    </div>
    <div className="chart-container" style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 11}} />
          <YAxis dataKey={nameKey} type="category" width={120} tick={{fontSize: 11}} />
          <Tooltip formatter={(val) => formatCurrency(val)} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index] || color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function Top10Tab() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="fade-in">
      {/* Navigation Tabs */}
      <div className="section" style={{ marginBottom: '20px', padding: '12px 20px' }}>
        <div className="tabs" style={{ margin: 0, border: 'none' }}>
          <button 
            className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Sales Leaders
          </button>
          <button 
            className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchase')}
          >
            <TrendingDown size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Purchase Leaders
          </button>
          <button 
            className={`tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Package size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Item Rankings
          </button>
        </div>
      </div>

      {/* Sales Leaders Tab */}
      {activeTab === 'sales' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <Top10Card 
              title="Top 10 Customers by Value"
              data={topCustomersByValue}
              icon={Users}
              color="#2563eb"
              columns={[
                { header: 'Customer', key: 'customer_name' },
                { header: 'Sales Value', key: 'total_sales_value', numeric: true, formatter: formatCurrency },
                { header: 'Transactions', key: 'transaction_count', numeric: true, formatter: formatNumber },
                { header: 'Avg/Txn', key: 'avg_transaction_value', numeric: true, formatter: formatCurrency }
              ]}
            />
            <ChartCard 
              title="Customer Sales Value Chart"
              data={topCustomersByValue}
              dataKey="total_sales_value"
              nameKey="customer_name"
              color="#2563eb"
              icon={TrendingUp}
            />
          </div>

          <div className="section">
            <div className="section-header">
              <h3 className="section-title">
                <Trophy size={18} color="#f59e0b" />
                Customer Performance Summary
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#eff6ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>
                  {formatCurrency(topCustomersByValue[0]?.total_sales_value || 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top Customer Sales
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px' }}>
                  {topCustomersByValue[0]?.customer_name}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                  {formatNumber(topCustomersByValue.reduce((sum, c) => sum + c.transaction_count, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Total Transactions
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fffbeb', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                  {formatCurrency(topCustomersByValue.reduce((sum, c) => sum + c.total_sales_value, 0) / topCustomersByValue.length)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Avg Customer Value
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fdf4ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>
                  {formatCurrency(topCustomersByValue.reduce((sum, c) => sum + c.total_sales_value, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top 10 Total
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Purchase Leaders Tab */}
      {activeTab === 'purchase' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <Top10Card 
              title="Top 10 Suppliers by Value"
              data={topSuppliersByValue}
              icon={Users}
              color="#f59e0b"
              columns={[
                { header: 'Supplier', key: 'supplier_name' },
                { header: 'Purchase Value', key: 'total_purchase_value', numeric: true, formatter: formatCurrency },
                { header: 'Transactions', key: 'transaction_count', numeric: true, formatter: formatNumber },
                { header: 'Avg/Txn', key: 'avg_transaction_value', numeric: true, formatter: formatCurrency }
              ]}
            />
            <ChartCard 
              title="Supplier Purchase Value Chart"
              data={topSuppliersByValue}
              dataKey="total_purchase_value"
              nameKey="supplier_name"
              color="#f59e0b"
              icon={TrendingDown}
            />
          </div>

          <div className="section">
            <div className="section-header">
              <h3 className="section-title">
                <Trophy size={18} color="#f59e0b" />
                Supplier Performance Summary
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fffbeb', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                  {formatCurrency(topSuppliersByValue[0]?.total_purchase_value || 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top Supplier Purchases
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                  {topSuppliersByValue[0]?.supplier_name}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fefce8', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ca8a04' }}>
                  {formatNumber(topSuppliersByValue.reduce((sum, s) => sum + s.transaction_count, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Total Transactions
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fff7ed', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ea580c' }}>
                  {formatCurrency(topSuppliersByValue.reduce((sum, s) => sum + s.total_purchase_value, 0) / topSuppliersByValue.length)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Avg Supplier Value
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fdf2f8', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#db2777' }}>
                  {formatCurrency(topSuppliersByValue.reduce((sum, s) => sum + s.total_purchase_value, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top 10 Total
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Item Rankings Tab */}
      {activeTab === 'items' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <Top10Card 
              title="Top 10 Items Sold by Value"
              data={topItemsByValue}
              icon={Package}
              color="#10b981"
              columns={[
                { header: 'Item Name', key: 'stock_item_name' },
                { header: 'Sales Value', key: 'total_sales_value', numeric: true, formatter: formatCurrency },
                { header: 'Qty Sold', key: 'total_quantity_sold', numeric: true, formatter: formatNumber },
                { header: 'Avg Rate', key: 'avg_selling_rate', numeric: true, formatter: formatCurrency }
              ]}
            />
            <Top10Card 
              title="Top 10 Items Sold by Quantity"
              data={topItemsByQuantity}
              icon={Package}
              color="#06b6d4"
              columns={[
                { header: 'Item Name', key: 'stock_item_name' },
                { header: 'Qty Sold', key: 'total_quantity_sold', numeric: true, formatter: formatNumber },
                { header: 'Sales Value', key: 'total_sales_value', numeric: true, formatter: formatCurrency },
                { header: 'Avg Rate', key: 'avg_selling_rate', numeric: true, formatter: formatCurrency }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <Top10Card 
              title="Top 10 Items Purchased by Value"
              data={topItemsPurchaseValue}
              icon={Package}
              color="#8b5cf6"
              columns={[
                { header: 'Item Name', key: 'stock_item_name' },
                { header: 'Purchase Value', key: 'total_purchase_value', numeric: true, formatter: formatCurrency },
                { header: 'Qty Purchased', key: 'total_quantity_purchased', numeric: true, formatter: formatNumber },
                { header: 'Avg Rate', key: 'avg_purchase_rate', numeric: true, formatter: formatCurrency }
              ]}
            />
            <Top10Card 
              title="Top 10 Items Purchased by Quantity"
              data={topItemsPurchaseQty}
              icon={Package}
              color="#ec4899"
              columns={[
                { header: 'Item Name', key: 'stock_item_name' },
                { header: 'Qty Purchased', key: 'total_quantity_purchased', numeric: true, formatter: formatNumber },
                { header: 'Purchase Value', key: 'total_purchase_value', numeric: true, formatter: formatCurrency },
                { header: 'Avg Rate', key: 'avg_purchase_rate', numeric: true, formatter: formatCurrency }
              ]}
            />
          </div>

          <div className="section">
            <div className="section-header">
              <h3 className="section-title">
                <Trophy size={18} color="#10b981" />
                Item Performance Summary
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                  {formatCurrency(topItemsByValue[0]?.total_sales_value || 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Best Selling Item
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                  {topItemsByValue[0]?.stock_item_name}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#eff6ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>
                  {formatNumber(topItemsByQuantity[0]?.total_quantity_sold || 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Most Units Sold
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px' }}>
                  {topItemsByQuantity[0]?.stock_item_name}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#faf5ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#9333ea' }}>
                  {formatCurrency(topItemsByValue.reduce((sum, i) => sum + i.total_sales_value, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top 10 Sales Total
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fdf4ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c026d3' }}>
                  {formatNumber(topItemsByQuantity.reduce((sum, i) => sum + i.total_quantity_sold, 0))}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
                  Top 10 Units Sold
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
