-- ============================================================
-- TALLY ERP DASHBOARD - COMPLETE MVP DBMS STRUCTURE
-- ============================================================
-- Comprehensive database schema with views, functions, and stored procedures
-- for all 9 dashboard tabs:
-- 1. Summary | 2. Need Attention | 3. Sales & Receivables | 4. Top 10
-- 5. Sales | 6. Purchase | 7. Cash & Bank | 8. Parties | 9. Items
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS & CONFIGURATION
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 2: HELPER FUNCTIONS
-- ============================================================

-- Function: Get Financial Year for a Company
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Calculate Days Since Last Transaction for a Ledger
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Get Stock Item Last Movement Date
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Calculate Ledger Balance as of Date
CREATE OR REPLACE FUNCTION get_ledger_balance_as_of(
    p_ledger_name VARCHAR, 
    p_company_id UUID, 
    p_as_of_date DATE
)
RETURNS DECIMAL(18,4) AS $$
DECLARE
    v_balance DECIMAL(18,4);
BEGIN
    SELECT COALESCE(SUM(le.amount), 0) INTO v_balance
    FROM vouchers v
    JOIN ledger_entries le ON v.voucher_id = le.voucher_id
    WHERE le.ledger_name = p_ledger_name
    AND v.company_id = p_company_id
    AND v.date <= p_as_of_date
    AND v.is_deleted = FALSE;
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- SECTION 3: TAB 1 - SUMMARY VIEWS
-- ============================================================

-- View: Current Cash & Bank Balances Summary
CREATE OR REPLACE VIEW vw_cash_bank_balances AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name,
    lm.parent_group,
    lm.opening_balance,
    lm.closing_balance,
    CASE 
        WHEN lm.parent_group ILIKE '%cash%' THEN 'Cash'
        WHEN lm.parent_group ILIKE '%bank%' THEN 'Bank'
        ELSE 'Other'
    END as account_type,
    lm.gstin,
    lm.state_name,
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
    v.reference_date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    le.ledger_name as account_name,
    lm.parent_group as account_group,
    le.amount,
    CASE 
        WHEN le.amount > 0 THEN 'Inflow' 
        ELSE 'Outflow' 
    END as transaction_direction,
    ABS(le.amount) as absolute_amount,
    v.narration,
    ba.payment_mode,
    ba.instrument_number,
    ba.instrument_date,
    ba.bank_party_name,
    ba.transaction_type,
    ba.unique_reference_number
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
JOIN ledgers_master lm ON le.ledger_name = lm.ledger_name AND v.company_id = lm.company_id
LEFT JOIN bank_allocations ba ON le.entry_id = ba.entry_id
WHERE (lm.parent_group ILIKE '%cash%' OR lm.parent_group ILIKE '%bank%')
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE;

-- View: Inventory Management Summary with Drill-down
CREATE OR REPLACE VIEW vw_inventory_summary AS
SELECT 
    v.company_id,
    c.company_name,
    v.date,
    ie.stock_item_name,
    sim.category as item_category,
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
    ba.batch_name,
    ba.destination_godown_name,
    ird.gst_rate as applied_gst_rate
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN stock_items_master sim ON ie.stock_item_name = sim.stock_item_name AND v.company_id = sim.company_id
LEFT JOIN batch_allocations ba ON ie.inventory_entry_id = ba.inventory_entry_id
LEFT JOIN inventory_rate_details ird ON ie.inventory_entry_id = ird.inventory_entry_id
WHERE v.is_deleted = FALSE
AND v.is_cancelled = FALSE;

-- View: Payables Summary with Aging
CREATE OR REPLACE VIEW vw_payables_summary AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as party_name,
    lm.gstin as party_gstin,
    lm.state_name,
    lm.closing_balance as payable_amount,
    lm.opening_balance,
    lm.parent_group,
    CASE 
        WHEN lm.closing_balance > 0 THEN 'Payable'
        WHEN lm.closing_balance < 0 THEN 'Receivable'
        ELSE 'Settled'
    END as balance_type,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    (SELECT MAX(v.date) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as last_transaction_date
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry creditors%' 
       OR lm.parent_group ILIKE '%payable%'
       OR lm.parent_group ILIKE '%supplier%')
ORDER BY lm.closing_balance DESC;

-- ============================================================
-- SECTION 4: TAB 2 - NEED ATTENTION VIEWS
-- ============================================================

