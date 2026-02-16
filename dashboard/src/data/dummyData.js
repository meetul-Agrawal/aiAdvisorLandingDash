// Dummy Data for Tally ERP Dashboard
export const companyInfo = {
  company_name: "ABC Enterprises Pvt Ltd",
  gstin: "27AABCU9603R1ZX",
  address: "123 Business Park, Mumbai, Maharashtra - 400001",
  financial_year: "2024-25"
};

// KPI Summary Data
export const kpiData = {
  total_cash: 1250000.50,
  total_bank: 8750000.75,
  total_receivables: 4520000.00,
  total_payables: 3200000.00,
  mtd_sales: 8500000.00,
  mtd_purchases: 5200000.00,
  active_items: 1250,
  active_parties: 850
};

// Cash & Bank Balances
export const cashBankBalances = [
  { ledger_name: "Cash Account", parent_group: "Cash-in-Hand", closing_balance: 1250000.50, account_type: "Cash" },
  { ledger_name: "HDFC Bank - 1234", parent_group: "Bank Accounts", closing_balance: 3250000.75, account_type: "Bank" },
  { ledger_name: "ICICI Bank - 5678", parent_group: "Bank Accounts", closing_balance: 2750000.00, account_type: "Bank" },
  { ledger_name: "SBI Bank - 9012", parent_group: "Bank Accounts", closing_balance: 2750000.00, account_type: "Bank" }
];

// Cash & Bank Transactions
export const cashBankTransactions = [
  { date: "2024-01-15", voucher_number: "PAY-001", voucher_type: "Payment", party_name: "ABC Suppliers", account_name: "HDFC Bank - 1234", transaction_direction: "Outflow", absolute_amount: 125000.00, payment_mode: "NEFT", instrument_number: "NEFT123456", narration: "Payment for purchases" },
  { date: "2024-01-14", voucher_number: "RCPT-001", voucher_type: "Receipt", party_name: "XYZ Customers", account_name: "ICICI Bank - 5678", transaction_direction: "Inflow", absolute_amount: 250000.00, payment_mode: "Cheque", instrument_number: "012345", narration: "Receipt from customer" },
  { date: "2024-01-13", voucher_number: "CNTR-001", voucher_type: "Contra", party_name: "Internal Transfer", account_name: "Cash Account", transaction_direction: "Inflow", absolute_amount: 50000.00, payment_mode: "Cash", instrument_number: "-", narration: "Cash withdrawal from bank" },
  { date: "2024-01-12", voucher_number: "PAY-002", voucher_type: "Payment", party_name: "Office Expenses", account_name: "Cash Account", transaction_direction: "Outflow", absolute_amount: 15000.00, payment_mode: "Cash", instrument_number: "-", narration: "Office petty cash expenses" },
  { date: "2024-01-11", voucher_number: "RCPT-002", voucher_type: "Receipt", party_name: "Global Traders", account_name: "SBI Bank - 9012", transaction_direction: "Inflow", absolute_amount: 175000.00, payment_mode: "RTGS", instrument_number: "RTGS789012", narration: "Receipt against invoice INV-2024-045" },
  { date: "2024-01-10", voucher_number: "PAY-003", voucher_type: "Payment", party_name: "Rent Payment", account_name: "HDFC Bank - 1234", transaction_direction: "Outflow", absolute_amount: 85000.00, payment_mode: "NEFT", instrument_number: "NEFT789456", narration: "Monthly rent payment" },
  { date: "2024-01-09", voucher_number: "RCPT-003", voucher_type: "Receipt", party_name: "Sunrise Industries", account_name: "ICICI Bank - 5678", transaction_direction: "Inflow", absolute_amount: 320000.00, payment_mode: "Cheque", instrument_number: "056789", narration: "Sales receipt" },
  { date: "2024-01-08", voucher_number: "PAY-004", voucher_type: "Payment", party_name: "Utility Bills", account_name: "SBI Bank - 9012", transaction_direction: "Outflow", absolute_amount: 22500.00, payment_mode: "Auto-Debit", instrument_number: "AUT0123", narration: "Electricity and internet bills" }
];

// Inventory Summary
export const inventorySummary = [
  { date: "2024-01-15", stock_item_name: "Laptop Dell Inspiron", party_name: "Tech Solutions Ltd", voucher_type: "Sales", billed_qty: 5, rate: 45000.00, amount: 225000.00, discount: 2.5, godown_name: "Main Warehouse" },
  { date: "2024-01-14", stock_item_name: "HP Laser Printer", party_name: "Office Mart", voucher_type: "Sales", billed_qty: 3, rate: 18500.00, amount: 55500.00, discount: 0, godown_name: "Main Warehouse" },
  { date: "2024-01-13", stock_item_name: "A4 Paper Box (10 reams)", party_name: "Paper Products Inc", voucher_type: "Purchase", billed_qty: 50, rate: 1200.00, amount: 60000.00, discount: 5.0, godown_name: "Store Room" },
  { date: "2024-01-12", stock_item_name: "Wireless Mouse Logitech", party_name: "Global Computers", voucher_type: "Sales", billed_qty: 20, rate: 850.00, amount: 17000.00, discount: 10.0, godown_name: "Main Warehouse" },
  { date: "2024-01-11", stock_item_name: "Keyboard Mechanical", party_name: "Gaming World", voucher_type: "Sales", billed_qty: 8, rate: 3200.00, amount: 25600.00, discount: 0, godown_name: "Main Warehouse" },
  { date: "2024-01-10", stock_item_name: "Monitor 24-inch LED", party_name: "Display Solutions", voucher_type: "Purchase", billed_qty: 15, rate: 8500.00, amount: 127500.00, discount: 7.5, godown_name: "Main Warehouse" },
  { date: "2024-01-09", stock_item_name: "UPS 1KVA", party_name: "Power Systems Ltd", voucher_type: "Sales", billed_qty: 4, rate: 12500.00, amount: 50000.00, discount: 0, godown_name: "Store Room" },
  { date: "2024-01-08", stock_item_name: "Webcam HD", party_name: "Video Gear Co", voucher_type: "Purchase", billed_qty: 25, rate: 1500.00, amount: 37500.00, discount: 0, godown_name: "Main Warehouse" }
];

