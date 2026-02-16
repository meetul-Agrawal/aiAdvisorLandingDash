# Tally ERP Dashboard - MVP DBMS Structure

Complete database schema for Tally ERP Dashboard with all 9 tabs and comprehensive reporting views.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `dashboard_mvp_complete.sql` | **Main file** - Complete schema with all views, functions, and indexes |
| `dashboard_mvp_schema.sql` | Original schema file (legacy) |
| `sample_dashboard_queries.sql` | Sample queries for all dashboard tabs |
| `api_structure.md` | REST API endpoint documentation |

## 🗂️ Dashboard Structure

### Tab 1: Summary
- **Current Cash & Bank Balances**: `vw_cash_bank_balances`
- **Cash/Bank Transactions**: `vw_cash_bank_transactions` (with date, party, type, amount)
- **Inventory Management**: `vw_inventory_summary` (drill-down by date, stock item, party)
- **Payables Summary**: `vw_payables_summary` (with aging details)

### Tab 2: Need Attention
- **Inactive Customers**: `vw_inactive_customers` (90+ days no transaction)
- **Inactive Stocks**: `vw_inactive_stocks` (90+ days no movement)

### Tab 3: Sales & Receivables
- **Sales Summary**: `vw_sales_summary`
- **Receivables Summary**: `vw_receivables_summary` (with aging buckets)
- **Drill-down**: `vw_sales_receivables_drilldown` (by month, party)

### Tab 4: Top 10
| View | Purpose |
|------|---------|
| `vw_top_customers_by_value` | Top customers by sales value |
| `vw_top_suppliers_by_value` | Top suppliers by purchase value |
| `vw_top_items_by_quantity` | Top items sold by quantity |
| `vw_top_items_by_value` | Top items sold by value |
| `vw_top_items_purchase_qty` | Top items purchased by quantity |
| `vw_top_items_purchase_value` | Top items purchased by value |

### Tab 5: Sales
Covers: Sales, Credit Note, Receipt, Receivables, Sales Order, Delivery Note
- **All Documents**: `vw_sales_documents`
- **Receivables Aging**: `vw_receivables_aging`
- **Sales Orders**: `vw_sales_orders`

### Tab 6: Purchase
Covers: Purchase, Debit Note, Payment, Payables, Purchase Order, Receipt Note
- **All Documents**: `vw_purchase_documents`
- **Payables Aging**: `vw_payables_aging`
- **Purchase Orders**: `vw_purchase_orders`

### Tab 7: Cash & Bank
- **Cash Position**: `vw_cash_position` (with MTD inflow/outflow)
- **Bank Position**: `vw_bank_position` (with account details)
- **Daily Cash Flow**: `vw_cash_flow_daily`
- **Bank Allocations**: `vw_bank_allocation_details`

### Tab 8: Parties
- **Party Master**: `vw_party_master` (complete party details with summary)
- **Transaction History**: `vw_party_transactions`
- **Outstanding Statement**: `vw_party_outstanding`

### Tab 9: Items
- **Stock Item Master**: `vw_stock_item_master` (with totals, status)
- **Movement History**: `vw_item_movement_history`
- **Category Summary**: `vw_stock_summary_by_category`
- **Low Stock Alert**: `vw_low_stock_alert`

## 🔧 Key Functions

### `get_dashboard_kpis(company_id UUID)`
Returns comprehensive KPIs including:
- Cash & Bank totals
- Receivables & Payables
- MTD Sales, Purchases, Receipts, Payments
- Gross Profit
- Active items/parties counts
- Alert counts (inactive customers/stocks, low stock, overdue)

```sql
SELECT * FROM get_dashboard_kpis('your-company-uuid');
```

### `get_monthly_trends(company_id UUID, months INTEGER)`
Returns monthly performance trends for specified number of months.

```sql
SELECT * FROM get_monthly_trends('your-company-uuid', 12);
```

### Helper Functions
- `days_since_last_transaction(ledger_name, company_id)`
- `stock_last_movement_date(stock_item_name, company_id)`
- `get_ledger_balance_as_of(ledger_name, company_id, as_of_date)`
- `get_financial_year(company_id, date)`

## 🚀 Quick Start

### 1. Run the Schema
```bash
psql -U your_user -d your_database -f dashboard_mvp_complete.sql
```

### 2. Get Dashboard Data
```sql
-- Get all KPIs
SELECT * FROM get_dashboard_kpis('your-company-uuid');

-- Get cash position
SELECT * FROM vw_cash_position WHERE company_id = 'your-company-uuid';

-- Get top 10 customers
SELECT * FROM vw_top_customers_by_value 
WHERE company_id = 'your-company-uuid' AND rank <= 10;
```

## 📊 Sample Queries

See `sample_dashboard_queries.sql` for complete query examples for all tabs.

## 🔌 API Integration

See `api_structure.md` for REST API endpoint documentation.

Base URL: `/api/v1/dashboard`

## ⚡ Performance

The schema includes optimized indexes for:
- Date range queries
- Party/ledger lookups
- Inventory item searches
- Category aggregations

## 📝 Notes

- All views include `company_id` for multi-tenant filtering
- Soft-deleted records (is_deleted = TRUE) are automatically filtered
- Encrypted fields (GSTIN, PAN) maintain their encryption in views
- All monetary values use DECIMAL(18,4) for precision
