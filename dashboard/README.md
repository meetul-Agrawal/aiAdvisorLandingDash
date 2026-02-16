# Tally ERP Dashboard

A comprehensive React-based dashboard for visualizing Tally ERP data with interactive charts, tables, and drill-down capabilities.

## Features

### 1. Summary Tab
- Cash & Bank balances with transaction history
- Inventory management with drill-downs
- Payables summary
- Monthly trend charts
- KPI cards with key metrics

### 2. Need Attention Tab
- Inactive customers (90+ days no transactions)
- Inactive stock items (90+ days no movement)
- Outstanding balance tracking
- Recommended actions

### 3. Sales & Receivables Tab
- Sales summary with invoice details
- Receivables aging analysis
- Customer-wise drill-downs
- Collection tracking

### 4. Top 10 Lists
- Top 10 Customers by Value
- Top 10 Suppliers by Value
- Top 10 Items Sold by Quantity
- Top 10 Items Sold by Value
- Top 10 Items Purchased by Quantity
- Top 10 Items Purchased by Value

### 5. Sales Tab
- Sales invoices
- Credit Notes
- Receipts
- Receivables aging
- Sales Orders
- Delivery Notes

### 6. Purchase Tab
- Purchase bills
- Debit Notes
- Payments
- Payables aging
- Purchase Orders
- Receipt Notes

### 7. Cash & Bank Tab
- Cash position summary
- Bank account summary
- Daily cash flow
- Transaction history
- Liquidity analysis

### 8. Parties Tab
- Customer master with balances
- Supplier master with balances
- Contact information
- Transaction history
- Party-wise drill-down modal

### 9. Items Tab
- Stock item master
- Inventory by category
- Low stock alerts
- Item movement history
- Stock valuation
- Item detail modal

## Tech Stack

- **React 19** - UI Framework
- **Vite** - Build Tool
- **Recharts** - Charts & Graphs
- **Lucide React** - Icons
- **CSS Variables** - Styling

## Installation

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

## Data Structure

The dashboard uses dummy data that mirrors the Tally ERP database structure:
- Companies
- Vouchers (Sales, Purchase, Receipt, Payment, etc.)
- Ledger Entries
- Inventory Entries
- Party Master
- Stock Items

## Database Views

The dashboard corresponds to these PostgreSQL views:
- `vw_cash_bank_balances`
- `vw_cash_bank_transactions`
- `vw_inventory_summary`
- `vw_payables_summary`
- `vw_inactive_customers`
- `vw_inactive_stocks`
- `vw_sales_summary`
- `vw_receivables_summary`
- `vw_top_customers_by_value`
- `vw_top_suppliers_by_value`
- `vw_top_items_by_quantity`
- `vw_top_items_by_value`
- And more...

## Responsive Design

The dashboard is fully responsive with:
- Collapsible sidebar for mobile
- Responsive grid layouts
- Adaptive tables with horizontal scroll
- Touch-friendly controls

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
