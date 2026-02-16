# Tally ERP Dashboard - MVP DBMS Structure

## Overview

Complete database schema for Tally ERP Dashboard with all 9 tabs and comprehensive reporting views.

---

## Dashboard Tabs

### 1. Summary Tab

#### Current Cash & Bank Amount
**View:** `vw_cash_bank_balances`

| Column | Type | Description |
|--------|------|-------------|
| company_id | UUID | Company identifier |
| company_name | VARCHAR | Company name |
| ledger_name | VARCHAR | Account name |
| parent_group | VARCHAR | Account group |
| opening_balance | DECIMAL | Opening balance |
| closing_balance | DECIMAL | Current balance |
| account_type | VARCHAR | Cash/Bank/Other |
| gstin | VARCHAR(15) | GST number |
| state_name | VARCHAR | State |
| updated_at | TIMESTAMP | Last update |

#### Cash & Bank Transactions
**View:** `vw_cash_bank_transactions`

| Column | Type | Description |
|--------|------|-------------|
| date | DATE | Transaction date |
| voucher_number | VARCHAR | Voucher number |
| voucher_type | VARCHAR | Transaction type |
| party_name | VARCHAR | Party/Customer name |
| account_name | VARCHAR | Bank/Cash account |
| transaction_direction | VARCHAR | Inflow/Outflow |
| absolute_amount | DECIMAL | Transaction amount |
| payment_mode | VARCHAR | Payment method |
| instrument_number | VARCHAR | Cheque/Ref number |
| narration | TEXT | Description |

#### Inventory Management
**View:** `vw_inventory_summary`

| Column | Type | Description |
|--------|------|-------------|
| date | DATE | Transaction date |
| stock_item_name | VARCHAR | Item name |
| item_category | VARCHAR | Category |
| party_name | VARCHAR | Customer/Supplier |
| voucher_type | VARCHAR | Sales/Purchase |
| billed_qty | DECIMAL | Quantity |
| rate | DECIMAL | Unit price |
| amount | DECIMAL | Total amount |
| discount | DECIMAL | Discount % |
| godown_name | VARCHAR | Warehouse |

#### Payables Summary
**View:** `vw_payables_summary`

| Column | Type | Description |
|--------|------|-------------|
| party_name | VARCHAR | Supplier name |
| payable_amount | DECIMAL | Amount due |
| parent_group | VARCHAR | Account group |
| balance_type | VARCHAR | Payable/Receivable |
| days_since_last_txn | INTEGER | Days since last transaction |
| last_transaction_date | DATE | Last payment date |

---

### 2. Need Attention Tab

#### Inactive Customers
**View:** `vw_inactive_customers`

Shows customers with no transactions in 90+ days:

| Column | Type | Description |
|--------|------|-------------|
| customer_name | VARCHAR | Customer name |
| closing_balance | DECIMAL | Current balance |
| days_since_last_txn | INTEGER | Days inactive |
| last_transaction_date | DATE | Last transaction |
| last_voucher | VARCHAR | Last voucher ref |
| total_sales_value | DECIMAL | Lifetime sales |
| total_transactions | BIGINT | Transaction count |

#### Inactive Stocks
**View:** `vw_inactive_stocks`

Shows stock items with no movement in 90+ days:

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| category | VARCHAR | Category |
| closing_qty | DECIMAL | Current stock |
| closing_value | DECIMAL | Stock value |
| last_movement_date | DATE | Last movement |
| days_since_last_movement | INTEGER | Days inactive |
| total_sold_qty | DECIMAL | Lifetime sales qty |
| total_sold_value | DECIMAL | Lifetime sales value |

---

### 3. Sales & Receivables Tab

#### Sales Summary
**View:** `vw_sales_summary`