// Payables Summary
export const payablesSummary = [
  { party_name: "ABC Suppliers Ltd", payable_amount: 1250000.00, parent_group: "Sundry Creditors", days_since_last_txn: 15, last_transaction_date: "2023-12-30" },
  { party_name: "XYZ Manufacturing", payable_amount: 850000.00, parent_group: "Sundry Creditors", days_since_last_txn: 22, last_transaction_date: "2023-12-23" },
  { party_name: "Global Traders Inc", payable_amount: 620000.00, parent_group: "Sundry Creditors", days_since_last_txn: 8, last_transaction_date: "2024-01-06" },
  { party_name: "Tech Components Ltd", payable_amount: 480000.00, parent_group: "Sundry Creditors", days_since_last_txn: 30, last_transaction_date: "2023-12-15" },
  { party_name: "Office Supplies Co", payable_amount: 0, parent_group: "Sundry Creditors", days_since_last_txn: 45, last_transaction_date: "2023-11-30" }
];

// Inactive Customers
export const inactiveCustomers = [
  { customer_name: "Old Town Traders", closing_balance: 125000.00, days_since_last_txn: 120, last_transaction_date: "2023-09-15", last_voucher: "Sales - SAL-2023-089", total_sales_value: 2500000.00, total_transactions: 45 },
  { customer_name: "Classic Enterprises", closing_balance: 85000.00, days_since_last_txn: 135, last_transaction_date: "2023-09-01", last_voucher: "Sales - SAL-2023-076", total_sales_value: 1850000.00, total_transactions: 32 },
  { customer_name: "Heritage Solutions", closing_balance: 45000.00, days_since_last_txn: 150, last_transaction_date: "2023-08-15", last_voucher: "Receipt - RCPT-2023-045", total_sales_value: 950000.00, total_transactions: 18 },
  { customer_name: "Vintage Industries", closing_balance: 22000.00, days_since_last_txn: 98, last_transaction_date: "2023-10-08", last_voucher: "Sales - SAL-2023-102", total_sales_value: 750000.00, total_transactions: 15 },
  { customer_name: "Traditional Traders", closing_balance: 18000.00, days_since_last_txn: 110, last_transaction_date: "2023-09-26", last_voucher: "Sales - SAL-2023-095", total_sales_value: 620000.00, total_transactions: 12 }
];

// Inactive Stocks
export const inactiveStocks = [
  { stock_item_name: "Floppy Disk Drive (Legacy)", category: "Obsolete Items", closing_qty: 15, closing_value: 7500.00, days_since_last_movement: 365, last_movement_date: "2023-01-15", total_sold_qty: 5, total_sold_value: 2500.00 },
  { stock_item_name: "CD-RW Media Pack", category: "Storage Media", closing_qty: 200, closing_value: 8000.00, days_since_last_movement: 280, last_movement_date: "2023-04-10", total_sold_qty: 50, total_sold_value: 2000.00 },
  { stock_item_name: "VGA Cable 15m", category: "Cables", closing_qty: 45, closing_value: 6750.00, days_since_last_movement: 195, last_movement_date: "2023-07-03", total_sold_qty: 25, total_sold_value: 3750.00 },
  { stock_item_name: "Serial Mouse PS/2", category: "Input Devices", closing_qty: 30, closing_value: 4500.00, days_since_last_movement: 310, last_movement_date: "2023-03-10", total_sold_qty: 10, total_sold_value: 1500.00 },
  { stock_item_name: "Parallel Printer Cable", category: "Cables", closing_qty: 60, closing_value: 3600.00, days_since_last_movement: 250, last_movement_date: "2023-05-10", total_sold_qty: 20, total_sold_value: 1200.00 }
];

// Sales Summary
export const salesSummary = [
  { voucher_number: "SAL-2024-001", date: "2024-01-15", party_name: "Tech Solutions Ltd", gross_amount: 225000.00, discount_amount: 5625.00, net_amount: 219375.00, item_count: 5, total_quantity: 15, is_invoice: true },
  { voucher_number: "SAL-2024-002", date: "2024-01-14", party_name: "Office Mart", gross_amount: 55500.00, discount_amount: 0, net_amount: 55500.00, item_count: 3, total_quantity: 8, is_invoice: true },
  { voucher_number: "SAL-2024-003", date: "2024-01-12", party_name: "Global Computers", gross_amount: 17000.00, discount_amount: 1700.00, net_amount: 15300.00, item_count: 1, total_quantity: 20, is_invoice: true },
  { voucher_number: "SAL-2024-004", date: "2024-01-11", party_name: "Gaming World", gross_amount: 25600.00, discount_amount: 0, net_amount: 25600.00, item_count: 2, total_quantity: 8, is_invoice: true },
  { voucher_number: "CN-2024-001", date: "2024-01-10", party_name: "Previous Customer", gross_amount: -15000.00, discount_amount: 0, net_amount: -15000.00, item_count: 1, total_quantity: 2, is_invoice: false }
];

