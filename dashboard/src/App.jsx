import { useState } from 'react';
import './styles/dashboard.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryTab from './components/tabs/SummaryTab';
import NeedAttentionTab from './components/tabs/NeedAttentionTab';
import SalesReceivablesTab from './components/tabs/SalesReceivablesTab';
import Top10Tab from './components/tabs/Top10Tab';
import SalesTab from './components/tabs/SalesTab';
import PurchaseTab from './components/tabs/PurchaseTab';
import CashBankTab from './components/tabs/CashBankTab';
import PartiesTab from './components/tabs/PartiesTab';
import ItemsTab from './components/tabs/ItemsTab';

const tabComponents = {
  'summary': SummaryTab,
  'attention': NeedAttentionTab,
  'sales-receivables': SalesReceivablesTab,
  'top10': Top10Tab,
  'sales': SalesTab,
  'purchase': PurchaseTab,
  'cash-bank': CashBankTab,
  'parties': PartiesTab,
  'items': ItemsTab,
};

const tabTitles = {
  'summary': 'Summary Dashboard',
  'attention': 'Need Attention',
  'sales-receivables': 'Sales & Receivables',
  'top10': 'Top 10 Lists',
  'sales': 'Sales Documents',
  'purchase': 'Purchase Documents',
  'cash-bank': 'Cash & Bank',
  'parties': 'Party Master',
  'items': 'Stock Items',
};

function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        
        <main className="content">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>
              {tabTitles[activeTab]}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              Last updated: {new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

export default App;