| Column | Type | Description |
|--------|------|-------------|
| voucher_number | VARCHAR | Invoice number |
| date | DATE | Invoice date |
| party_name | VARCHAR | Customer name |
| party_gstin | VARCHAR | Customer GSTIN |
| gross_amount | DECIMAL | Gross amount |
| discount_amount | DECIMAL | Discount |
| net_amount | DECIMAL | Net amount |
| item_count | BIGINT | Number of items |
| total_quantity | DECIMAL | Total qty |
| is_invoice | BOOLEAN | Is invoice flag |

#### Receivables Summary
**View:** `vw_receivables_summary`

| Column | Type | Description |
|--------|------|-------------|
| customer_name | VARCHAR | Customer name |
| receivable_amount | DECIMAL | Amount due |
| days_since_last_txn | INTEGER | Days since last payment |
| aging_bucket | VARCHAR | Current/1-30/31-60/60+ days |
| total_sales_value | DECIMAL | Total sales |
| total_receipts | DECIMAL | Total received |

#### Drill Down by Date/Party
**View:** `vw_sales_receivables_drilldown`

| Column | Type | Description |
|--------|------|-------------|
| month | DATE | Month |
| party_name | VARCHAR | Customer name |
| transaction_count | BIGINT | Number of invoices |
| sales_amount | DECIMAL | Total sales |
| credit_note_amount | DECIMAL | Credit notes |
| receipt_amount | DECIMAL | Payments received |
| net_receivable | DECIMAL | Outstanding |

---

### 4. Top 10 Lists

#### Top 10 Customers by Value
**View:** `vw_top_customers_by_value`

| Column | Type | Description |
|--------|------|-------------|
| customer_name | VARCHAR | Customer name |
| total_sales_value | DECIMAL | Total sales |
| transaction_count | BIGINT | Number of transactions |
| avg_transaction_value | DECIMAL | Average invoice |
| rank | BIGINT | Rank position |

#### Top 10 Suppliers by Value
**View:** `vw_top_suppliers_by_value`

| Column | Type | Description |
|--------|------|-------------|
| supplier_name | VARCHAR | Supplier name |
| total_purchase_value | DECIMAL | Total purchases |
| transaction_count | BIGINT | Number of transactions |
| avg_transaction_value | DECIMAL | Average purchase |
| rank | BIGINT | Rank position |

#### Top 10 Items Sold by Quantity
**View:** `vw_top_items_by_quantity`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| total_quantity_sold | DECIMAL | Qty sold |
| total_sales_value | DECIMAL | Sales value |
| avg_selling_rate | DECIMAL | Average price |
| rank | BIGINT | Rank position |

#### Top 10 Items Sold by Value
**View:** `vw_top_items_by_value`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| total_sales_value | DECIMAL | Sales value |
| total_quantity_sold | DECIMAL | Qty sold |
| avg_selling_rate | DECIMAL | Average price |
| rank | BIGINT | Rank position |

#### Top 10 Items Purchased by Quantity
**View:** `vw_top_items_purchase_qty`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| total_quantity_purchased | DECIMAL | Qty purchased |
| total_purchase_value | DECIMAL | Purchase value |
| avg_purchase_rate | DECIMAL | Average price |
| rank | BIGINT | Rank position |

#### Top 10 Items Purchased by Value
**View:** `vw_top_items_purchase_value`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| total_purchase_value | DECIMAL | Purchase value |
| total_quantity_purchased | DECIMAL | Qty purchased |
| avg_purchase_rate | DECIMAL | Average price |
| rank | BIGINT | Rank position |

---

### 5. Sales Tab

Covers: **Sales, Credit Note, Receipt, Receivables, Sales Order, Delivery Note**

#### All Sales Documents
**View:** `vw_sales_documents`

