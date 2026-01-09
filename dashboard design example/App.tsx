import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/pages/Dashboard';
import { Customers } from './components/pages/Customers';
import { Suppliers } from './components/pages/Suppliers';
import { Products } from './components/pages/Products';
import { StockMovements } from './components/pages/StockMovements';
import { Invoices } from './components/pages/Invoices';
import { PurchaseOrders } from './components/pages/PurchaseOrders';
import { Payments } from './components/pages/Payments';
import { Accounts } from './components/pages/Accounts';
import { AuditLogs } from './components/pages/AuditLogs';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'products':
        return <Products />;
      case 'stock':
        return <StockMovements />;
      case 'invoices':
        return <Invoices />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'payments':
        return <Payments />;
      case 'accounts':
        return <Accounts />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