// Receivables Summary
export const receivablesSummary = [
  { customer_name: "Tech Solutions Ltd", receivable_amount: 450000.00, days_since_last_txn: 5, aging_bucket: "Current", total_sales_value: 2500000.00, total_receipts: 2050000.00 },
  { customer_name: "Global Computers", receivable_amount: 320000.00, days_since_last_txn: 12, aging_bucket: "1-30 Days Overdue", total_sales_value: 1850000.00, total_receipts: 1530000.00 },
  { customer_name: "Office Mart", receivable_amount: 285000.00, days_since_last_txn: 8, aging_bucket: "Current", total_sales_value: 1200000.00, total_receipts: 915000.00 },
  { customer_name: "Gaming World", receivable_amount: 175000.00, days_since_last_txn: 25, aging_bucket: "1-30 Days Overdue", total_sales_value: 850000.00, total_receipts: 675000.00 },
  { customer_name: "Sunrise Industries", receivable_amount: 125000.00, days_since_last_txn: 45, aging_bucket: "31-60 Days Overdue", total_sales_value: 650000.00, total_receipts: 525000.00 },
  { customer_name: "Classic Traders", receivable_amount: 85000.00, days_since_last_txn: 75, aging_bucket: "60+ Days Overdue", total_sales_value: 450000.00, total_receipts: 365000.00 },
  { customer_name: "Modern Enterprises", receivable_amount: 60000.00, days_since_last_txn: 35, aging_bucket: "31-60 Days Overdue", total_sales_value: 380000.00, total_receipts: 320000.00 },
  { customer_name: "Future Systems", receivable_amount: 32000.00, days_since_last_txn: 95, aging_bucket: "60+ Days Overdue", total_sales_value: 220000.00, total_receipts: 188000.00 }
];

// Top 10 Customers by Value
export const topCustomersByValue = [
  { customer_name: "Tech Solutions Ltd", total_sales_value: 2500000.00, transaction_count: 125, avg_transaction_value: 20000.00, rank: 1 },
  { customer_name: "Global Computers", total_sales_value: 1850000.00, transaction_count: 98, avg_transaction_value: 18877.55, rank: 2 },
  { customer_name: "Office Mart", total_sales_value: 1200000.00, transaction_count: 75, avg_transaction_value: 16000.00, rank: 3 },
  { customer_name: "Gaming World", total_sales_value: 850000.00, transaction_count: 52, avg_transaction_value: 16346.15, rank: 4 },
  { customer_name: "Sunrise Industries", total_sales_value: 650000.00, transaction_count: 40, avg_transaction_value: 16250.00, rank: 5 },
  { customer_name: "Classic Traders", total_sales_value: 450000.00, transaction_count: 32, avg_transaction_value: 14062.50, rank: 6 },
  { customer_name: "Modern Enterprises", total_sales_value: 380000.00, transaction_count: 28, avg_transaction_value: 13571.43, rank: 7 },
  { customer_name: "Future Systems", total_sales_value: 220000.00, transaction_count: 18, avg_transaction_value: 12222.22, rank: 8 },
  { customer_name: "Digital Solutions", total_sales_value: 195000.00, transaction_count: 15, avg_transaction_value: 13000.00, rank: 9 },
  { customer_name: "Smart Technologies", total_sales_value: 165000.00, transaction_count: 12, avg_transaction_value: 13750.00, rank: 10 }
];

// Top 10 Suppliers by Value
export const topSuppliersByValue = [
  { supplier_name: "ABC Suppliers Ltd", total_purchase_value: 3200000.00, transaction_count: 180, avg_transaction_value: 17777.78, rank: 1 },
  { supplier_name: "XYZ Manufacturing", total_purchase_value: 2150000.00, transaction_count: 125, avg_transaction_value: 17200.00, rank: 2 },
  { supplier_name: "Global Traders Inc", total_purchase_value: 1650000.00, transaction_count: 95, avg_transaction_value: 17368.42, rank: 3 },
  { supplier_name: "Tech Components Ltd", total_purchase_value: 1200000.00, transaction_count: 72, avg_transaction_value: 16666.67, rank: 4 },
  { supplier_name: "Display Solutions", total_purchase_value: 950000.00, transaction_count: 58, avg_transaction_value: 16379.31, rank: 5 },
  { supplier_name: "Power Systems Ltd", total_purchase_value: 780000.00, transaction_count: 45, avg_transaction_value: 17333.33, rank: 6 },
  { supplier_name: "Paper Products Inc", total_purchase_value: 650000.00, transaction_count: 38, avg_transaction_value: 17105.26, rank: 7 },
  { supplier_name: "Video Gear Co", total_purchase_value: 520000.00, transaction_count: 32, avg_transaction_value: 16250.00, rank: 8 },
  { supplier_name: "Network Solutions", total_purchase_value: 420000.00, transaction_count: 26, avg_transaction_value: 16153.85, rank: 9 },
  { supplier_name: "Storage Depot", total_purchase_value: 385000.00, transaction_count: 24, avg_transaction_value: 16041.67, rank: 10 }
];

// Top 10 Items Sold by Quantity
export const topItemsByQuantity = [
  { stock_item_name: "A4 Paper Box (10 reams)", total_quantity_sold: 1250, total_sales_value: 1425000.00, avg_selling_rate: 1140.00, rank: 1 },
  { stock_item_name: "Pen Ballpoint Blue", total_quantity_sold: 5000, total_sales_value: 125000.00, avg_selling_rate: 25.00, rank: 2 },
  { stock_item_name: "Notebook A4 200pg", total_quantity_sold: 2100, total_sales_value: 315000.00, avg_selling_rate: 150.00, rank: 3 },
  { stock_item_name: "USB Cable Type-C", total_quantity_sold: 1850, total_sales_value: 92500.00, avg_selling_rate: 50.00, rank: 4 },
  { stock_item_name: "Mouse Pad Standard", total_quantity_sold: 1500, total_sales_value: 75000.00, avg_selling_rate: 50.00, rank: 5 },
  { stock_item_name: "HDMI Cable 2m", total_quantity_sold: 1200, total_sales_value: 96000.00, avg_selling_rate: 80.00, rank: 6 },
  { stock_item_name: "Wireless Mouse Logitech", total_quantity_sold: 980, total_sales_value: 833000.00, avg_selling_rate: 850.00, rank: 7 },
  { stock_item_name: "Keyboard Standard USB", total_quantity_sold: 850, total_sales_value: 510000.00, avg_selling_rate: 600.00, rank: 8 },
  { stock_item_name: "Webcam HD", total_quantity_sold: 720, total_sales_value: 1080000.00, avg_selling_rate: 1500.00, rank: 9 },
  { stock_item_name: "Printer Cartridge HP", total_quantity_sold: 650, total_sales_value: 227500.00, avg_selling_rate: 350.00, rank: 10 }
];

