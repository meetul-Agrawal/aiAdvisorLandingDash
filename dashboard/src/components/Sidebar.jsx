import { 
  LayoutDashboard, AlertCircle, TrendingUp, Trophy,
  ShoppingCart, ShoppingBag, Wallet, Users, Package, Building2
} from 'lucide-react';

const menuItems = [
  { id: 'summary', label: 'Summary', icon: LayoutDashboard },
  { id: 'attention', label: 'Need Attention', icon: AlertCircle },
  { id: 'sales-receivables', label: 'Sales & Receivables', icon: TrendingUp },
  { id: 'top10', label: 'Top 10 Lists', icon: Trophy },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
  { id: 'cash-bank', label: 'Cash & Bank', icon: Wallet },
  { id: 'parties', label: 'Parties', icon: Users },
  { id: 'items', label: 'Items', icon: Package },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>
            <Building2 size={24} />
            Tally Dashboard
          </h1>
          <p className="subtitle">ERP Analytics</p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          right: '20px',
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
            Financial Year
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            2024-25
          </div>
        </div>
      </aside>
    </>
  );
}