-- View: Inactive Customers (No transaction in last 90 days)
CREATE OR REPLACE VIEW vw_inactive_customers AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as customer_name,
    lm.gstin as customer_gstin,
    lm.state_name,
    lm.closing_balance,
    lm.opening_balance,
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
     ORDER BY v.date DESC LIMIT 1) as last_voucher,
    (SELECT SUM(le.amount)
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.voucher_type = 'Sales'
     AND v.is_deleted = FALSE) as total_sales_value,
    (SELECT COUNT(DISTINCT v.voucher_id)
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_transactions
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%' OR lm.parent_group ILIKE '%customer%')
AND days_since_last_transaction(lm.ledger_name, lm.company_id) > 90
ORDER BY days_since_last_transaction(lm.ledger_name, lm.company_id) DESC;

-- View: Inactive Stocks (No movement in last 90 days)
CREATE OR REPLACE VIEW vw_inactive_stocks AS
SELECT 
    c.company_id,
    c.company_name,
    sim.stock_item_id,
    sim.stock_item_name,
    sim.parent_group,
    sim.category,
    sim.base_units,
    sim.closing_qty,
    sim.closing_value,
    sim.opening_qty,
    sim.opening_value,
    sim.hsn_code,
    sim.gst_tax_rate,
    stock_last_movement_date(sim.stock_item_name, sim.company_id) as last_movement_date,
    CURRENT_DATE - stock_last_movement_date(sim.stock_item_name, sim.company_id) as days_since_last_movement,
    (SELECT SUM(ie.billed_qty)
     FROM inventory_entries ie
     JOIN vouchers v ON ie.voucher_id = v.voucher_id
     WHERE ie.stock_item_name = sim.stock_item_name
     AND v.company_id = sim.company_id
     AND v.voucher_type = 'Sales'
     AND v.is_deleted = FALSE) as total_sold_qty,
    (SELECT SUM(ie.amount)
     FROM inventory_entries ie
     JOIN vouchers v ON ie.voucher_id = v.voucher_id
     WHERE ie.stock_item_name = sim.stock_item_name
     AND v.company_id = sim.company_id
     AND v.voucher_type = 'Sales'
     AND v.is_deleted = FALSE) as total_sold_value
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id
WHERE stock_last_movement_date(sim.stock_item_name, sim.company_id) < CURRENT_DATE - INTERVAL '90 days'
   OR stock_last_movement_date(sim.stock_item_name, sim.company_id) IS NULL
ORDER BY days_since_last_movement DESC NULLS LAST;

-- ============================================================
-- SECTION 5: TAB 3 - SALES & RECEIVABLES VIEWS
-- ============================================================

-- View: Sales Summary
CREATE OR REPLACE VIEW vw_sales_summary AS
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
    v.is_invoice,
    v.is_cancelled,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as gross_amount,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as discount_amount,
    SUM(le.amount) as net_amount,
    COUNT(DISTINCT ie.inventory_entry_id) as item_count,
    SUM(ie.billed_qty) as total_quantity,
    v.exported_at
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note')
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name;

-- View: Receivables Summary with Aging
CREATE OR REPLACE VIEW vw_receivables_summary AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as customer_name,
    lm.gstin as customer_gstin,
    lm.state_name,
    lm.closing_balance as receivable_amount,
    lm.opening_balance,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    CASE 
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 30 THEN 'Current'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 60 THEN '1-30 Days Overdue'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 90 THEN '31-60 Days Overdue'
        ELSE '60+ Days Overdue'
    END as aging_bucket,
    (SELECT MAX(v.date) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as last_transaction_date,
    (SELECT SUM(le.amount)
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.voucher_type = 'Sales'
     AND v.is_deleted = FALSE) as total_sales_value,
    (SELECT SUM(ABS(le.amount))
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.voucher_type = 'Receipt'
     AND v.is_deleted = FALSE) as total_receipts
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
AND lm.closing_balance <> 0
ORDER BY lm.closing_balance DESC;

-- View: Sales & Receivables Drill Down by Month and Party
CREATE OR REPLACE VIEW vw_sales_receivables_drilldown AS
SELECT 
    v.company_id,
    c.company_name,
    DATE_TRUNC('month', v.date) as month,
    v.party_ledger_name as party_name,
    COUNT(DISTINCT v.voucher_id) as transaction_count,
    SUM(CASE WHEN v.voucher_type = 'Sales' THEN le.amount ELSE 0 END) as sales_amount,
    SUM(CASE WHEN v.voucher_type = 'Credit Note' THEN ABS(le.amount) ELSE 0 END) as credit_note_amount,
    SUM(CASE WHEN v.voucher_type = 'Receipt' THEN ABS(le.amount) ELSE 0 END) as receipt_amount,
    SUM(CASE WHEN v.voucher_type = 'Sales' THEN le.amount ELSE 0 END) - 
    SUM(CASE WHEN v.voucher_type = 'Credit Note' THEN ABS(le.amount) ELSE 0 END) - 
    SUM(CASE WHEN v.voucher_type = 'Receipt' THEN ABS(le.amount) ELSE 0 END) as net_receivable
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note', 'Receipt')
AND v.is_deleted = FALSE
GROUP BY v.company_id, c.company_name, DATE_TRUNC('month', v.date), v.party_ledger_name;

-- ============================================================
-- SECTION 6: TAB 4 - TOP 10 VIEWS
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
    MIN(v.date) as first_transaction_date,
    MAX(v.date) as last_transaction_date,
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
    MIN(v.date) as first_transaction_date,
    MAX(v.date) as last_transaction_date,
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
    COUNT(DISTINCT v.voucher_id) as sales_transactions,
    MIN(v.date) as first_sale_date,
    MAX(v.date) as last_sale_date,
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
    COUNT(DISTINCT v.voucher_id) as sales_transactions,
    MIN(v.date) as first_sale_date,
    MAX(v.date) as last_sale_date,
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
    COUNT(DISTINCT v.voucher_id) as purchase_transactions,
    MIN(v.date) as first_purchase_date,
    MAX(v.date) as last_purchase_date,
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
    COUNT(DISTINCT v.voucher_id) as purchase_transactions,
    MIN(v.date) as first_purchase_date,
    MAX(v.date) as last_purchase_date,
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
-- SECTION 7: TAB 5 - SALES VIEWS
-- ============================================================

-- View: All Sales Documents (Sales, Credit Note, Receipt, Sales Order, Delivery Note)
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
    v.is_invoice,
    v.is_cancelled,
    v.is_post_dated,
    v.vch_gst_status_is_excluded,
    v.vch_gst_status_is_applicable,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as gross_amount,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as discount_amount,
    SUM(le.amount) as net_amount,
    SUM(ie.billed_qty) as total_quantity,
    COUNT(DISTINCT ie.inventory_entry_id) as item_count,
    v.exported_at,
    dn.basic_shipping_date,
    dn.basic_ship_delivery_note,
    ebd.eway_bill_number,
    gd.cgst_amount,
    gd.sgst_amount,
    gd.igst_amount,
    gd.cess_amount
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN delivery_notes dn ON v.voucher_id = dn.voucher_id
LEFT JOIN eway_bill_details ebd ON v.voucher_id = ebd.voucher_id
LEFT JOIN gst_details gd ON v.voucher_id = gd.voucher_id
WHERE v.voucher_type IN ('Sales', 'Credit Note', 'Receipt', 'Sales Order', 'Delivery Note')
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name, 
         dn.basic_shipping_date, dn.basic_ship_delivery_note,
         ebd.eway_bill_number, gd.cgst_amount, gd.sgst_amount, gd.igst_amount, gd.cess_amount;

-- View: Receivables Aging Detail
CREATE OR REPLACE VIEW vw_receivables_aging AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as customer_name,
    lm.closing_balance as outstanding_amount,
    v.date as transaction_date,
    v.voucher_number,
    v.voucher_type,
    le.amount as transaction_amount,
    CURRENT_DATE - v.date as days_outstanding,
    CASE 
        WHEN CURRENT_DATE - v.date <= 0 THEN 'Current'
        WHEN CURRENT_DATE - v.date <= 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - v.date <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - v.date <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END as aging_bucket,
    v.narration
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN ledger_entries le ON lm.ledger_name = le.ledger_name
LEFT JOIN vouchers v ON le.voucher_id = v.voucher_id AND v.is_deleted = FALSE
WHERE (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
AND lm.closing_balance > 0
AND v.date IS NOT NULL;

-- View: Sales Order Details
CREATE OR REPLACE VIEW vw_sales_orders AS
SELECT 
    v.company_id,
    c.company_name,
    v.voucher_id,
    v.voucher_number,
    v.date as order_date,
    v.reference_date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.party_gstin,
    v.place_of_supply,
    v.narration,
    SUM(le.amount) as order_value,
    SUM(ie.billed_qty) as total_quantity,
    dn.basic_shipping_date,
    dn.basic_ship_delivery_note,
    v.is_cancelled
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN delivery_notes dn ON v.voucher_id = dn.voucher_id
WHERE v.voucher_type = 'Sales Order'
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name, dn.basic_shipping_date, dn.basic_ship_delivery_note;

-- ============================================================
-- SECTION 8: TAB 6 - PURCHASE VIEWS
-- ============================================================

-- View: All Purchase Documents (Purchase, Debit Note, Payment, Purchase Order, Receipt Note)
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
    v.is_cancelled,
    v.is_post_dated,
    v.vch_gst_status_is_excluded,
    v.vch_gst_status_is_applicable,
    SUM(ABS(le.amount)) as gross_amount,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as discount_amount,
    SUM(ABS(le.amount)) as net_amount,
    SUM(ie.billed_qty) as total_quantity,
    COUNT(DISTINCT ie.inventory_entry_id) as item_count,
    v.exported_at,
    gd.cgst_amount,
    gd.sgst_amount,
    gd.igst_amount,
    gd.cess_amount
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN gst_details gd ON v.voucher_id = gd.voucher_id
WHERE v.voucher_type IN ('Purchase', 'Debit Note', 'Payment', 'Purchase Order', 'Receipt Note')
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name,
         gd.cgst_amount, gd.sgst_amount, gd.igst_amount, gd.cess_amount;

-- View: Payables Aging Detail
CREATE OR REPLACE VIEW vw_payables_aging AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_id,
    lm.ledger_name as supplier_name,
    lm.closing_balance as outstanding_amount,
    v.date as transaction_date,
    v.voucher_number,
    v.voucher_type,
    ABS(le.amount) as transaction_amount,
    CURRENT_DATE - v.date as days_outstanding,
    CASE 
        WHEN CURRENT_DATE - v.date <= 0 THEN 'Current'
        WHEN CURRENT_DATE - v.date <= 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - v.date <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - v.date <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END as aging_bucket,
    v.narration
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN ledger_entries le ON lm.ledger_name = le.ledger_name
LEFT JOIN vouchers v ON le.voucher_id = v.voucher_id AND v.is_deleted = FALSE
WHERE (lm.parent_group ILIKE '%sundry creditors%' OR lm.parent_group ILIKE '%payable%')
AND lm.closing_balance > 0
AND v.date IS NOT NULL;

-- View: Purchase Order Details
CREATE OR REPLACE VIEW vw_purchase_orders AS
SELECT 
    v.company_id,
    c.company_name,
    v.voucher_id,
    v.voucher_number,
    v.date as order_date,
    v.reference_date,
    v.party_ledger_name as party_name,
    v.party_name as party_display_name,
    v.party_gstin,
    v.place_of_supply,
    v.narration,
    SUM(ABS(le.amount)) as order_value,
    SUM(ie.billed_qty) as total_quantity,
    v.is_cancelled
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
WHERE v.voucher_type = 'Purchase Order'
AND v.is_deleted = FALSE
GROUP BY v.voucher_id, c.company_id, c.company_name;

-- ============================================================
-- SECTION 9: TAB 7 - CASH & BANK VIEWS
-- ============================================================

-- View: Cash Position Summary
CREATE OR REPLACE VIEW vw_cash_position AS
SELECT 
    c.company_id,
    c.company_name,
    'Cash' as account_type,
    lm.ledger_id,
    lm.ledger_name as cash_account,
    lm.opening_balance,
    lm.closing_balance,
    (SELECT COALESCE(SUM(le.amount), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_movement,
    (SELECT COALESCE(SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_inflow,
    (SELECT COALESCE(SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_outflow,
    lm.updated_at,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn
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
    lm.ledger_id,
    lm.ledger_name as bank_account,
    ba.unique_reference_number as account_number,
    lm.opening_balance,
    lm.closing_balance,
    (SELECT COALESCE(SUM(le.amount), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_movement,
    (SELECT COALESCE(SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_inflow,
    (SELECT COALESCE(SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END), 0)
     FROM ledger_entries le 
     JOIN vouchers v ON le.voucher_id = v.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
     AND v.is_deleted = FALSE) as mtd_outflow,
    lm.updated_at,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    ba.payment_mode as preferred_payment_mode
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
LEFT JOIN bank_allocations ba ON lm.ledger_name = ba.bank_party_name
WHERE lm.parent_group ILIKE '%bank%'
GROUP BY c.company_id, c.company_name, lm.ledger_id, ba.unique_reference_number, ba.payment_mode
ORDER BY lm.closing_balance DESC;

-- View: Cash Flow Statement (Daily)
CREATE OR REPLACE VIEW vw_cash_flow_daily AS
SELECT 
    v.company_id,
    c.company_name,
    v.date,
    lm.ledger_name as account_name,
    CASE 
        WHEN lm.parent_group ILIKE '%cash%' THEN 'Cash'
        WHEN lm.parent_group ILIKE '%bank%' THEN 'Bank'
    END as account_type,
    SUM(CASE WHEN le.amount > 0 THEN le.amount ELSE 0 END) as inflow,
    SUM(CASE WHEN le.amount < 0 THEN ABS(le.amount) ELSE 0 END) as outflow,
    SUM(le.amount) as net_flow,
    COUNT(DISTINCT v.voucher_id) as transaction_count
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
JOIN ledgers_master lm ON le.ledger_name = lm.ledger_name AND v.company_id = lm.company_id
WHERE (lm.parent_group ILIKE '%cash%' OR lm.parent_group ILIKE '%bank%')
AND v.is_deleted = FALSE
AND v.is_cancelled = FALSE
GROUP BY v.company_id, c.company_name, v.date, lm.ledger_name, lm.parent_group;

-- View: Bank Allocation Details
CREATE OR REPLACE VIEW vw_bank_allocation_details AS
SELECT 
    ba.company_id,
    c.company_name,
    ba.bank_alloc_id,
    ba.entry_id,
    le.ledger_name as ledger_account,
    ba.date,
    ba.instrument_date,
    ba.name,
    ba.transaction_type,
    ba.payment_favouring,
    ba.payment_mode,
    ba.bank_party_name,
    ba.instrument_number,
    ba.unique_reference_number,
    ba.amount,
    v.voucher_number,
    v.voucher_type,
    v.party_ledger_name as party_name
FROM bank_allocations ba
JOIN companies c ON ba.company_id = c.company_id
JOIN ledger_entries le ON ba.entry_id = le.entry_id
LEFT JOIN vouchers v ON le.voucher_id = v.voucher_id
ORDER BY ba.date DESC;

-- ============================================================
-- SECTION 10: TAB 8 - PARTIES VIEWS
-- ============================================================

-- View: Party Master with Complete Summary
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
    lm.pan,
    lm.state_name,
    lm.country,
    lm.pincode,
    lm.email,
    lm.phone,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    CASE 
        WHEN lm.parent_group ILIKE '%sundry debtors%' THEN 'Customer'
        WHEN lm.parent_group ILIKE '%sundry creditors%' THEN 'Supplier'
        ELSE 'Other'
    END as party_type,
    CASE 
        WHEN lm.closing_balance > 0 THEN 'Receivable'
        WHEN lm.closing_balance < 0 THEN 'Payable'
        ELSE 'Settled'
    END as balance_status,
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
     AND v.is_deleted = FALSE) as total_purchases,
    (SELECT SUM(ABS(le.amount)) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.voucher_type = 'Receipt'
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_receipts,
    (SELECT SUM(ABS(le.amount)) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.voucher_type = 'Payment'
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as total_payments,
    (SELECT MAX(v.date) 
     FROM vouchers v 
     JOIN ledger_entries le ON v.voucher_id = le.voucher_id 
     WHERE le.ledger_name = lm.ledger_name 
     AND v.company_id = lm.company_id
     AND v.is_deleted = FALSE) as last_transaction_date,
    lm.created_at,
    lm.updated_at
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id;

-- View: Party Transaction History
CREATE OR REPLACE VIEW vw_party_transactions AS
SELECT 
    v.company_id,
    c.company_name,
    le.ledger_name as party_name,
    lm.parent_group as party_group,
    v.voucher_id,
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
    ba.instrument_number,
    ba.instrument_date,
    ba.transaction_type as bank_transaction_type,
    dn.basic_ship_delivery_note as delivery_note,
    dn.basic_shipping_date
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN ledger_entries le ON v.voucher_id = le.voucher_id
LEFT JOIN ledgers_master lm ON le.ledger_name = lm.ledger_name AND v.company_id = lm.company_id
LEFT JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN bank_allocations ba ON le.entry_id = ba.entry_id
LEFT JOIN delivery_notes dn ON v.voucher_id = dn.voucher_id
WHERE v.is_deleted = FALSE
ORDER BY v.date DESC;

-- View: Party Outstanding Statement
CREATE OR REPLACE VIEW vw_party_outstanding AS
SELECT 
    c.company_id,
    c.company_name,
    lm.ledger_name as party_name,
    lm.parent_group as party_group,
    CASE 
        WHEN lm.parent_group ILIKE '%sundry debtors%' THEN 'Customer'
        WHEN lm.parent_group ILIKE '%sundry creditors%' THEN 'Supplier'
        ELSE 'Other'
    END as party_type,
    lm.closing_balance as outstanding_amount,
    lm.gstin,
    lm.state_name,
    lm.email,
    lm.phone,
    days_since_last_transaction(lm.ledger_name, lm.company_id) as days_since_last_txn,
    CASE 
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 30 THEN 'Current'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 60 THEN '1-30 Days Overdue'
        WHEN days_since_last_transaction(lm.ledger_name, lm.company_id) <= 90 THEN '31-60 Days Overdue'
        ELSE '60+ Days Overdue'
    END as aging_status
FROM ledgers_master lm
JOIN companies c ON lm.company_id = c.company_id
WHERE (lm.parent_group ILIKE '%sundry debtors%' 
       OR lm.parent_group ILIKE '%sundry creditors%'
       OR lm.parent_group ILIKE '%receivable%'
       OR lm.parent_group ILIKE '%payable%')
AND lm.closing_balance <> 0
ORDER BY ABS(lm.closing_balance) DESC;

-- ============================================================
-- SECTION 11: TAB 9 - ITEMS VIEWS
-- ============================================================

-- View: Stock Item Master with Complete Summary
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
    sim.gst_applicable,
    stock_last_movement_date(sim.stock_item_name, sim.company_id) as last_movement_date,
    CURRENT_DATE - stock_last_movement_date(sim.stock_item_name, sim.company_id) as days_since_last_movement,
    (SELECT COALESCE(SUM(ie.billed_qty), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sold_qty,
    (SELECT COALESCE(SUM(ie.amount), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sales_value,
    (SELECT COALESCE(SUM(ie.billed_qty), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchased_qty,
    (SELECT COALESCE(SUM(ie.amount), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchase_value,
    CASE 
        WHEN sim.closing_qty <= 0 THEN 'Out of Stock'
        WHEN sim.closing_qty < 10 THEN 'Low Stock'
        ELSE 'Normal'
    END as stock_status,
    sim.created_at,
    sim.updated_at
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id;

-- View: Item Movement History
CREATE OR REPLACE VIEW vw_item_movement_history AS
SELECT 
    v.company_id,
    c.company_name,
    ie.inventory_entry_id,
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
    ba.destination_godown_name,
    ird.gst_rate as applied_gst_rate,
    ird.gst_rate_duty_head,
    iaa.ledger_name as accounting_ledger,
    v.narration
FROM vouchers v
JOIN companies c ON v.company_id = c.company_id
JOIN inventory_entries ie ON v.voucher_id = ie.voucher_id
LEFT JOIN batch_allocations ba ON ie.inventory_entry_id = ba.inventory_entry_id
LEFT JOIN inventory_rate_details ird ON ie.inventory_entry_id = ird.inventory_entry_id
LEFT JOIN inventory_accounting_allocations iaa ON ie.inventory_entry_id = iaa.inventory_entry_id
WHERE v.is_deleted = FALSE
ORDER BY v.date DESC;

-- View: Stock Summary by Category
CREATE OR REPLACE VIEW vw_stock_summary_by_category AS
SELECT 
    sim.company_id,
    c.company_name,
    COALESCE(sim.category, 'Uncategorized') as category,
    COUNT(DISTINCT sim.stock_item_name) as item_count,
    SUM(sim.opening_qty) as total_opening_qty,
    SUM(sim.opening_value) as total_opening_value,
    SUM(sim.closing_qty) as total_closing_qty,
    SUM(sim.closing_value) as total_closing_value,
    (SELECT COALESCE(SUM(ie.billed_qty), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sold_qty,
    (SELECT COALESCE(SUM(ie.amount), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Sales'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_sold_value,
    (SELECT COALESCE(SUM(ie.billed_qty), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchased_qty,
    (SELECT COALESCE(SUM(ie.amount), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     JOIN stock_items_master s ON ie.stock_item_name = s.stock_item_name
     WHERE s.category = sim.category 
     AND v.voucher_type = 'Purchase'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as total_purchased_value
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id
GROUP BY sim.company_id, c.company_name, sim.category;

-- View: Low Stock Alert
CREATE OR REPLACE VIEW vw_low_stock_alert AS
SELECT 
    sim.company_id,
    c.company_name,
    sim.stock_item_id,
    sim.stock_item_name,
    sim.category,
    sim.base_units,
    sim.closing_qty,
    sim.closing_value,
    sim.opening_qty,
    (SELECT COALESCE(SUM(ie.billed_qty), 0)
     FROM inventory_entries ie 
     JOIN vouchers v ON ie.voucher_id = v.voucher_id 
     WHERE ie.stock_item_name = sim.stock_item_name 
     AND v.voucher_type = 'Sales'
     AND v.date >= CURRENT_DATE - INTERVAL '30 days'
     AND v.company_id = sim.company_id
     AND v.is_deleted = FALSE) as mtd_sales_qty,
    CASE 
        WHEN sim.closing_qty <= 0 THEN 'Out of Stock'
        WHEN sim.closing_qty < 10 THEN 'Low Stock'
        WHEN sim.closing_qty < 50 THEN 'Medium Stock'
        ELSE 'Normal'
    END as stock_alert_level,
    stock_last_movement_date(sim.stock_item_name, sim.company_id) as last_movement_date
FROM stock_items_master sim
JOIN companies c ON sim.company_id = c.company_id
WHERE sim.closing_qty < 50
ORDER BY sim.closing_qty ASC;

-- ============================================================
-- SECTION 12: DASHBOARD KPI FUNCTIONS
-- ============================================================

-- Function: Get Complete Dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_company_id UUID)
RETURNS TABLE (
    -- Cash & Bank
    total_cash DECIMAL(18,4),
    total_bank DECIMAL(18,4),
    total_liquidity DECIMAL(18,4),
    
    -- Receivables & Payables
    total_receivables DECIMAL(18,4),
    total_payables DECIMAL(18,4),
    net_working_capital DECIMAL(18,4),
    
    -- MTD Performance
    mtd_sales DECIMAL(18,4),
    mtd_purchases DECIMAL(18,4),
    mtd_receipts DECIMAL(18,4),
    mtd_payments DECIMAL(18,4),
    mtd_gross_profit DECIMAL(18,4),
    
    -- Activity Counts
    active_items BIGINT,
    active_parties BIGINT,
    mtd_sales_transactions BIGINT,
    mtd_purchase_transactions BIGINT,
    
    -- Alerts
    inactive_customers BIGINT,
    inactive_stocks BIGINT,
    low_stock_items BIGINT,
    overdue_receivables DECIMAL(18,4)
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
        
        -- Total Liquidity
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND (parent_group ILIKE '%cash%' OR parent_group ILIKE '%bank%')), 0) as total_liquidity,
        
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
        
        -- Net Working Capital
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND (parent_group ILIKE '%sundry debtors%' OR parent_group ILIKE '%receivable%')
                  AND closing_balance > 0), 0) -
        COALESCE((SELECT SUM(closing_balance) 
                  FROM ledgers_master 
                  WHERE company_id = p_company_id 
                  AND (parent_group ILIKE '%sundry creditors%' OR parent_group ILIKE '%payable%')
                  AND closing_balance > 0), 0) as net_working_capital,
        
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
        
        -- MTD Receipts
        COALESCE((SELECT SUM(ABS(le.amount)) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Receipt'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) as mtd_receipts,
        
        -- MTD Payments
        COALESCE((SELECT SUM(ABS(le.amount)) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Payment'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) as mtd_payments,
        
        -- MTD Gross Profit
        COALESCE((SELECT SUM(le.amount) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Sales'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) -
        COALESCE((SELECT SUM(ABS(le.amount)) 
                  FROM vouchers v
                  JOIN ledger_entries le ON v.voucher_id = le.voucher_id
                  WHERE v.company_id = p_company_id
                  AND v.voucher_type = 'Purchase'
                  AND v.date >= DATE_TRUNC('month', CURRENT_DATE)
                  AND v.is_deleted = FALSE), 0) as mtd_gross_profit,
        
        -- Active Items
        (SELECT COUNT(*) 
         FROM stock_items_master 
         WHERE company_id = p_company_id) as active_items,
        
        -- Active Parties
        (SELECT COUNT(*) 
         FROM ledgers_master 
         WHERE company_id = p_company_id) as active_parties,
        
        -- MTD Sales Transactions
        (SELECT COUNT(DISTINCT voucher_id) 
         FROM vouchers 
         WHERE company_id = p_company_id 
         AND voucher_type = 'Sales'
         AND date >= DATE_TRUNC('month', CURRENT_DATE)
         AND is_deleted = FALSE) as mtd_sales_transactions,
        
        -- MTD Purchase Transactions
        (SELECT COUNT(DISTINCT voucher_id) 
         FROM vouchers 
         WHERE company_id = p_company_id 
         AND voucher_type = 'Purchase'
         AND date >= DATE_TRUNC('month', CURRENT_DATE)
         AND is_deleted = FALSE) as mtd_purchase_transactions,
        
        -- Inactive Customers
        (SELECT COUNT(*) 
         FROM ledgers_master lm
         WHERE lm.company_id = p_company_id
         AND (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
         AND days_since_last_transaction(lm.ledger_name, lm.company_id) > 90) as inactive_customers,
        
        -- Inactive Stocks
        (SELECT COUNT(*) 
         FROM stock_items_master sim
         WHERE sim.company_id = p_company_id
         AND (stock_last_movement_date(sim.stock_item_name, sim.company_id) < CURRENT_DATE - INTERVAL '90 days'
              OR stock_last_movement_date(sim.stock_item_name, sim.company_id) IS NULL)) as inactive_stocks,
        
        -- Low Stock Items
        (SELECT COUNT(*) 
         FROM stock_items_master 
         WHERE company_id = p_company_id 
         AND closing_qty < 10) as low_stock_items,
        
        -- Overdue Receivables (60+ days)
        COALESCE((SELECT SUM(lm.closing_balance)
                  FROM ledgers_master lm
                  WHERE lm.company_id = p_company_id
                  AND (lm.parent_group ILIKE '%sundry debtors%' OR lm.parent_group ILIKE '%receivable%')
                  AND lm.closing_balance > 0
                  AND days_since_last_transaction(lm.ledger_name, lm.company_id) > 60), 0) as overdue_receivables;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get Monthly Trends
CREATE OR REPLACE FUNCTION get_monthly_trends(p_company_id UUID, p_months INTEGER DEFAULT 12)
RETURNS TABLE (
    month DATE,
    sales_amount DECIMAL(18,4),
    purchase_amount DECIMAL(18,4),
    receipt_amount DECIMAL(18,4),
    payment_amount DECIMAL(18,4),
    gross_profit DECIMAL(18,4),
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH months AS (
        SELECT generate_series(
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * (p_months - 1)),
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
        )::DATE as month_start
    )
    SELECT 
        m.month_start as month,
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Sales' THEN le.amount ELSE 0 END), 0) as sales_amount,
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Purchase' THEN ABS(le.amount) ELSE 0 END), 0) as purchase_amount,
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Receipt' THEN ABS(le.amount) ELSE 0 END), 0) as receipt_amount,
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Payment' THEN ABS(le.amount) ELSE 0 END), 0) as payment_amount,
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Sales' THEN le.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN v.voucher_type = 'Purchase' THEN ABS(le.amount) ELSE 0 END), 0) as gross_profit,
        COUNT(DISTINCT v.voucher_id) as transaction_count
    FROM months m
    LEFT JOIN vouchers v ON DATE_TRUNC('month', v.date) = m.month_start 
        AND v.company_id = p_company_id 
        AND v.is_deleted = FALSE
    LEFT JOIN ledger_entries le ON v.voucher_id = le.voucher_id
    GROUP BY m.month_start
    ORDER BY m.month_start;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- SECTION 13: PERFORMANCE INDEXES
-- ============================================================

-- Dashboard Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_date_type_company ON vouchers(date, voucher_type, company_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vouchers_party_date ON vouchers(party_ledger_name, date, company_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vouchers_company_date_type ON vouchers(company_id, date, voucher_type) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_ledger_entries_ledger_amount ON ledger_entries(ledger_name, amount);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_company_ledger ON ledger_entries(company_id, ledger_name);
CREATE INDEX IF NOT EXISTS idx_inventory_entries_item_date ON inventory_entries(stock_item_name, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_entries_company_item ON inventory_entries(company_id, stock_item_name);
CREATE INDEX IF NOT EXISTS idx_ledgers_group_balance ON ledgers_master(parent_group, closing_balance, company_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_company_group ON ledgers_master(company_id, parent_group);
CREATE INDEX IF NOT EXISTS idx_batch_allocations_godown ON batch_allocations(godown_name) WHERE godown_name IS NOT NULL;

-- ============================================================
-- SECTION 14: USAGE EXAMPLES
-- ============================================================

/*
-- GET DASHBOARD KPIS
SELECT * FROM get_dashboard_kpis('your-company-uuid');

-- GET MONTHLY TRENDS (Last 12 months)
SELECT * FROM get_monthly_trends('your-company-uuid', 12);

-- TAB 1: SUMMARY
-- Cash & Bank Balances
SELECT * FROM vw_cash_bank_balances WHERE company_id = 'your-company-uuid';

-- Recent Cash/Bank Transactions
SELECT * FROM vw_cash_bank_transactions 
WHERE company_id = 'your-company-uuid' 
AND date >= CURRENT_DATE - INTERVAL '7 days';

-- Inventory Summary
SELECT * FROM vw_inventory_summary 
WHERE company_id = 'your-company-uuid' 
AND date >= DATE_TRUNC('month', CURRENT_DATE);

-- Payables Summary
SELECT * FROM vw_payables_summary WHERE company_id = 'your-company-uuid';

-- TAB 2: NEED ATTENTION
-- Inactive Customers
SELECT * FROM vw_inactive_customers WHERE company_id = 'your-company-uuid';

-- Inactive Stocks
SELECT * FROM vw_inactive_stocks WHERE company_id = 'your-company-uuid';

-- TAB 3: SALES & RECEIVABLES
SELECT * FROM vw_sales_summary WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_receivables_summary WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_sales_receivables_drilldown WHERE company_id = 'your-company-uuid';

-- TAB 4: TOP 10
SELECT * FROM vw_top_customers_by_value WHERE company_id = 'your-company-uuid' AND rank <= 10;
SELECT * FROM vw_top_suppliers_by_value WHERE company_id = 'your-company-uuid' AND rank <= 10;
SELECT * FROM vw_top_items_by_quantity WHERE company_id = 'your-company-uuid' AND rank <= 10;
SELECT * FROM vw_top_items_by_value WHERE company_id = 'your-company-uuid' AND rank <= 10;
SELECT * FROM vw_top_items_purchase_qty WHERE company_id = 'your-company-uuid' AND rank <= 10;
SELECT * FROM vw_top_items_purchase_value WHERE company_id = 'your-company-uuid' AND rank <= 10;

-- TAB 5: SALES
SELECT * FROM vw_sales_documents WHERE company_id = 'your-company-uuid' AND voucher_type = 'Sales';
SELECT * FROM vw_receivables_aging WHERE company_id = 'your-company-uuid';

-- TAB 6: PURCHASE
SELECT * FROM vw_purchase_documents WHERE company_id = 'your-company-uuid' AND voucher_type = 'Purchase';
SELECT * FROM vw_payables_aging WHERE company_id = 'your-company-uuid';

-- TAB 7: CASH & BANK
SELECT * FROM vw_cash_position WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_bank_position WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_cash_flow_daily WHERE company_id = 'your-company-uuid';

-- TAB 8: PARTIES
SELECT * FROM vw_party_master WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_party_transactions WHERE company_id = 'your-company-uuid';

-- TAB 9: ITEMS
SELECT * FROM vw_stock_item_master WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_item_movement_history WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_stock_summary_by_category WHERE company_id = 'your-company-uuid';
SELECT * FROM vw_low_stock_alert WHERE company_id = 'your-company-uuid';
*/