// Top 10 Items Sold by Value
export const topItemsByValue = [
  { stock_item_name: "Laptop Dell Inspiron", total_sales_value: 4500000.00, total_quantity_sold: 100, avg_selling_rate: 45000.00, rank: 1 },
  { stock_item_name: "Monitor 24-inch LED", total_sales_value: 2550000.00, total_quantity_sold: 300, avg_selling_rate: 8500.00, rank: 2 },
  { stock_item_name: "A4 Paper Box (10 reams)", total_sales_value: 1425000.00, total_quantity_sold: 1250, avg_selling_rate: 1140.00, rank: 3 },
  { stock_item_name: "Printer Laser HP", total_sales_value: 1295000.00, total_quantity_sold: 70, avg_selling_rate: 18500.00, rank: 4 },
  { stock_item_name: "Webcam HD", total_sales_value: 1080000.00, total_quantity_sold: 720, avg_selling_rate: 1500.00, rank: 5 },
  { stock_item_name: "UPS 1KVA", total_sales_value: 875000.00, total_quantity_sold: 70, avg_selling_rate: 12500.00, rank: 6 },
  { stock_item_name: "Wireless Mouse Logitech", total_sales_value: 833000.00, total_quantity_sold: 980, avg_selling_rate: 850.00, rank: 7 },
  { stock_item_name: "Keyboard Mechanical", total_sales_value: 800000.00, total_quantity_sold: 250, avg_selling_rate: 3200.00, rank: 8 },
  { stock_item_name: "Keyboard Standard USB", total_sales_value: 510000.00, total_quantity_sold: 850, avg_selling_rate: 600.00, rank: 9 },
  { stock_item_name: "Notebook A4 200pg", total_sales_value: 315000.00, total_quantity_sold: 2100, avg_selling_rate: 150.00, rank: 10 }
];

// Top 10 Items Purchased by Quantity
export const topItemsPurchaseQty = [
  { stock_item_name: "Pen Ballpoint Blue", total_quantity_purchased: 8000, total_purchase_value: 160000.00, avg_purchase_rate: 20.00, rank: 1 },
  { stock_item_name: "A4 Paper Box (10 reams)", total_quantity_purchased: 3000, total_purchase_value: 3600000.00, avg_purchase_rate: 1200.00, rank: 2 },
  { stock_item_name: "Notebook A4 200pg", total_quantity_purchased: 2800, total_purchase_value: 336000.00, avg_purchase_rate: 120.00, rank: 3 },
  { stock_item_name: "USB Cable Type-C", total_quantity_purchased: 2500, total_purchase_value: 100000.00, avg_purchase_rate: 40.00, rank: 4 },
  { stock_item_name: "Mouse Pad Standard", total_quantity_purchased: 2000, total_purchase_value: 80000.00, avg_purchase_rate: 40.00, rank: 5 },
  { stock_item_name: "HDMI Cable 2m", total_quantity_purchased: 1800, total_purchase_value: 108000.00, avg_purchase_rate: 60.00, rank: 6 },
  { stock_item_name: "Printer Cartridge HP", total_quantity_purchased: 1200, total_purchase_value: 360000.00, avg_purchase_rate: 300.00, rank: 7 },
  { stock_item_name: "Keyboard Standard USB", total_quantity_purchased: 1100, total_purchase_value: 440000.00, avg_purchase_rate: 400.00, rank: 8 },
  { stock_item_name: "Wireless Mouse Logitech", total_quantity_purchased: 1250, total_purchase_value: 875000.00, avg_purchase_rate: 700.00, rank: 9 },
  { stock_item_name: "Webcam HD", total_quantity_purchased: 950, total_purchase_value: 1140000.00, avg_purchase_rate: 1200.00, rank: 10 }
];

// Top 10 Items Purchased by Value
export const topItemsPurchaseValue = [
  { stock_item_name: "Laptop Dell Inspiron", total_purchase_value: 8500000.00, total_quantity_purchased: 200, avg_purchase_rate: 42500.00, rank: 1 },
  { stock_item_name: "Monitor 24-inch LED", total_purchase_value: 3825000.00, total_quantity_purchased: 450, avg_purchase_rate: 8500.00, rank: 2 },
  { stock_item_name: "A4 Paper Box (10 reams)", total_purchase_value: 3600000.00, total_quantity_purchased: 3000, avg_purchase_rate: 1200.00, rank: 3 },
  { stock_item_name: "Printer Laser HP", total_purchase_value: 1995000.00, total_quantity_purchased: 110, avg_purchase_rate: 18136.36, rank: 4 },
  { stock_item_name: "Webcam HD", total_purchase_value: 1140000.00, total_quantity_purchased: 950, avg_purchase_rate: 1200.00, rank: 5 },
  { stock_item_name: "UPS 1KVA", total_purchase_value: 1050000.00, total_quantity_purchased: 100, avg_purchase_rate: 10500.00, rank: 6 },
  { stock_item_name: "Wireless Mouse Logitech", total_purchase_value: 875000.00, total_quantity_purchased: 1250, avg_purchase_rate: 700.00, rank: 7 },
  { stock_item_name: "Keyboard Mechanical", total_purchase_value: 700000.00, total_quantity_purchased: 250, avg_purchase_rate: 2800.00, rank: 8 },
  { stock_item_name: "Keyboard Standard USB", total_purchase_value: 440000.00, total_quantity_purchased: 1100, avg_purchase_rate: 400.00, rank: 9 },
  { stock_item_name: "Printer Cartridge HP", total_purchase_value: 360000.00, total_quantity_purchased: 1200, avg_purchase_rate: 300.00, rank: 10 }
];

