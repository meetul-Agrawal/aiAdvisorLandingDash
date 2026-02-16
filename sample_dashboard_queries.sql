-- ============================================================
-- SAMPLE DASHBOARD QUERIES
-- ============================================================
-- Replace 'YOUR_COMPANY_ID' with actual company UUID
-- ============================================================

-- ============================================================
-- 1. SUMMARY TAB QUERIES
-- ============================================================

-- 1.1 Current Cash & Bank Summary
SELECT 
    account_type,
    COUNT(*) as account_count,
    SUM(closing_balance) as total_balance
FROM vw_cash_bank_balances
WHERE company_id = 'YOUR_COMPANY_ID'
GROUP BY account_type;

-- 1.2 Recent Cash/Bank Transactions (Last 7 Days)
SELECT 
    date,
    voucher_number,
    voucher_type,
    party_name,
    account_name,
    transaction_direction,
    ABS(amount) as amount,
    payment_mode
FROM vw_cash_bank_transactions
WHERE company_id = 'YOUR_COMPANY_ID'
AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- 1.3 Inventory Summary by Date Range
SELECT 
    date,
    stock_item_name,
    party_name,
    voucher_type,
    billed_qty,
    rate,
    amount
FROM vw_inventory_summary
WHERE company_id = 'YOUR_COMPANY_ID'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 1.4 Payables Summary with Aging
SELECT 
    party_name,
    payable_amount,
    days_since_last_txn,
    CASE 
        WHEN days_since_last_txn IS NULL THEN 'No Transactions'
        WHEN days_since_last_txn <= 30 THEN 'Current'
        WHEN days_since_last_txn <= 60 THEN '1-30 Days Overdue'
        ELSE 'Over 60 Days'
    END as status
FROM vw_payables_summary
WHERE company_id = 'YOUR_COMPANY_ID'
AND payable_amount > 0
ORDER BY payable_amount DESC;

-- ============================================================
-- 2. NEED ATTENTION TAB QUERIES
-- ============================================================

-- 2.1 Inactive Customers (90+ days)
SELECT 
    customer_name,
    closing_balance,
    days_since_last_txn,
    last_transaction_date,
    last_voucher
FROM vw_inactive_customers
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY days_since_last_txn DESC
LIMIT 50;

-- 2.2 Inactive Stock Items
SELECT 
    stock_item_name,
    category,
    closing_qty,
    closing_value,
    last_movement_date,
    days_since_last_movement
FROM vw_inactive_stocks
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY days_since_last_movement DESC NULLS LAST
LIMIT 50;

-- ============================================================
-- 3. SALES & RECEIVABLES TAB QUERIES
-- ============================================================

-- 3.1 Monthly Sales Summary
SELECT 
    DATE_TRUNC('month', date) as month,
    COUNT(DISTINCT voucher_id) as invoice_count,
    SUM(total_amount) as gross_sales,
    SUM(discount_amount) as total_discounts,
    SUM(net_amount) as net_sales
FROM vw_sales_summary
WHERE company_id = 'YOUR_COMPANY_ID'
AND date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- 3.2 Receivables by Aging Bucket
SELECT 
    aging_bucket,
    COUNT(*) as customer_count,
    SUM(receivable_amount) as total_outstanding
FROM vw_receivables_summary
WHERE company_id = 'YOUR_COMPANY_ID'
GROUP BY aging_bucket
ORDER BY total_outstanding DESC;

-- 3.3 Sales Drill Down by Party (MTD)
SELECT 
    party_name,
    transaction_count,
    sales_amount,
    credit_note_amount,
    receipt_amount,
    (sales_amount - credit_note_amount - receipt_amount) as net_receivable
FROM vw_sales_receivables_drilldown
WHERE company_id = 'YOUR_COMPANY_ID'
AND month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY sales_amount DESC;

-- ============================================================
-- 4. TOP 10 QUERIES
-- ============================================================

