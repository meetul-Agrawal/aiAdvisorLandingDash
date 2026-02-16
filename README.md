# Tally ERP Dashboard - MVP

A comprehensive React-based dashboard for visualizing Tally ERP data with interactive charts, tables, and drill-down capabilities.

## Project Structure

```
project/
├── dashboard/                    # React Dashboard Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── Header.jsx        # Top header bar
│   │   │   └── tabs/
│   │   │       ├── SummaryTab.jsx           # Dashboard summary
│   │   │       ├── NeedAttentionTab.jsx     # Inactive customers/stock
│   │   │       ├── SalesReceivablesTab.jsx  # Sales & receivables
│   │   │       ├── Top10Tab.jsx             # Top 10 rankings
│   │   │       ├── SalesTab.jsx             # Sales documents
│   │   │       ├── PurchaseTab.jsx          # Purchase documents
│   │   │       ├── CashBankTab.jsx          # Cash & bank accounts
│   │   │       ├── PartiesTab.jsx           # Party master
│   │   │       └── ItemsTab.jsx             # Stock items
│   │   ├── data/
│   │   │   └── dummyData.js      # Dummy data matching DB schema
│   │   ├── styles/
│   │   │   └── dashboard.css     # Dashboard styles
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   └── README.md
│
├── dashboard_mvp_schema.sql      # PostgreSQL views and functions
├── dashboard_mvp_complete.sql    # Complete database schema
├── mvp.md                        # MVP documentation
└── README.md                     # This file
```

## Features

### 9 Interactive Dashboard Tabs

1. **Summary Tab**
   - Cash & Bank balances with transaction history
   - Inventory management with drill-downs
   - Payables summary
   - Monthly trend charts with Area, Bar, and Pie charts
   - KPI cards with key metrics

2. **Need Attention Tab**
   - Inactive customers (90+ days no transactions)
   - Inactive stock items (90+ days no movement)
   - Outstanding balance tracking
   - Recommended actions with action buttons

3. **Sales & Receivables Tab**
   - Sales summary with invoice details
   - Receivables aging analysis
   - Customer-wise drill-downs
   - Collection tracking

4. **Top 10 Lists**
   - Top 10 Customers by Value
   - Top 10 Suppliers by Value
   - Top 10 Items Sold by Quantity
   - Top 10 Items Sold by Value
   - Top 10 Items Purchased by Quantity
   - Top 10 Items Purchased by Value

5. **Sales Tab**
   - Sales invoices, Credit Notes, Receipts
   - Receivables aging
   - Sales Orders, Delivery Notes
   - Multi-sub-tab navigation

6. **Purchase Tab**
   - Purchase bills, Debit Notes, Payments
   - Payables aging
   - Purchase Orders, Receipt Notes
   - Multi-sub-tab navigation

7. **Cash & Bank Tab**
   - Cash position summary
   - Bank account summary
   - Daily cash flow with composed charts
   - Transaction history
   - Liquidity analysis

8. **Parties Tab**
   - Customer master with balances
   - Supplier master with balances
   - Contact information (GSTIN, Email, Phone)
   - Transaction history
   - Party-wise drill-down modal

9. **Items Tab**
   - Stock item master
   - Inventory by category with pie/bar charts
   - Low stock alerts
   - Item movement history
   - Stock valuation
   - Item detail modal

## Tech Stack

- **React 19** - UI Framework
- **Vite 7** - Build Tool
- **Recharts** - Charts & Graphs (Bar, Line, Area, Pie, Composed)
- **Lucide React** - Icons
- **CSS Variables** - Styling with custom properties

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd dashboard
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Database Views Reference

The dashboard corresponds to these PostgreSQL views (defined in `dashboard_mvp_schema.sql`):

| View Name | Purpose |
|-----------|---------|
| `vw_cash_bank_balances` | Current cash & bank balances |
| `vw_cash_bank_transactions` | Transaction history |
| `vw_inventory_summary` | Inventory movements |
| `vw_payables_summary` | Payables to suppliers |
| `vw_inactive_customers` | Customers with 90+ days inactivity |
| `vw_inactive_stocks` | Stock items with 90+ days no movement |
| `vw_sales_summary` | Sales invoice summary |
| `vw_receivables_summary` | Customer receivables |
| `vw_top_customers_by_value` | Top customers ranking |
| `vw_top_suppliers_by_value` | Top suppliers ranking |
| `vw_top_items_by_quantity` | Top items by quantity sold |
| `vw_top_items_by_value` | Top items by sales value |
| `vw_sales_documents` | All sales documents |
| `vw_purchase_documents` | All purchase documents |
| `vw_cash_position` | Cash account summary |
| `vw_bank_position` | Bank account summary |
| `vw_party_master` | Party/ledger master |
| `vw_stock_item_master` | Stock item master |
| `vw_item_movement_history` | Item transaction history |

## Dummy Data

The dashboard includes comprehensive dummy data in `src/data/dummyData.js` that mirrors the Tally ERP database structure:
- 8 stock items across multiple categories
- 7 party records (customers, suppliers, others)
- 8 cash & bank transactions
- 8 inventory movements
- 10 customers in top lists
- 10 suppliers in top lists
- Monthly trend data for 6 months

## Responsive Design

- Collapsible sidebar for mobile devices
- Responsive grid layouts
- Adaptive tables with horizontal scroll
- Touch-friendly controls
- Print-friendly styles

## License

MIT