// Sales Documents
export const salesDocuments = [
  { voucher_type: "Sales", voucher_number: "SAL-2024-001", date: "2024-01-15", party_name: "Tech Solutions Ltd", party_gstin: "27AABCT1234R1Z5", gross_amount: 225000.00, discount_amount: 5625.00, net_amount: 219375.00, total_quantity: 5, cgst_amount: 19743.75, sgst_amount: 19743.75, igst_amount: 0, basic_shipping_date: "2024-01-17", basic_ship_delivery_note: "DN-2024-045" },
  { voucher_type: "Credit Note", voucher_number: "CN-2024-001", date: "2024-01-14", party_name: "Previous Customer", party_gstin: "27AABCP5678R1Z8", gross_amount: -15000.00, discount_amount: 0, net_amount: -15000.00, total_quantity: 2, cgst_amount: -1350.00, sgst_amount: -1350.00, igst_amount: 0, basic_shipping_date: null, basic_ship_delivery_note: null },
  { voucher_type: "Receipt", voucher_number: "RCPT-2024-005", date: "2024-01-13", party_name: "Global Computers", party_gstin: "27AABCG9012R1Z2", gross_amount: 0, discount_amount: 0, net_amount: -250000.00, total_quantity: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, basic_shipping_date: null, basic_ship_delivery_note: null },
  { voucher_type: "Sales Order", voucher_number: "SO-2024-012", date: "2024-01-12", party_name: "Gaming World", party_gstin: "27AABCG7890R1Z9", gross_amount: 125000.00, discount_amount: 6250.00, net_amount: 118750.00, total_quantity: 15, cgst_amount: 10687.50, sgst_amount: 10687.50, igst_amount: 0, basic_shipping_date: "2024-01-20", basic_ship_delivery_note: null },
  { voucher_type: "Delivery Note", voucher_number: "DN-2024-046", date: "2024-01-11", party_name: "Office Mart", party_gstin: "27AABCO3456R1Z1", gross_amount: 0, discount_amount: 0, net_amount: 0, total_quantity: 8, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, basic_shipping_date: "2024-01-11", basic_ship_delivery_note: "DN-2024-046" }
];

// Purchase Documents
export const purchaseDocuments = [
  { voucher_type: "Purchase", voucher_number: "PUR-2024-001", date: "2024-01-15", party_name: "ABC Suppliers Ltd", party_gstin: "27AABCA1234R1Z1", gross_amount: 185000.00, discount_amount: 9250.00, net_amount: 175750.00, total_quantity: 25, cgst_amount: 15817.50, sgst_amount: 15817.50, igst_amount: 0 },
  { voucher_type: "Debit Note", voucher_number: "DN-2024-002", date: "2024-01-13", party_name: "XYZ Manufacturing", party_gstin: "27AABCX5678R1Z3", gross_amount: -8500.00, discount_amount: 0, net_amount: -8500.00, total_quantity: 5, cgst_amount: -765.00, sgst_amount: -765.00, igst_amount: 0 },
  { voucher_type: "Payment", voucher_number: "PAY-2024-008", date: "2024-01-12", party_name: "Global Traders Inc", party_gstin: "27AABCG9012R1Z5", gross_amount: 0, discount_amount: 0, net_amount: -125000.00, total_quantity: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0 },
  { voucher_type: "Purchase Order", voucher_number: "PO-2024-005", date: "2024-01-10", party_name: "Tech Components Ltd", party_gstin: "27AABCT3456R1Z7", gross_amount: 250000.00, discount_amount: 12500.00, net_amount: 237500.00, total_quantity: 50, cgst_amount: 21375.00, sgst_amount: 21375.00, igst_amount: 0 },
  { voucher_type: "Receipt Note", voucher_number: "RN-2024-003", date: "2024-01-08", party_name: "Display Solutions", party_gstin: "27AABCD7890R1Z9", gross_amount: 0, discount_amount: 0, net_amount: 0, total_quantity: 15, cgst_amount: 0, sgst_amount: 0, igst_amount: 0 }
];

// Payables Aging
export const payablesAging = [
  { supplier_name: "ABC Suppliers Ltd", outstanding_amount: 1250000.00, transaction_date: "2024-01-01", voucher_number: "PUR-2023-145", days_outstanding: 14, aging_bucket: "1-30 Days" },
  { supplier_name: "XYZ Manufacturing", outstanding_amount: 850000.00, transaction_date: "2023-12-28", voucher_number: "PUR-2023-142", days_outstanding: 18, aging_bucket: "1-30 Days" },
  { supplier_name: "Tech Components Ltd", outstanding_amount: 480000.00, transaction_date: "2023-12-15", voucher_number: "PUR-2023-138", days_outstanding: 31, aging_bucket: "31-60 Days" },
  { supplier_name: "Classic Suppliers", outstanding_amount: 125000.00, transaction_date: "2023-11-10", voucher_number: "PUR-2023-125", days_outstanding: 66, aging_bucket: "61-90 Days" },
  { supplier_name: "Old Vendor Corp", outstanding_amount: 45000.00, transaction_date: "2023-09-15", voucher_number: "PUR-2023-098", days_outstanding: 122, aging_bucket: "90+ Days" }
];