-- 4.1 Top 10 Customers by Sales Value
SELECT 
    customer_name,
    total_sales_value,
    transaction_count,
    avg_transaction_value
FROM vw_top_customers_by_value
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- 4.2 Top 10 Suppliers by Purchase Value
SELECT 
    supplier_name,
    total_purchase_value,
    transaction_count,
    avg_transaction_value
FROM vw_top_suppliers_by_value
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- 4.3 Top 10 Items Sold by Quantity
SELECT 
    stock_item_name,
    total_quantity_sold,
    total_sales_value,
    avg_selling_rate
FROM vw_top_items_by_quantity
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- 4.4 Top 10 Items Sold by Value
SELECT 
    stock_item_name,
    total_sales_value,
    total_quantity_sold,
    avg_selling_rate
FROM vw_top_items_by_value
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- 4.5 Top 10 Items Purchased by Quantity
SELECT 
    stock_item_name,
    total_quantity_purchased,
    total_purchase_value,
    avg_purchase_rate
FROM vw_top_items_purchase_qty
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- 4.6 Top 10 Items Purchased by Value
SELECT 
    stock_item_name,
    total_purchase_value,
    total_quantity_purchased,
    avg_purchase_rate
FROM vw_top_items_purchase_value
WHERE company_id = 'YOUR_COMPANY_ID'
AND rank <= 10;

-- ============================================================
-- 5. SALES TAB QUERIES
-- ============================================================

-- 5.1 All Sales Documents
SELECT 
    date,
    voucher_number,
    voucher_type,
    party_name,
    gross_amount,
    discount_amount,
    net_amount,
    is_invoice
FROM vw_sales_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Sales'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 5.2 Credit Notes
SELECT 
    date,
    voucher_number,
    party_name,
    net_amount,
    narration
FROM vw_sales_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Credit Note'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 5.3 Receipts
SELECT 
    date,
    voucher_number,
    party_name,
    net_amount,
    narration
FROM vw_sales_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Receipt'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 5.4 Receivables Aging Detail
SELECT 
    customer_name,
    outstanding_amount,
    transaction_date,
    voucher_number,
    days_outstanding,
    aging_bucket
FROM vw_receivables_aging
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY days_outstanding DESC;

-- ============================================================
-- 6. PURCHASE TAB QUERIES
-- ============================================================

-- 6.1 All Purchase Documents
SELECT 
    date,
    voucher_number,
    voucher_type,
    party_name,
    gross_amount,
    net_amount
FROM vw_purchase_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Purchase'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 6.2 Debit Notes
SELECT 
    date,
    voucher_number,
    party_name,
    net_amount,
    narration
FROM vw_purchase_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Debit Note'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 6.3 Payments Made
SELECT 
    date,
    voucher_number,
    party_name,
    net_amount,
    narration
FROM vw_purchase_documents
WHERE company_id = 'YOUR_COMPANY_ID'
AND voucher_type = 'Payment'
AND date >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY date DESC;

-- 6.4 Payables Aging Detail
SELECT 
    supplier_name,
    outstanding_amount,
    transaction_date,
    voucher_number,
    days_outstanding,
    aging_bucket
FROM vw_payables_aging
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY days_outstanding DESC;

-- ============================================================
-- 7. CASH & BANK TAB QUERIES
-- ============================================================

-- 7.1 Cash Position
SELECT 
    cash_account,
    opening_balance,
    closing_balance,
    mtd_movement,
    updated_at
FROM vw_cash_position
WHERE company_id = 'YOUR_COMPANY_ID';

-- 7.2 Bank Position
SELECT 
    bank_account,
    unique_reference_number,
    opening_balance,
    closing_balance,
    mtd_movement,
    updated_at
FROM vw_bank_position
WHERE company_id = 'YOUR_COMPANY_ID';

-- 7.3 Daily Cash Flow (Last 30 Days)
SELECT 
    date,
    account_name,
    inflow,
    outflow,
    net_flow
