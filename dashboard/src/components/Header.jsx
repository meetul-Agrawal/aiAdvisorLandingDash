import { useState, useEffect } from 'react';
import { Menu, Bell, Calendar, ChevronDown, Building2 } from 'lucide-react';
import { companyInfo } from '../data/dummyData';

export default function Header({ onMenuToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <div className="company-info">
          <h2>{companyInfo.company_name}</h2>
          <span className="gstin">GSTIN: {companyInfo.gstin}</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="date-display">
          <Calendar size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          {currentDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        
        <button style={{ 
          position: 'relative', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '8px'
        }}>
          <Bell size={20} color="#64748b" />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%'
          }} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div className="user-avatar">AD</div>
          <ChevronDown size={16} color="#64748b" />
        </div>
      </div>
    </header>
  );
}