// Cash Position
export const cashPosition = [
  { cash_account: "Cash Account", opening_balance: 850000.00, closing_balance: 1250000.50, mtd_movement: 400000.50, mtd_inflow: 650000.00, mtd_outflow: 250000.00, days_since_last_txn: 1 },
  { cash_account: "Petty Cash", opening_balance: 25000.00, closing_balance: 18500.00, mtd_movement: -6500.00, mtd_inflow: 15000.00, mtd_outflow: 21500.00, days_since_last_txn: 2 }
];

// Bank Position
export const bankPosition = [
  { bank_account: "HDFC Bank - 1234", account_number: "12345678901234", opening_balance: 2800000.00, closing_balance: 3250000.75, mtd_movement: 450000.75, mtd_inflow: 1250000.00, mtd_outflow: 800000.00, preferred_payment_mode: "NEFT" },
  { bank_account: "ICICI Bank - 5678", account_number: "56789012345678", opening_balance: 2500000.00, closing_balance: 2750000.00, mtd_movement: 250000.00, mtd_inflow: 950000.00, mtd_outflow: 700000.00, preferred_payment_mode: "Cheque" },
  { bank_account: "SBI Bank - 9012", account_number: "90123456789012", opening_balance: 2200000.00, closing_balance: 2750000.00, mtd_movement: 550000.00, mtd_inflow: 1100000.00, mtd_outflow: 550000.00, preferred_payment_mode: "RTGS" }
];

// Daily Cash Flow
export const cashFlowDaily = [
  { date: "2024-01-15", account_name: "HDFC Bank - 1234", account_type: "Bank", inflow: 250000.00, outflow: 125000.00, net_flow: 125000.00, transaction_count: 3 },
  { date: "2024-01-15", account_name: "Cash Account", account_type: "Cash", inflow: 50000.00, outflow: 15000.00, net_flow: 35000.00, transaction_count: 2 },
  { date: "2024-01-14", account_name: "ICICI Bank - 5678", account_type: "Bank", inflow: 175000.00, outflow: 85000.00, net_flow: 90000.00, transaction_count: 2 },
  { date: "2024-01-14", account_name: "Cash Account", account_type: "Cash", inflow: 35000.00, outflow: 12000.00, net_flow: 23000.00, transaction_count: 3 },
  { date: "2024-01-13", account_name: "SBI Bank - 9012", account_type: "Bank", inflow: 320000.00, outflow: 22500.00, net_flow: 297500.00, transaction_count: 2 },
  { date: "2024-01-13", account_name: "Cash Account", account_type: "Cash", inflow: 25000.00, outflow: 8000.00, net_flow: 17000.00, transaction_count: 2 }
];

// Party Master
export const partyMaster = [
  { party_name: "Tech Solutions Ltd", party_type: "Customer", group_name: "Sundry Debtors", opening_balance: 250000.00, closing_balance: 450000.00, balance_status: "Receivable", gstin: "27AABCT1234R1Z5", state_name: "Maharashtra", email: "accounts@techsolutions.com", phone: "+91-22-12345678", total_transactions: 125, total_sales: 2500000.00, total_purchases: 0, total_receipts: 2050000.00, total_payments: 0, last_transaction_date: "2024-01-15" },
  { party_name: "ABC Suppliers Ltd", party_type: "Supplier", group_name: "Sundry Creditors", opening_balance: 850000.00, closing_balance: 1250000.00, balance_status: "Payable", gstin: "27AABCA1234R1Z1", state_name: "Maharashtra", email: "billing@abcsuppliers.com", phone: "+91-22-23456789", total_transactions: 180, total_sales: 0, total_purchases: 3200000.00, total_receipts: 0, total_payments: 1950000.00, last_transaction_date: "2024-01-14" },
  { party_name: "Global Computers", party_type: "Customer", group_name: "Sundry Debtors", opening_balance: 150000.00, closing_balance: 320000.00, balance_status: "Receivable", gstin: "27AABCG9012R1Z2", state_name: "Gujarat", email: "finance@globalcomputers.com", phone: "+91-79-34567890", total_transactions: 98, total_sales: 1850000.00, total_purchases: 0, total_receipts: 1530000.00, total_payments: 0, last_transaction_date: "2024-01-13" },
  { party_name: "XYZ Manufacturing", party_type: "Supplier", group_name: "Sundry Creditors", opening_balance: 600000.00, closing_balance: 850000.00, balance_status: "Payable", gstin: "27AABCX5678R1Z3", state_name: "Karnataka", email: "accounts@xyzmfg.com", phone: "+91-80-45678901", total_transactions: 125, total_sales: 0, total_purchases: 2150000.00, total_payments: 1300000.00, last_transaction_date: "2024-01-12" },
  { party_name: "Office Mart", party_type: "Customer", group_name: "Sundry Debtors", opening_balance: 200000.00, closing_balance: 285000.00, balance_status: "Receivable", gstin: "27AABCO3456R1Z1", state_name: "Maharashtra", email: "payments@officemart.com", phone: "+91-22-56789012", total_transactions: 75, total_sales: 1200000.00, total_purchases: 0, total_receipts: 915000.00, total_payments: 0, last_transaction_date: "2024-01-11" },
  { party_name: "Cash Account", party_type: "Other", group_name: "Cash-in-Hand", opening_balance: 850000.00, closing_balance: 1250000.50, balance_status: "Asset", gstin: null, state_name: "Maharashtra", email: null, phone: null, total_transactions: 450, total_sales: 0, total_purchases: 0, total_receipts: 8500000.00, total_payments: 8100000.00, last_transaction_date: "2024-01-15" },
  { party_name: "HDFC Bank - 1234", party_type: "Other", group_name: "Bank Accounts", opening_balance: 2800000.00, closing_balance: 3250000.75, balance_status: "Asset", gstin: null, state_name: "Maharashtra", email: null, phone: null, total_transactions: 320, total_sales: 0, total_purchases: 0, total_receipts: 12500000.00, total_payments: 11250000.00, last_transaction_date: "2024-01-15" }
];

