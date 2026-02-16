# Tally ERP Dashboard - MVP DBMS Structure

## Overview

This MVP provides a complete PostgreSQL database structure for the Tally ERP Dashboard with all required tabs and views.

## File Structure

```
├── dashboard_mvp_schema.sql   # Main database schema with all views and functions
└── README.md                  # This documentation file
```

## Dashboard Tabs Implemented

### 1. Summary Tab
| View/Function | Purpose |
|--------------|---------|
| `vw_cash_bank_balances` | Current Cash & Bank account balances |
| `vw_cash_bank_transactions` | Transaction details with party, type, amount |
| `vw_inventory_summary` | Inventory drill down by date, stock item, party |
| `vw_payables_summary` | Payables summary with aging |

### 2. Need Attention Tab
| View | Purpose |
|------|---------|
| `vw_inactive_customers` | Customers with no transaction in last 90 days |
| `vw_inactive_stocks` | Stock items with no movement in last 90 days |

### 3. Sales & Receivables Tab
| View | Purpose |
|------|---------|
| `vw_sales_summary` | Sales summary with party, GST, amounts |
| `vw_receivables_summary` | Receivables with aging buckets |
| `vw_sales_receivables_drilldown` | Monthly drill down by party |

### 4. Top 10 Lists
| View | Purpose |
|------|---------|
| `vw_top_customers_by_value` | Top customers by sales value |
| `vw_top_suppliers_by_value` | Top suppliers by purchase value |
| `vw_top_items_by_quantity` | Top items sold by quantity |
| `vw_top_items_by_value` | Top items sold by value |
| `vw_top_items_purchase_qty` | Top items purchased by quantity |
| `vw_top_items_purchase_value` | Top items purchased by value |

### 5. Sales Tab
| View | Purpose |
|------|---------|
| `vw_sales_documents` | Sales, Credit Note, Receipt, Sales Order, Delivery Note |
| `vw_receivables_aging` | Receivables aging analysis |

### 6. Purchase Tab
| View | Purpose |
|------|---------|
| `vw_purchase_documents` | Purchase, Debit Note, Payment, Purchase Order, Receipt Note |
| `vw_payables_aging` | Payables aging analysis |

### 7. Cash & Bank Tab
| View | Purpose |
|------|---------|
| `vw_cash_position` | Cash account summary with MTD movement |
| `vw_bank_position` | Bank account summary with MTD movement |
| `vw_cash_flow_daily` | Daily cash flow statement |

### 8. Parties Tab
| View | Purpose |
|------|---------|
| `vw_party_master` | Party master with summary statistics |
| `vw_party_transactions` | Complete party transaction history |

### 9. Items Tab
| View | Purpose |
|------|---------|
| `vw_stock_item_master` | Stock items with movement summary |
| `vw_item_movement_history` | Item transaction history |
| `vw_stock_summary_by_category` | Stock grouped by category |

## Helper Functions

| Function | Purpose |
|----------|---------|
| `get_financial_year(company_id, date)` | Returns FY from/to dates |
| `days_since_last_transaction(ledger_name, company_id)` | Days since last txn |
| `stock_last_movement_date(stock_item, company_id)` | Last movement date |
| `get_dashboard_kpis(company_id)` | Returns all KPIs for dashboard |

## Installation

1. Ensure pgcrypto extension is enabled (for encrypted fields):
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

2. Run the schema file:
```bash
psql -U your_user -d your_database -f dashboard_mvp_schema.sql
```

## Usage Examples

### Get Dashboard KPIs
```sql
SELECT * FROM get_dashboard_kpis('your-company-uuid');
```

### Get Top 10 Customers
```sql
SELECT * FROM vw_top_customers_by_value 
WHERE company_id = 'your-company-uuid' 
AND rank <= 10;
```

### Get Cash & Bank Transactions
```sql
SELECT * FROM vw_cash_bank_transactions 
WHERE company_id = 'your-company-uuid' 
AND date >= '2024-01-01'
ORDER BY date DESC;
```

### Get Inactive Customers
```sql
SELECT * FROM vw_inactive_customers 
WHERE company_id = 'your-company-uuid';
```

### Get Sales Summary with Date Filter
```sql
SELECT * FROM vw_sales_summary 
WHERE company_id = 'your-company-uuid' 
AND date BETWEEN '2024-01-01' AND '2024-12-31';
```

### Get Inventory by Date Range
```sql
SELECT * FROM vw_inventory_summary 
WHERE company_id = 'your-company-uuid' 
AND date >= '2024-01-01'
ORDER BY date DESC;
```

## Data Refresh Strategy

The views are designed to work with real-time data from the source tables. For large datasets, consider:

1. **Materialized Views**: Convert views to materialized views for heavy dashboards
2. **Scheduled Refresh**: Set up pg_cron or similar for periodic refresh
3. **Caching**: Implement application-level caching for frequently accessed data

## Performance Notes

- All views include company_id filtering for multi-tenant isolation
- Additional indexes have been created for dashboard queries
- Partitioning on vouchers and audit_logs tables is leveraged
- Consider creating materialized views if query performance degrades

## Security

- All views respect row-level security policies when enabled
- Encrypted fields (gstin, pan) are handled appropriately
- Company-level data isolation is maintained throughout

## Future Enhancements

1. Add trend analysis views (MoM, YoY comparisons)
2. Implement budget vs actual reporting views
3. Add GST compliance dashboard views
4. Create executive summary rollup views
5. Add real-time notification triggers for threshold alerts
