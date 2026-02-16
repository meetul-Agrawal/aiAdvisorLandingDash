-- ============================================================
-- TALLY ERP DASHBOARD - MVP DBMS STRUCTURE
-- ============================================================
-- This schema provides views, functions, and queries for the
-- dashboard with all tabs: Summary, Need Attention, Sales & Receivables,
-- Top 10, Sales, Purchase, Cash & Bank, Parties, Items
-- ============================================================

-- ============================================================
-- SECTION 1: HELPER FUNCTIONS
-- ============================================================

-- Function to get financial year dates for a company
CREATE OR REPLACE FUNCTION get_financial_year(p_company_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(fy_from DATE, fy_to DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.financial_year_from,
        c.financial_year_to
    FROM companies c
    WHERE c.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate days since last transaction
CREATE OR REPLACE FUNCTION days_since_last_transaction(p_ledger_name VARCHAR, p_company_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_date DATE;
BEGIN
    SELECT MAX(v.date) INTO v_last_date
    FROM vouchers v
    JOIN ledger_entries le ON v.voucher_id = le.voucher_id
    WHERE le.ledger_name = p_ledger_name
    AND v.company_id = p_company_id
    AND v.is_deleted = FALSE;
    
    RETURN CASE 
        WHEN v_last_date IS NULL THEN NULL
        ELSE CURRENT_DATE - v_last_date
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get stock item last movement date
CREATE OR REPLACE FUNCTION stock_last_movement_date(p_stock_item_name VARCHAR, p_company_id UUID)
RETURNS DATE AS $$
BEGIN
    RETURN (
        SELECT MAX(v.date)
        FROM vouchers v
        JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
        WHERE ie.stock_item_name = p_stock_item_name
        AND v.company_id = p_company_id
        AND v.is_deleted = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 2: SUMMARY TAB VIEWS
-- ============================================================

-- View: Current Cash & Bank Balances
CREATE OR REPLACE VIEW vw_cash_bank_balances AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name,
    lm.parent_group,
    lm.closing_balance,
    CASE 
        WHEN lm.parent_group ILIKE '%cash%' THEN 'Cash'
        WHEN lm.parent_group ILIKE '%bank%' THEN 'Bank'
        ELSE 'Other'
    END as account_type,
    lm.updated_at
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%cash%' OR lm.parent_group ILIKE '%bank%')
AND c.is_active = TRUE;

-- View: Cash & Bank Transactions Detail
CREATE OR REPLACE VIEW vw_cash_bank_transactions AS
SELECT 
    v.company_id,
    c.company_name,
    v.voucher_id,
    v.voucher_number,
    v.voucher_type,
    v.date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    le.ledger_name as account_name,
    lm.parent_group as account_group,
    le.amount,
    CASE WHEN le.amount > 0 THEN 'Inflow' ELSE 'Outflow' END as transaction_direction,
    v.narration,
    ba.payment_mode,
    ba.instrument_number,
    ba.instrument_date,
    ba.bank_party_name
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
JOIN ledgers_master lm ON le.ledger_name = lm.ledger_name AND v.company_id = lm.company_id
LEFT JOIN bank_allocations ba ON le.entry_id = ba.entry_id
WHERE (lm.parent_group ILIKE '%cash%' OR lm.parent_group ILIKE '%bank%')
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE;

-- View: Inventory Summary by Date
CREATE OR REPLACE VIEW vw_inventory_summary AS
SELECT 
    v.company_id,
    c.company_name,
    v.date,
    ie.stock_item_name,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.voucher_type,
    v.voucher_number,
    ie.actual_qty,
    ie.billed_qty,
    ie.rate,
    ie.amount,
    ie.discount,
    ie.hsn_code,
    ba.godown_name,
    ba.batch_name
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN batch_allocations ba ON ie.inventory_entry_id = ba.inventory_entry_id
WHERE v.is_deleted = FALSE
AND v.is_cancelled = FALSE;

-- View: Payables Summary
CREATE OR REPLACE VIEW vw_payables_summary AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as party_name,
    lm.closing_balance as payable_amount,
    lm.parent_group,
    CASE 
        WHEN lm.closing_balance > 0 THEN 'Payable'
        WHEN lm.closing_balance < 0 THEN 'Receivable'
        ELSE 'Settled'
    END as balance_type,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE lm.parent_group ILIKE '%sundry creditors%'
OR lm.parent_group ILIKE '%payable%'
OR lm.parent_group ILIKE '%purchase%'
ORDER BY lm.closing_balance DESC;

-- ============================================================
-- SECTION 3: NEED ATTENTION TAB VIEWS
-- ============================================================

-- View: Inactive Customers (No transaction in last 90 days)
CREATE OR REPLACE VIEW vw_inactive_customers AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as customer_name,
    lm.closing_balance,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    (SELECT MAX(v.date) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as last_transaction_date,
    (SELECT v.voucher_type || ' - ' || v.voucher_number
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE
     ORDER BY v.date DESC LIMIT 1) as last_voucher
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
AND days_since_last_transaction(lm.ledger_name, lm.company_id) > 90
ORDER BY days_since_last_transaction(lm.ledger_name, lm.company_id) DESC;

-- View: Inactive Stocks (No movement in last 90 days)
CREATE OR REPLACE VIEW vw_inactive_stocks AS
SELECT 
    c.company_id,
    c.company_name,
    sim.stock_item_name,
    sim.parent_group,
    sim.category,
    sim.closing_qty,
    sim.closing_value,
    stock_last_movement_date(sim.stock_item_name, sim.company_id) as last_movement_date,
    CURRENT_DATE - stock_last_movement_date(sim.stock_item_name, sim.company_id) as days_since_last_movement
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id
WHERE stock_last_movement_date(sim.stock_item_name, sim.company_id) < CURRENT_DATE - INTERVAL '90 days'
   OR stock_last_movement_date(sim.stock_item_name, sim.company_id) IS NULL
ORDER BY days_since_last_movement DESC NULLS LAST;

-- ============================================================
-- SECTION 4: SALES & RECEIVABLES TAB VIEWS
-- ============================================================

-- View: Sales Summary
CREATE OR REPLACE VIEW vw_sales_summary AS
SELECT 
    v.company_id,
    c.company_name,
    v.date,
    v.voucher_id,
    v.voucher_number,
    v.voucher_type,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.party_gstin,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as total_amount,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as total_discount,
    v.narration,
    v.place_of_supply,
    v.is_invoice
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note')
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name;

-- View: Receivables Summary
CREATE OR REPLACE VIEW vw_receivables_summary AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as customer_name,
    lm.gstin as customer_gstin,
    lm.state_name,
    lm.closing_balance as receivable_amount,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    CASE 
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 30 THEN 'Current'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 60 THEN '1-30 Days Overdue'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 90 THEN '31-60 Days Overdue'
        ELSE '60+ Days Overdue'
    END as aging_bucket
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
AND lm.closing_balance <> 0
ORDER BY lm.closing_balance DESC;

-- View: Sales & Receivables Drill Down
CREATE OR REPLACE VIEW vw_sales_receivables_drilldown AS
SELECT 
    v.company_id,
    c.company_name,
    DATE_TRUNC('month', v.date) as month,
    v.party_ledger_name as party_name,
    COUNT(DISTINCT v.voucher_id) as transaction_count,
    SUM(CASE WHEN v.voucher_type = 'Sales' THEN le.amount ELSE 0 END) as sales_amount,
    SUM(CASE WHEN v.voucher_type = 'Credit Note' THEN le.amount ELSE 0 END) as credit_note_amount,
    SUM(CASE WHEN v.voucher_type = 'Receipt' THEN ABS(le.amount) ELSE 0 END) as receipt_amount
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note', 'Receipt')
AND v.is_deleted = FALSE
GROUP BY v.company_id, c.company_name, DATE_TRUNC('month', v.date), v.party_ledger_name;

-- ============================================================
-- SECTION 5: TOP 10 VIEWS
-- ============================================================

-- View: Top 10 Customers by Sales Value
CREATE OR REPLACE VIEW vw_top_customers_by_value AS
SELECT 
    v.company_id,
    c.company_name,
    v.party_ledger_name as customer_name,
    SUM(le.amount) as total_sales_value,
    COUNT(DISTINCT v.voucher_id) as transaction_count,
    AVG(le.amount) as avg_transaction_value,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(le.amount) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type = 'Sales'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, v.party_ledger_name
HAVING SUM(le.amount) > 0;

-- View: Top 10 Suppliers by Purchase Value
CREATE OR REPLACE VIEW vw_top_suppliers_by_value AS
SELECT 
    v.company_id,
    c.company_name,
    v.party_ledger_name as supplier_name,
    SUM(ABS(le.amount)) as total_purchase_value,
    COUNT(DISTINCT v.voucher_id) as transaction_count,
    AVG(ABS(le.amount)) as avg_transaction_value,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(ABS(le.amount)) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type = 'Purchase'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, v.party_ledger_name
HAVING SUM(ABS(le.amount)) > 0;

-- View: Top 10 Items Sold by Quantity
CREATE OR REPLACE VIEW vw_top_items_by_quantity AS
SELECT 
    v.company_id,
    c.company_name,
    ie.stock_item_name,
    SUM(ie.billed_qty) as total_quantity_sold,
    SUM(ie.amount) as total_sales_value,
    AVG(ie.rate) as avg_selling_rate,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(ie.billed_qty) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type = 'Sales'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, ie.stock_item_name
HAVING SUM(ie.billed_qty) > 0;

-- View: Top 10 Items Sold by Value
CREATE OR REPLACE VIEW vw_top_items_by_value AS
SELECT 
    v.company_id,
    c.company_name,
    ie.stock_item_name,
    SUM(ie.amount) as total_sales_value,
    SUM(ie.billed_qty) as total_quantity_sold,
    AVG(ie.rate) as avg_selling_rate,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(ie.amount) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type = 'Sales'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, ie.stock_item_name
HAVING SUM(ie.amount) > 0;

-- View: Top 10 Items Purchased by Quantity
CREATE OR REPLACE VIEW vw_top_items_purchase_qty AS
SELECT 
    v.company_id,
    c.company_name,
    ie.stock_item_name,
    SUM(ie.billed_qty) as total_quantity_purchased,
    SUM(ie.amount) as total_purchase_value,
    AVG(ie.rate) as avg_purchase_rate,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(ie.billed_qty) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type = 'Purchase'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, ie.stock_item_name
HAVING SUM(ie.billed_qty) > 0;

-- View: Top 10 Items Purchased by Value
CREATE OR REPLACE VIEW vw_top_items_purchase_value AS
SELECT 
    v.company_id,
    c.company_name,
    ie.stock_item_name,
    SUM(ie.amount) as total_purchase_value,
    SUM(ie.billed_qty) as total_quantity_purchased,
    AVG(ie.rate) as avg_purchase_rate,
    RANK() OVER (PARTITION BY v.company_id ORDER BY SUM(ie.amount) DESC) as rank
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type = 'Purchase'
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, ie.stock_item_name
HAVING SUM(ie.amount) > 0;

-- ============================================================
-- SECTION 6: SALES TAB VIEWS
-- ============================================================

-- View: All Sales Documents
CREATE OR REPLACE VIEW vw_sales_documents AS
SELECT 
    v.company_id,
    c.company_name,
    v.voucher_id,
    v.voucher_number,
    v.voucher_type,
    v.date,
    v.reference_date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.party_gstin,
    v.place_of_supply,
    v.narration,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as gross_amount,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as discount_amount,
    SUM(le.amount) as net_amount,
    v.is_invoice,
    v.is_cancelled,
    v.vch_gst_status_is_excluded,
    v.exported_at,
    dn.basic_shipping_date,
    dn.basic_ship_delivery_note
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN delivery_notes dn ON v.voucher_id = dn.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note', 'Receipt', 'Sales Order', 'Delivery Note')
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name, dn.basic_shipping_date, dn.basic_ship_delivery_note;

-- View: Receivables Aging Detail
CREATE OR REPLACE VIEW vw_receivables_aging AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as customer_name,
    lm.closing_balance as outstanding_amount,
    v.date as transaction_date,
    v.voucher_number,
    v.voucher_type,
    le.amount,
    CURRENT_DATE - v.date as days_outstanding,
    CASE 
        WHEN CURRENT_DATE - v.date <= 0 THEN 'Current'
        WHEN CURRENT_DATE - v.date <= 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - v.date <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - v.date <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END as aging_bucket
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN ledger_entries le ON lm.ledger_name = le.ledger_name
LEFT JOIN vouchers v ON le.voucher_id = v.voucher_id AND v.is_deleted = FALSE
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
AND lm.closing_balance > 0;

-- ============================================================
-- SECTION 7: PURCHASE TAB VIEWS
-- ============================================================

-- View: All Purchase Documents
CREATE OR REPLACE VIEW vw_purchase_documents AS
SELECT 
    v.company_id,
    c.company_name,
    v.voucher_id,
    v.voucher_number,
    v.voucher_type,
    v.date,
    v.reference_date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.party_gstin,
    v.place_of_supply,
    v.narration,
    SUM(ABS(le.amount)) as gross_amount,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as discount_amount,
    SUM(ABS(le.amount)) as net_amount,
    v.is_cancelled,
    v.vch_gst_status_is_excluded,
    v.exported_at
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type IN ('Purchase', 'Debit Note', 'Payment', 'Purchase Order', 'Receipt Note')
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name;

-- View: Payables Aging Detail
CREATE OR REPLACE VIEW vw_payables_aging AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as supplier_name,
    lm.closing_balance as outstanding_amount,
    v.date as transaction_date,
    v.voucher_number,
    v.voucher_type,
    le.amount,
    CURRENT_DATE - v.date as days_outstanding,
    CASE 
        WHEN CURRENT_DATE - v.date <= 0 THEN 'Current'
        WHEN CURRENT_DATE - v.date <= 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - v.date <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - v.date <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END as aging_bucket
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN ledger_entries le ON lm.ledger_name = le.ledger_name
LEFT JOIN vouchers v ON le.voucher_id = v.voucher_id AND v.is_deleted = FALSE
WHERE (lm.parent_group ILIKE '%sundry creditors%' OR lm.parent_group ILIKE '%payable%')
AND lm.closing_balance > 0;

-- ============================================================
-- SECTION 8: CASH & BANK TAB VIEWS
-- ============================================================

-- View: Cash Position Summary
CREATE OR REPLACE VIEW vw_cash_position AS
SELECT 
    c.company_id,
    c.company_name,
    'Cash' as account_type,
    lm.ledger_name as cash_account,
    lm.opening_balance,
    lm.closing_balance,
    (SELECT SUM(le.amount) 
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_movement,
    lm.updated_at
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE lm.parent_group ILIKE '%cash%'
ORDER BY lm.closing_balance DESC;

-- View: Bank Position Summary
CREATE OR REPLACE VIEW vw_bank_position AS
SELECT 
    c.company_id,
    c.company_name,
    'Bank' as account_type,
    lm.ledger_name as bank_account,
    ba.unique_reference_number,
    lm.opening_balance,
    lm.closing_balance,
    (SELECT SUM(le.amount) 
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_movement,
    lm.updated_at
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN bank_allocations ba ON lm.ledger_name = ba.bank_party_name
WHERE lm.parent_group ILIKE '%bank%'
GROUP BY c.company_id, c.company_name, lm.ledger_id, ba.unique_reference_number
ORDER BY lm.closing_balance DESC;

-- View: Cash Flow Statement (Daily)
CREATE OR REPLACE VIEW vw_cash_flow_daily AS
SELECT 
    v.company_id,
    c.company_name,
    v.date,
    lm.ledger_name as account_name,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as inflow,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as outflow,
    SUM(le.amount) as net_flow
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
JOIN ledgers_master lm ON le.ledger_name = lm.ledger_name AND v.company_id = lm.company_id
WHERE (lm.parent_group ILIKE '%cash%' OR lm.parent_group ILIKE '%bank%')
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, v.date, lm.ledger_name;

-- ============================================================
-- SECTION 9: PARTIES TAB VIEWS
-- ============================================================

-- View: Party Master with Summary
CREATE OR REPLACE VIEW vw_party_master AS
SELECT 
    lm.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as party_name,
    lm.parent_group as group_name,
    lm.opening_balance,
    lm.closing_balance,
    lm.gst_registration_type,
    lm.gstin,
    lm.state_name,
    lm.country,
    lm.pincode,
    lm.email,
    lm.phone,
    lm.pan,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    CASE 
        WHEN lm.parent_group ILIKE '%sundry debtors%' THEN 'Customer'
        WHEN lm.parent_group ILIKE '%sundry creditors%' THEN 'Supplier'
        ELSE 'Other'
    END as party_type,
    (SELECT COUNT(DISTINCT v.voucher_id) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_transactions,
    (SELECT SUM(le.amount) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.voucher_type = 'Sales'
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_sales,
    (SELECT SUM(ABS(le.amount)) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_purchases
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id;

-- View: Party Transaction History
CREATE OR REPLACE VIEW vw_party_transactions AS
SELECT 
    v.company_id,
    c.company_name,
    le.ledger_name as party_name,
    v.date,
    v.voucher_type,
    v.voucher_number,
    le.amount,
    v.narration,
    v.party_gstin,
    ie.stock_item_name,
    ie.billed_qty,
    ie.rate as item_rate,
    ba.payment_mode,
    ba.instrument_number
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN bank_allocations ba ON le.entry_id = ba.entry_id
WHERE v.is_deleted = FALSE
ORDER BY v.date DESC;

-- ============================================================
-- SECTION 10: ITEMS TAB VIEWS
-- ============================================================

-- View: Stock Item Master with Summary
CREATE OR REPLACE VIEW vw_stock_item_master AS
SELECT 
    sim.company_id,
    c.company_name,
    sim.stock_item_id,
    sim.stock_item_name,
    sim.parent_group,
    sim.category,
    sim.base_units,
    sim.opening_qty,
    sim.opening_rate,
    sim.opening_value,
    sim.closing_qty,
    sim.closing_value,
    sim.hsn_code,
    sim.gst_tax_rate,
    sim.is_gst_included,
    stock_last_movement_date(sim.stock_item_name, sim.company_id) as last_movement_date,
    (SELECT SUM(ie.billed_qty) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sold_qty,
    (SELECT SUM(ie.amount) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sales_value,
    (SELECT SUM(ie.billed_qty) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchased_qty,
    (SELECT SUM(ie.amount) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchase_value
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id;

-- View: Item Movement History
CREATE OR REPLACE VIEW vw_item_movement_history AS
SELECT 
    v.company_id,
    c.company_name,
    ie.stock_item_name,
    v.date,
    v.voucher_type,
    v.voucher_number,
    v.party_ledger_name as party_name,
    ie.actual_qty,
    ie.billed_qty,
    ie.rate,
    ie.amount,
    ie.discount,
    ie.hsn_code,
    ba.godown_name,
    ba.batch_name,
    ird.gst_rate as applied_gst_rate
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN batch_allocations ba ON ie.inventory_entry_id = ba.inventory_entry_id
LEFT JOIN inventory_rate_details ird ON ie.inventory_entry_id = ird.inventory_entry_id
WHERE v.is_deleted = FALSE
ORDER BY v.date DESC;

-- View: Stock Summary by Category
CREATE OR REPLACE VIEW vw_stock_summary_by_category AS
SELECT 
    sim.company_id,
    c.company_name,
    sim.category,
    COUNT(DISTINCT sim.stock_item_name) as item_count,
    SUM(sim.opening_qty) as total_opening_qty,
    SUM(sim.opening_value) as total_opening_value,
    SUM(sim.closing_qty) as total_closing_qty,
    SUM(sim.closing_value) as total_closing_value,
    (SELECT SUM(ie.billed_qty) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sold_qty,
    (SELECT SUM(ie.billed_qty) 
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchased_qty
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id
GROUP BY sim.company_id, c.company_name, sim.category;

-- ============================================================
-- SECTION 11: DASHBOARD KPI FUNCTIONS
-- ============================================================

-- Function: Get Dashboard Summary KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_company_id UUID)
RETURNS TABLE (
    total_cash DECIMAL(18,4),
    total_bank DECIMAL(18,4),
    total_receivables DECIMAL(18,4),
    total_payables DECIMAL(18,4),
    mtd_sales DECIMAL(18,4),
    mtd_purchases DECIMAL(18,4),
    active_items BIGINT,
    active_parties BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Cash Balance
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND parent_group ILIKE '%cash%'), 0) as total_cash,
        
        -- Bank Balance
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND parent_group ILIKE '%bank%'), 0) as total_bank,
        
        -- Receivables
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND (parent_group ILIKE '%sundry debtors%' OR parent_group ILIKE '%receivable%')
                  AND closing_balance > 0), 0) as total_receivables,
        
        -- Payables
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND (parent_group ILIKE '%sundry creditors%' OR parent_group ILIKE '%payable%')
                  AND closing_balance > 0), 0) as total_payables,
        
        -- MTD Sales
        COALESCE((SELECT SUM(le.amount) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Sales'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) as mtd_sales,
        
        -- MTD Purchases
        COALESCE((SELECT SUM(ABS(le.amount)) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Purchase'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) as mtd_purchases,
        
        -- Active Items
        (SELECT COUNT(*) 
         FROM stock_items_master 
         WHERE company_id = p_company_id) as active_items,
        
        -- Active Parties
        (SELECT COUNT(*) 
         FROM ledgers_master 
         WHERE company_id = p_company_id) as active_parties;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 12: INDEXES FOR DASHBOARD PERFORMANCE
-- ============================================================

-- Additional indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_vouchers_date_type ON vouchers(date, voucher_type) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vouchers_party_date ON vouchers(party_ledger_name, date) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_entries_ledger_amount ON ledger_entries(ledger_name, amount);
CREATE INDEX IF NOT EXISTS idx_inventory_entries_item_date ON inventory_entries(stock_item_name, created_at);
CREATE INDEX IF NOT EXISTS idx_ledgers_group_balance ON ledgers_master(parent_group, closing_balance);

-- ============================================================
-- SECTION 13: SAMPLE QUERY USAGE
-- ============================================================

/*
-- Get Dashboard KPIs for a company:
SELECT * FROM get_dashboard_kpis('company-uuid-here');

-- Get Top 10 Customers:
SELECT * FROM vw_top_customers_by_value WHERE rank <= 10 AND company_id = 'company-uuid-here';

-- Get Cash & Bank Balances:
SELECT * FROM vw_cash_bank_balances WHERE company_id = 'company-uuid-here';

-- Get Inactive Customers:
SELECT * FROM vw_inactive_customers WHERE company_id = 'company-uuid-here';

-- Get Sales Documents:
SELECT * FROM vw_sales_documents WHERE company_id = 'company-uuid-here' AND date >= '2024-01-01';

-- Get Inventory Summary:
SELECT * FROM vw_inventory_summary WHERE company_id = 'company-uuid-here' ORDER BY date DESC;

-- Get Party Details:
SELECT * FROM vw_party_master WHERE company_id = 'company-uuid-here';

-- Get Stock Item Details:
SELECT * FROM vw_stock_item_master WHERE company_id = 'company-uuid-here';
*/