| Column | Type | Description |
|--------|------|-------------|
| voucher_type | VARCHAR | Document type |
| voucher_number | VARCHAR | Document number |
| date | DATE | Document date |
| party_name | VARCHAR | Customer name |
| party_gstin | VARCHAR | Customer GSTIN |
| gross_amount | DECIMAL | Gross amount |
| discount_amount | DECIMAL | Discount |
| net_amount | DECIMAL | Net amount |
| total_quantity | DECIMAL | Total qty |
| is_invoice | BOOLEAN | Is invoice |
| eway_bill_number | VARCHAR | E-way bill |
| cgst_amount | DECIMAL | CGST tax |
| sgst_amount | DECIMAL | SGST tax |
| igst_amount | DECIMAL | IGST tax |
| basic_shipping_date | DATE | Delivery date |
| basic_ship_delivery_note | VARCHAR | Delivery note |

#### Receivables Aging
**View:** `vw_receivables_aging`

| Column | Type | Description |
|--------|------|-------------|
| customer_name | VARCHAR | Customer name |
| outstanding_amount | DECIMAL | Amount due |
| transaction_date | DATE | Invoice date |
| voucher_number | VARCHAR | Invoice number |
| days_outstanding | INTEGER | Days overdue |
| aging_bucket | VARCHAR | Aging category |

#### Sales Orders
**View:** `vw_sales_orders`

| Column | Type | Description |
|--------|------|-------------|
| order_date | DATE | Order date |
| voucher_number | VARCHAR | Order number |
| party_name | VARCHAR | Customer name |
| order_value | DECIMAL | Order amount |
| total_quantity | DECIMAL | Order qty |
| basic_shipping_date | DATE | Expected delivery |

---

### 6. Purchase Tab

Covers: **Purchase, Debit Note, Payment, Payables, Purchase Order, Receipt Note**

#### All Purchase Documents
**View:** `vw_purchase_documents`

| Column | Type | Description |
|--------|------|-------------|
| voucher_type | VARCHAR | Document type |
| voucher_number | VARCHAR | Document number |
| date | DATE | Document date |
| party_name | VARCHAR | Supplier name |
| party_gstin | VARCHAR | Supplier GSTIN |
| gross_amount | DECIMAL | Gross amount |
| discount_amount | DECIMAL | Discount |
| net_amount | DECIMAL | Net amount |
| total_quantity | DECIMAL | Total qty |
| cgst_amount | DECIMAL | CGST tax |
| sgst_amount | DECIMAL | SGST tax |
| igst_amount | DECIMAL | IGST tax |

#### Payables Aging
**View:** `vw_payables_aging`

| Column | Type | Description |
|--------|------|-------------|
| supplier_name | VARCHAR | Supplier name |
| outstanding_amount | DECIMAL | Amount due |
| transaction_date | DATE | Bill date |
| voucher_number | VARCHAR | Bill number |
| days_outstanding | INTEGER | Days overdue |
| aging_bucket | VARCHAR | Aging category |

#### Purchase Orders
**View:** `vw_purchase_orders`

| Column | Type | Description |
|--------|------|-------------|
| order_date | DATE | Order date |
| voucher_number | VARCHAR | Order number |
| party_name | VARCHAR | Supplier name |
| order_value | DECIMAL | Order amount |
| total_quantity | DECIMAL | Order qty |

---

### 7. Cash & Bank Tab

#### Cash Position
**View:** `vw_cash_position`

| Column | Type | Description |
|--------|------|-------------|
| cash_account | VARCHAR | Cash account name |
| opening_balance | DECIMAL | Opening balance |
| closing_balance | DECIMAL | Current balance |
| mtd_movement | DECIMAL | Month-to-date movement |
| mtd_inflow | DECIMAL | Month-to-date receipts |
| mtd_outflow | DECIMAL | Month-to-date payments |
| days_since_last_txn | INTEGER | Days since last transaction |

#### Bank Position
**View:** `vw_bank_position`