FROM vw_cash_flow_daily
WHERE company_id = 'YOUR_COMPANY_ID'
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC, account_name;

-- ============================================================
-- 8. PARTIES TAB QUERIES
-- ============================================================

-- 8.1 Party Master List
SELECT 
    party_name,
    group_name,
    party_type,
    closing_balance,
    gstin,
    state_name,
    total_transactions,
    days_since_last_txn
FROM vw_party_master
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY party_name;

-- 8.2 Customer Summary
SELECT 
    party_name,
    closing_balance,
    total_sales,
    total_transactions,
    days_since_last_txn
FROM vw_party_master
WHERE company_id = 'YOUR_COMPANY_ID'
AND party_type = 'Customer'
ORDER BY total_sales DESC NULLS LAST;

-- 8.3 Supplier Summary
SELECT 
    party_name,
    closing_balance,
    total_purchases,
    total_transactions,
    days_since_last_txn
FROM vw_party_master
WHERE company_id = 'YOUR_COMPANY_ID'
AND party_type = 'Supplier'
ORDER BY total_purchases DESC NULLS LAST;

-- 8.4 Party Transaction History
SELECT 
    party_name,
    date,
    voucher_type,
    voucher_number,
    amount,
    narration,
    stock_item_name,
    billed_qty,
    payment_mode
FROM vw_party_transactions
WHERE company_id = 'YOUR_COMPANY_ID'
AND party_name = 'SPECIFIC_PARTY_NAME'
ORDER BY date DESC;

-- ============================================================
-- 9. ITEMS TAB QUERIES
-- ============================================================

-- 9.1 Stock Item Master List
SELECT 
    stock_item_name,
    category,
    base_units,
    closing_qty,
    closing_value,
    hsn_code,
    gst_tax_rate,
    last_movement_date,
    total_sold_qty,
    total_purchased_qty
FROM vw_stock_item_master
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY stock_item_name;

-- 9.2 Fast Moving Items (High Sales)
SELECT 
    stock_item_name,
    category,
    total_sold_qty,
    total_sales_value,
    closing_qty
FROM vw_stock_item_master
WHERE company_id = 'YOUR_COMPANY_ID'
AND total_sold_qty > 0
ORDER BY total_sold_qty DESC
LIMIT 20;

-- 9.3 Low Stock Alert
SELECT 
    stock_item_name,
    category,
    closing_qty,
    total_sold_qty,
    CASE 
        WHEN closing_qty <= 0 THEN 'Out of Stock'
        WHEN closing_qty < 10 THEN 'Low Stock'
        ELSE 'Normal'
    END as stock_status
FROM vw_stock_item_master
WHERE company_id = 'YOUR_COMPANY_ID'
AND closing_qty < 10
ORDER BY closing_qty;

-- 9.4 Item Movement History
SELECT 
    stock_item_name,
    date,
    voucher_type,
    voucher_number,
    party_name,
    billed_qty,
    rate,
    amount,
    godown_name
FROM vw_item_movement_history
WHERE company_id = 'YOUR_COMPANY_ID'
AND stock_item_name = 'SPECIFIC_ITEM_NAME'
ORDER BY date DESC;

-- 9.5 Stock Summary by Category
SELECT 
    category,
    item_count,
    total_closing_qty,
    total_closing_value,
    total_sold_qty,
    total_purchased_qty
FROM vw_stock_summary_by_category
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY total_closing_value DESC;

-- ============================================================
-- 10. DASHBOARD KPI QUERY
-- ============================================================

SELECT 
    total_cash,
    total_bank,
    (total_cash + total_bank) as total_liquidity,
    total_receivables,
    total_payables,
    (total_receivables - total_payables) as net_receivables,
    mtd_sales,
    mtd_purchases,
    active_items,
    active_parties
FROM get_dashboard_kpis('YOUR_COMPANY_ID');