// Stock Item Master
export const stockItemMaster = [
  { stock_item_name: "Laptop Dell Inspiron", category: "Electronics", base_units: "Nos", opening_qty: 25, opening_value: 1062500.00, closing_qty: 15, closing_value: 637500.00, hsn_code: "847130", gst_tax_rate: 18.00, total_sold_qty: 100, total_sales_value: 4500000.00, total_purchased_qty: 200, total_purchase_value: 8500000.00, stock_status: "Normal", last_movement_date: "2024-01-15" },
  { stock_item_name: "A4 Paper Box (10 reams)", category: "Stationery", base_units: "Box", opening_qty: 500, opening_value: 600000.00, closing_qty: 320, closing_value: 384000.00, hsn_code: "480256", gst_tax_rate: 12.00, total_sold_qty: 1250, total_sales_value: 1425000.00, total_purchased_qty: 3000, total_purchase_value: 3600000.00, stock_status: "Normal", last_movement_date: "2024-01-14" },
  { stock_item_name: "Monitor 24-inch LED", category: "Electronics", base_units: "Nos", opening_qty: 80, opening_value: 680000.00, closing_qty: 45, closing_value: 382500.00, hsn_code: "852852", gst_tax_rate: 18.00, total_sold_qty: 300, total_sales_value: 2550000.00, total_purchased_qty: 450, total_purchase_value: 3825000.00, stock_status: "Low", last_movement_date: "2024-01-13" },
  { stock_item_name: "Printer Laser HP", category: "Electronics", base_units: "Nos", opening_qty: 20, opening_value: 370000.00, closing_qty: 8, closing_value: 148000.00, hsn_code: "844331", gst_tax_rate: 18.00, total_sold_qty: 70, total_sales_value: 1295000.00, total_purchased_qty: 110, total_purchase_value: 1995000.00, stock_status: "Low", last_movement_date: "2024-01-12" },
  { stock_item_name: "Pen Ballpoint Blue", category: "Stationery", base_units: "Dozen", opening_qty: 1000, opening_value: 20000.00, closing_qty: 450, closing_value: 9000.00, hsn_code: "960810", gst_tax_rate: 12.00, total_sold_qty: 5000, total_sales_value: 125000.00, total_purchased_qty: 8000, total_purchase_value: 160000.00, stock_status: "Normal", last_movement_date: "2024-01-11" },
  { stock_item_name: "UPS 1KVA", category: "Electronics", base_units: "Nos", opening_qty: 15, opening_value: 157500.00, closing_qty: 5, closing_value: 52500.00, hsn_code: "850440", gst_tax_rate: 18.00, total_sold_qty: 70, total_sales_value: 875000.00, total_purchased_qty: 100, total_purchase_value: 1050000.00, stock_status: "Low", last_movement_date: "2024-01-10" },
  { stock_item_name: "Webcam HD", category: "Electronics", base_units: "Nos", opening_qty: 200, opening_value: 240000.00, closing_qty: 150, closing_value: 180000.00, hsn_code: "852589", gst_tax_rate: 18.00, total_sold_qty: 720, total_sales_value: 1080000.00, total_purchased_qty: 950, total_purchase_value: 1140000.00, stock_status: "Normal", last_movement_date: "2024-01-09" },
  { stock_item_name: "Wireless Mouse Logitech", category: "Electronics", base_units: "Nos", opening_qty: 300, opening_value: 210000.00, closing_qty: 120, closing_value: 84000.00, hsn_code: "847160", gst_tax_rate: 18.00, total_sold_qty: 980, total_sales_value: 833000.00, total_purchased_qty: 1250, total_purchase_value: 875000.00, stock_status: "Normal", last_movement_date: "2024-01-08" }
];

// Item Movement History
export const itemMovementHistory = [
  { stock_item_name: "Laptop Dell Inspiron", date: "2024-01-15", voucher_type: "Sales", voucher_number: "SAL-2024-001", party_name: "Tech Solutions Ltd", billed_qty: 5, rate: 45000.00, amount: 225000.00, godown_name: "Main Warehouse", batch_name: "LOT-2024-A", applied_gst_rate: 18.00 },
  { stock_item_name: "Monitor 24-inch LED", date: "2024-01-13", voucher_type: "Purchase", voucher_number: "PUR-2024-002", party_name: "Display Solutions", billed_qty: 15, rate: 8500.00, amount: 127500.00, godown_name: "Main Warehouse", batch_name: "DS-2024-001", applied_gst_rate: 18.00 },
  { stock_item_name: "A4 Paper Box (10 reams)", date: "2024-01-14", voucher_type: "Sales", voucher_number: "SAL-2024-002", party_name: "Office Mart", billed_qty: 20, rate: 1140.00, amount: 22800.00, godown_name: "Store Room", batch_name: "PP-2024-A", applied_gst_rate: 12.00 },
  { stock_item_name: "UPS 1KVA", date: "2024-01-12", voucher_type: "Sales", voucher_number: "SAL-2024-003", party_name: "Power Users Ltd", billed_qty: 3, rate: 12500.00, amount: 37500.00, godown_name: "Store Room", batch_name: "PS-2023-Q4", applied_gst_rate: 18.00 },
  { stock_item_name: "Webcam HD", date: "2024-01-11", voucher_type: "Sales", voucher_number: "SAL-2024-004", party_name: "Video Conference Co", billed_qty: 10, rate: 1500.00, amount: 15000.00, godown_name: "Main Warehouse", batch_name: "VG-2024-001", applied_gst_rate: 18.00 },
  { stock_item_name: "Wireless Mouse Logitech", date: "2024-01-10", voucher_type: "Purchase", voucher_number: "PUR-2024-003", party_name: "Tech Components Ltd", billed_qty: 100, rate: 700.00, amount: 70000.00, godown_name: "Main Warehouse", batch_name: "TC-2024-002", applied_gst_rate: 18.00 },
  { stock_item_name: "Keyboard Mechanical", date: "2024-01-09", voucher_type: "Sales", voucher_number: "SAL-2024-005", party_name: "Gaming World", billed_qty: 8, rate: 3200.00, amount: 25600.00, godown_name: "Main Warehouse", batch_name: "GW-2023-DEC", applied_gst_rate: 18.00 },
  { stock_item_name: "Printer Laser HP", date: "2024-01-08", voucher_type: "Sales", voucher_number: "SAL-2024-006", party_name: "Print Solutions", billed_qty: 2, rate: 18500.00, amount: 37000.00, godown_name: "Main Warehouse", batch_name: "HP-2024-Q1", applied_gst_rate: 18.00 }
];