| Column | Type | Description |
|--------|------|-------------|
| bank_account | VARCHAR | Bank account name |
| account_number | VARCHAR | Account number |
| opening_balance | DECIMAL | Opening balance |
| closing_balance | DECIMAL | Current balance |
| mtd_movement | DECIMAL | Month-to-date movement |
| mtd_inflow | DECIMAL | Month-to-date receipts |
| mtd_outflow | DECIMAL | Month-to-date payments |
| preferred_payment_mode | VARCHAR | Default payment mode |

#### Daily Cash Flow
**View:** `vw_cash_flow_daily`

| Column | Type | Description |
|--------|------|-------------|
| date | DATE | Date |
| account_name | VARCHAR | Account |
| account_type | VARCHAR | Cash/Bank |
| inflow | DECIMAL | Money in |
| outflow | DECIMAL | Money out |
| net_flow | DECIMAL | Net movement |
| transaction_count | BIGINT | Number of transactions |

---

### 8. Parties Tab

#### Party Master
**View:** `vw_party_master`

| Column | Type | Description |
|--------|------|-------------|
| party_name | VARCHAR | Party name |
| party_type | VARCHAR | Customer/Supplier/Other |
| group_name | VARCHAR | Account group |
| opening_balance | DECIMAL | Opening balance |
| closing_balance | DECIMAL | Current balance |
| balance_status | VARCHAR | Receivable/Payable/Settled |
| gstin | VARCHAR | GST number |
| pan | VARCHAR | PAN number |
| state_name | VARCHAR | State |
| email | VARCHAR | Email |
| phone | VARCHAR | Phone |
| total_transactions | BIGINT | Transaction count |
| total_sales | DECIMAL | Total sales |
| total_purchases | DECIMAL | Total purchases |
| total_receipts | DECIMAL | Total received |
| total_payments | DECIMAL | Total paid |
| last_transaction_date | DATE | Last transaction |

#### Party Transactions
**View:** `vw_party_transactions`

| Column | Type | Description |
|--------|------|-------------|
| party_name | VARCHAR | Party name |
| date | DATE | Transaction date |
| voucher_type | VARCHAR | Document type |
| voucher_number | VARCHAR | Document number |
| amount | DECIMAL | Amount |
| stock_item_name | VARCHAR | Item (if applicable) |
| billed_qty | DECIMAL | Quantity |
| payment_mode | VARCHAR | Payment method |
| instrument_number | VARCHAR | Reference number |

---

### 9. Items Tab

#### Stock Item Master
**View:** `vw_stock_item_master`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| category | VARCHAR | Category |
| base_units | VARCHAR | Unit of measure |
| opening_qty | DECIMAL | Opening stock |
| opening_value | DECIMAL | Opening value |
| closing_qty | DECIMAL | Current stock |
| closing_value | DECIMAL | Current value |
| hsn_code | VARCHAR | HSN code |
| gst_tax_rate | DECIMAL | GST rate % |
| total_sold_qty | DECIMAL | Lifetime sales qty |
| total_sales_value | DECIMAL | Lifetime sales value |
| total_purchased_qty | DECIMAL | Lifetime purchase qty |
| total_purchase_value | DECIMAL | Lifetime purchase value |
| stock_status | VARCHAR | Out of Stock/Low/Normal |
| last_movement_date | DATE | Last transaction |

#### Item Movement History
**View:** `vw_item_movement_history`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| date | DATE | Transaction date |
| voucher_type | VARCHAR | Sales/Purchase |
| voucher_number | VARCHAR | Document number |
| party_name | VARCHAR | Customer/Supplier |
| billed_qty | DECIMAL | Quantity |
| rate | DECIMAL | Unit price |
| amount | DECIMAL | Total amount |
| godown_name | VARCHAR | Warehouse |
| batch_name | VARCHAR | Batch number |
| applied_gst_rate | DECIMAL | GST % applied |

#### Stock Summary by Category
**View:** `vw_stock_summary_by_category`

