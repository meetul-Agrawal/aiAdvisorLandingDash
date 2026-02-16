import { useState } from 'react';
import { 
  Package, PackageCheck, PackageX, TrendingUp, TrendingDown,
  Download, Filter, Search, ChevronRight, MoreHorizontal,
  BarChart3, AlertCircle, Grid3X3, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  stockItemMaster, itemMovementHistory, stockSummaryByCategory 
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

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const KPICard = ({ title, value, subtitle, icon: Icon, color, count }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <span className="kpi-label">{title}</span>
      <div className={`kpi-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="kpi-value">{count || value}</div>
    <div className="kpi-subtitle">
      {subtitle}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    'Out of Stock': { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
    'Low': { bg: '#fffbeb', color: '#f59e0b', border: '#fcd34d' },
    'Normal': { bg: '#f0fdf4', color: '#10b981', border: '#bbf7d0' }
  };
  const style = colors[status] || colors['Normal'];
  
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`
    }}>
      {status}
    </span>
  );
};

export default function ItemsTab() {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const totalItems = stockItemMaster.length;
  const totalStockValue = stockItemMaster.reduce((sum, item) => sum + item.closing_value, 0);
  const lowStockItems = stockItemMaster.filter(item => item.stock_status === 'Low').length;
  const outOfStockItems = stockItemMaster.filter(item => item.closing_qty === 0).length;

  const filteredItems = stockItemMaster.filter(item => {
    if (activeSubTab === 'low') return item.stock_status === 'Low' || item.closing_qty === 0;
    if (activeSubTab === 'active') return item.total_sold_qty > 0;
    return true;
  }).filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  }).filter(item =>
    item.stock_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.hsn_code && item.hsn_code.includes(searchTerm))
  );

  const categories = [...new Set(stockItemMaster.map(item => item.category))];

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Items" 
          count={totalItems}
          subtitle="Active stock items"
          icon={Package}
          color="blue"
        />
        <KPICard 
          title="Stock Value" 
          value={formatCurrency(totalStockValue)}
          subtitle="Total inventory value"
          icon={BarChart3}
          color="green"
        />
        <KPICard 
          title="Low Stock" 
          count={lowStockItems}
          subtitle="Items needing attention"
          icon={AlertCircle}
          color="orange"
        />
        <KPICard 
          title="Out of Stock" 
          count={outOfStockItems}
          subtitle="Items to reorder"
          icon={PackageX}
          color="red"
        />
      </div>

      {/* Sub Tabs */}
      <div className="section">
        <div className="tabs">
          <button 
            className={`tab ${activeSubTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('all')}
          >
            All Items
          </button>
          <button 
            className={`tab ${activeSubTab === 'low' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('low')}
          >
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Low Stock
          </button>
          <button 
            className={`tab ${activeSubTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('active')}
          >
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Active Items
          </button>
          <button 
            className={`tab ${activeSubTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('categories')}
          >
            <Layers size={16} style={{ display: 'inline', marginRight: '6px' }} />
            By Category
          </button>
        </div>

        {/* Category View */}
        {activeSubTab === 'categories' && (
          <>
            <div className="two-column" style={{ marginBottom: '20px' }}>
              <div>
                <div className="section-header" style={{ padding: 0, marginBottom: '16px' }}>
                  <h3 className="section-title">
                    <Grid3X3 size={18} />
                    Category Distribution
                  </h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockSummaryByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, item_count }) => `${category}: ${item_count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="item_count"
                        nameKey="category"
                      >
                        {stockSummaryByCategory.map((entry, index) => (
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
                    <BarChart3 size={18} />
                    Stock Value by Category
                  </h3>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockSummaryByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 11}} />
                      <YAxis dataKey="category" type="category" width={100} tick={{fontSize: 11}} />
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Bar dataKey="total_closing_value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="numeric">Items</th>
                    <th className="numeric">Closing Qty</th>
                    <th className="numeric">Stock Value</th>
                    <th className="numeric">Sold Qty</th>
                    <th className="numeric">Sold Value</th>
                    <th className="numeric">Purchased Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {stockSummaryByCategory.map((cat, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{cat.category}</td>
                      <td className="numeric">{cat.item_count}</td>
                      <td className="numeric">{formatNumber(cat.total_closing_qty)}</td>
                      <td className="numeric" style={{ fontWeight: 600 }}>
                        {formatCurrency(cat.total_closing_value)}
                      </td>
                      <td className="numeric">{formatNumber(cat.total_sold_qty || 0)}</td>
                      <td className="numeric">{formatCurrency(cat.total_sold_value || 0)}</td>
                      <td className="numeric">{formatNumber(cat.total_purchased_qty || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Items List */}
        {activeSubTab !== 'categories' && (
          <>
            <div className="filter-bar">
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search by item name or HSN..."
                  className="search-input"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="select-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select className="select-input">
                <option>Sort by Value</option>
                <option>Sort by Name</option>
                <option>Sort by Qty</option>
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
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>HSN</th>
                    <th className="numeric">GST %</th>
                    <th>Unit</th>
                    <th className="numeric">Opening Qty</th>
                    <th className="numeric">Closing Qty</th>
                    <th className="numeric">Stock Value</th>
                    <th>Status</th>
                    <th className="numeric">Lifetime Sales</th>
                    <th>Last Movement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 500 }}>{item.stock_item_name}</td>
                      <td>{item.category}</td>
                      <td>{item.hsn_code || '-'}</td>
                      <td className="numeric">{item.gst_tax_rate}%</td>
                      <td>{item.base_units}</td>
                      <td className="numeric">{formatNumber(item.opening_qty)}</td>
                      <td className="numeric" style={{ fontWeight: 600 }}>
                        {formatNumber(item.closing_qty)}
                      </td>
                      <td className="numeric">{formatCurrency(item.closing_value)}</td>
                      <td>
                        <StatusBadge status={item.stock_status} />
                      </td>
                      <td className="numeric">
                        <div>
                          <div>{formatCurrency(item.total_sales_value || 0)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Qty: {formatNumber(item.total_sold_qty || 0)}
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(item.last_movement_date)}</td>
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
          </>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
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
          }} onClick={() => setSelectedItem(null)}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              width: '700px',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '24px'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedItem.stock_item_name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedItem.category}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HSN Code</div>
                  <div style={{ fontWeight: 600 }}>{selectedItem.hsn_code || '-'}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GST Rate</div>
                  <div style={{ fontWeight: 600 }}>{selectedItem.gst_tax_rate}%</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Base Unit</div>
                  <div style={{ fontWeight: 600 }}>{selectedItem.base_units}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status</div>
                  <StatusBadge status={selectedItem.stock_status} />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: '#166534' }}>
                    Opening Stock
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.875rem' }}>Quantity</span>
                    <span style={{ fontWeight: 600 }}>{formatNumber(selectedItem.opening_qty)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.875rem' }}>Rate</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(selectedItem.opening_rate || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem' }}>Value</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(selectedItem.opening_value || 0)}</span>
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: '#1e40af' }}>
                    Closing Stock
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.875rem' }}>Quantity</span>
                    <span style={{ fontWeight: 600 }}>{formatNumber(selectedItem.closing_qty)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem' }}>Value</span>
                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{formatCurrency(selectedItem.closing_value)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Sales & Purchase Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      background: '#f0fdf4',
                      borderRadius: '8px 8px 0 0',
                      borderBottom: '1px solid #bbf7d0'
                    }}>
                      <span style={{ fontWeight: 600, color: '#166534' }}>Total Sales</span>
                      <span style={{ fontWeight: 700, color: '#166534' }}>{formatCurrency(selectedItem.total_sales_value || 0)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      background: '#f0fdf4',
                      borderRadius: '0 0 8px 8px'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>Quantity Sold</span>
                      <span style={{ fontWeight: 600 }}>{formatNumber(selectedItem.total_sold_qty || 0)} {selectedItem.base_units}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      background: '#fffbeb',
                      borderRadius: '8px 8px 0 0',
                      borderBottom: '1px solid #fcd34d'
                    }}>
                      <span style={{ fontWeight: 600, color: '#92400e' }}>Total Purchases</span>
                      <span style={{ fontWeight: 700, color: '#92400e' }}>{formatCurrency(selectedItem.total_purchase_value || 0)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      background: '#fffbeb',
                      borderRadius: '0 0 8px 8px'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>Quantity Purchased</span>
                      <span style={{ fontWeight: 600 }}>{formatNumber(selectedItem.total_purchased_qty || 0)} {selectedItem.base_units}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary">
                  <TrendingUp size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  View Movement
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