// Stock Summary by Category
export const stockSummaryByCategory = [
  { category: "Electronics", item_count: 45, total_closing_qty: 285, total_closing_value: 1925000.00, total_sold_qty: 2185, total_sold_value: 11155000.00, total_purchased_qty: 2960, total_purchased_value: 18695000.00 },
  { category: "Stationery", item_count: 25, total_closing_qty: 1870, total_closing_value: 452000.00, total_sold_qty: 8750, total_sold_value: 2050000.00, total_purchased_qty: 14050, total_purchased_value: 4160000.00 },
  { category: "Cables", item_count: 15, total_closing_qty: 450, total_closing_value: 45000.00, total_sold_qty: 3200, total_sold_value: 288000.00, total_purchased_qty: 4800, total_purchase_value: 384000.00 },
  { category: "Storage Media", item_count: 8, total_closing_qty: 350, total_closing_value: 28000.00, total_sold_qty: 850, total_sold_value: 68000.00, total_purchased_qty: 1600, total_purchase_value: 112000.00 },
  { category: "Obsolete Items", item_count: 5, total_closing_qty: 45, total_closing_value: 7500.00, total_sold_qty: 5, total_sold_value: 2500.00, total_purchased_qty: 80, total_purchase_value: 12500.00 }
];

// Monthly Trends for Charts
export const monthlyTrends = [
  { month: "Aug 2023", sales_amount: 7200000, purchase_amount: 4800000, receipt_amount: 6500000, payment_amount: 4200000, gross_profit: 2400000, transaction_count: 185 },
  { month: "Sep 2023", sales_amount: 7800000, purchase_amount: 5100000, receipt_amount: 7100000, payment_amount: 4500000, gross_profit: 2700000, transaction_count: 195 },
  { month: "Oct 2023", sales_amount: 8200000, purchase_amount: 5300000, receipt_amount: 7800000, payment_amount: 4800000, gross_profit: 2900000, transaction_count: 210 },
  { month: "Nov 2023", sales_amount: 8500000, purchase_amount: 5500000, receipt_amount: 8200000, payment_amount: 5200000, gross_profit: 3000000, transaction_count: 225 },
  { month: "Dec 2023", sales_amount: 9200000, purchase_amount: 5900000, receipt_amount: 8800000, payment_amount: 5600000, gross_profit: 3300000, transaction_count: 245 },
  { month: "Jan 2024", sales_amount: 8500000, purchase_amount: 5200000, receipt_amount: 8100000, payment_amount: 4900000, gross_profit: 3300000, transaction_count: 220 }
];

// Receivables Aging Summary
export const receivablesAgingSummary = [
  { aging_bucket: "Current", count: 45, amount: 1250000 },
  { aging_bucket: "1-30 Days", count: 32, amount: 850000 },
  { aging_bucket: "31-60 Days", count: 18, amount: 420000 },
  { aging_bucket: "61-90 Days", count: 12, amount: 280000 },
  { aging_bucket: "90+ Days", count: 8, amount: 155000 }
];

// Payables Aging Summary
export const payablesAgingSummary = [
  { aging_bucket: "Current", count: 38, amount: 980000 },
  { aging_bucket: "1-30 Days", count: 28, amount: 750000 },
  { aging_bucket: "31-60 Days", count: 15, amount: 420000 },
  { aging_bucket: "61-90 Days", count: 10, amount: 250000 },
  { aging_bucket: "90+ Days", count: 5, amount: 80000 }
];

// Receivables Aging Detail
export const receivablesAging = [
  { customer_name: "Tech Solutions Ltd", outstanding_amount: 450000.00, transaction_date: "2024-01-10", voucher_number: "SAL-2024-001", days_outstanding: 5, aging_bucket: "Current" },
  { customer_name: "Global Computers", outstanding_amount: 320000.00, transaction_date: "2024-01-03", voucher_number: "SAL-2024-002", days_outstanding: 12, aging_bucket: "1-30 Days" },
  { customer_name: "Office Mart", outstanding_amount: 285000.00, transaction_date: "2024-01-07", voucher_number: "SAL-2024-003", days_outstanding: 8, aging_bucket: "Current" },
  { customer_name: "Gaming World", outstanding_amount: 175000.00, transaction_date: "2023-12-28", voucher_number: "SAL-2023-089", days_outstanding: 18, aging_bucket: "1-30 Days" },
  { customer_name: "Sunrise Industries", outstanding_amount: 125000.00, transaction_date: "2023-12-01", voucher_number: "SAL-2023-076", days_outstanding: 45, aging_bucket: "31-60 Days" },
  { customer_name: "Classic Traders", outstanding_amount: 85000.00, transaction_date: "2023-11-01", voucher_number: "SAL-2023-065", days_outstanding: 75, aging_bucket: "61-90 Days" }
];