| Column | Type | Description |
|--------|------|-------------|
| category | VARCHAR | Category name |
| item_count | BIGINT | Number of items |
| total_closing_qty | DECIMAL | Total stock qty |
| total_closing_value | DECIMAL | Total stock value |
| total_sold_qty | DECIMAL | Total sold qty |
| total_sold_value | DECIMAL | Total sales value |
| total_purchased_qty | DECIMAL | Total purchased qty |
| total_purchased_value | DECIMAL | Total purchase value |

#### Low Stock Alert
**View:** `vw_low_stock_alert`

| Column | Type | Description |
|--------|------|-------------|
| stock_item_name | VARCHAR | Item name |
| category | VARCHAR | Category |
| closing_qty | DECIMAL | Current stock |
| mtd_sales_qty | DECIMAL | Sales this month |
| stock_alert_level | VARCHAR | Out of Stock/Low/Medium |
| last_movement_date | DATE | Last transaction |

---

## Key Functions

### Get Dashboard KPIs
```sql
SELECT * FROM get_dashboard_kpis('company-uuid');
```

Returns 16 KPIs:
- total_cash
- total_bank
- total_liquidity
- total_receivables
- total_payables
- net_working_capital
- mtd_sales
- mtd_purchases
- mtd_receipts
- mtd_payments
- mtd_gross_profit
- active_items
- active_parties
- mtd_sales_transactions
- mtd_purchase_transactions
- inactive_customers
- inactive_stocks
- low_stock_items
- overdue_receivables

### Get Monthly Trends
```sql
SELECT * FROM get_monthly_trends('company-uuid', 12);
```

Returns monthly data for:
- sales_amount
- purchase_amount
- receipt_amount
- payment_amount
- gross_profit
- transaction_count

### Helper Functions

| Function | Purpose |
|----------|---------|
| `days_since_last_transaction(ledger_name, company_id)` | Days since last transaction |
| `stock_last_movement_date(item_name, company_id)` | Last movement date |
| `get_ledger_balance_as_of(ledger, company, date)` | Balance on specific date |
| `get_financial_year(company_id, date)` | FY start/end dates |

---

## Usage Examples

### Get Cash & Bank Summary
```sql
SELECT 
    account_type,
    SUM(closing_balance) as total_balance
FROM vw_cash_bank_balances
WHERE company_id = 'your-uuid'
GROUP BY account_type;
```

### Get Top 10 Customers
```sql
SELECT 
    customer_name,
    total_sales_value,
    transaction_count
FROM vw_top_customers_by_value
WHERE company_id = 'your-uuid'
AND rank <= 10;
```

### Get Receivables Aging
```sql
SELECT 
    aging_bucket,
    COUNT(*) as customer_count,
    SUM(receivable_amount) as total_amount
FROM vw_receivables_summary
WHERE company_id = 'your-uuid'
GROUP BY aging_bucket;
```

### Get Low Stock Items
```sql
SELECT * FROM vw_low_stock_alert
WHERE company_id = 'your-uuid'
AND stock_alert_level IN ('Out of Stock', 'Low Stock');
```

---

## Performance Indexes

The following indexes are created for optimal dashboard performance:

```sql
-- Voucher queries
idx_vouchers_date_type_company (date, voucher_type, company_id)
idx_vouchers_party_date (party_ledger_name, date, company_id)
idx_vouchers_company_date_type (company_id, date, voucher_type)

-- Ledger queries
idx_ledger_entries_ledger_amount (ledger_name, amount)
idx_ledger_entries_company_ledger (company_id, ledger_name)
idx_ledgers_group_balance (parent_group, closing_balance, company_id)

-- Inventory queries
idx_inventory_entries_item_date (stock_item_name, created_at)
idx_inventory_entries_company_item (company_id, stock_item_name)
```

---

## Installation

Run the SQL file to create all views and functions:

```bash
psql -U username -d database -f dashboard_mvp_complete.sql
```

All views will be created with the `vw_` prefix and functions with descriptive names.
