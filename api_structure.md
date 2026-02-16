# Dashboard API Structure

## Base URL
```
/api/v1/dashboard
```

## Authentication
All endpoints require JWT Bearer token with company_id claim.

## Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

---

## 1. SUMMARY TAB

### 1.1 Get Cash & Bank Summary
```http
GET /summary/cash-bank
```
**Response:**
```json
{
  "cash": {
    "total_balance": 150000.00,
    "accounts": [{"name": "Cash Account", "balance": 150000.00}]
  },
  "bank": {
    "total_balance": 500000.00,
    "accounts": [{"name": "HDFC Bank", "balance": 500000.00}]
  }
}
```

### 1.2 Get Recent Transactions
```http
GET /summary/transactions?days=7&account_type=cash
```
**Query Parameters:**
- `days`: Number of days (default: 7)
- `account_type`: cash|bank|all
- `limit`: Results limit (default: 50)

### 1.3 Get Inventory Summary
```http
GET /summary/inventory?from_date=2024-01-01&to_date=2024-12-31
```
**Query Parameters:**
- `from_date`: Start date
- `to_date`: End date
- `stock_item`: Filter by item name
- `party_name`: Filter by party

### 1.4 Get Payables Summary
```http
GET /summary/payables
```

---

## 2. NEED ATTENTION TAB

### 2.1 Get Inactive Customers
```http
GET /attention/inactive-customers?days=90
```
**Query Parameters:**
- `days`: Inactivity threshold (default: 90)
- `limit`: Max results (default: 50)

### 2.2 Get Inactive Stocks
```http
GET /attention/inactive-stocks?days=90
```

---

## 3. SALES & RECEIVABLES TAB

### 3.1 Get Sales Summary
```http
GET /sales-receivables/sales?from_date=2024-01-01&to_date=2024-12-31
```

### 3.2 Get Receivables Summary
```http
GET /sales-receivables/receivables
```

### 3.3 Get Monthly Drill Down
```http
GET /sales-receivables/drilldown?month=2024-01
```

---

## 4. TOP 10 LISTS

### 4.1 Top Customers
```http
GET /top/customers?by=value&limit=10
```
**Query Parameters:**
- `by`: value|quantity (default: value)
- `limit`: Number of results (default: 10)

### 4.2 Top Suppliers
```http
GET /top/suppliers?by=value&limit=10
```

### 4.3 Top Items Sold
```http
GET /top/items/sold?by=value&limit=10
```

### 4.4 Top Items Purchased
```http
GET /top/items/purchased?by=value&limit=10
```

---

## 5. SALES TAB

### 5.1 Get Sales Documents
```http
GET /sales/documents?type=Sales&from_date=2024-01-01
```
**Query Parameters:**
- `type`: Sales|Credit Note|Receipt|Receivables|Sales Order|Delivery Note
- `from_date`: Start date
- `to_date`: End date
- `party_name`: Filter by party

### 5.2 Get Receivables Aging
```http
GET /sales/receivables-aging
```

### 5.3 Get Sales Order Details
```http
GET /sales/orders
```

### 5.4 Get Delivery Notes
```http
GET /sales/delivery-notes
```

---

## 6. PURCHASE TAB

### 6.1 Get Purchase Documents
```http
GET /purchase/documents?type=Purchase&from_date=2024-01-01
```
**Query Parameters:**
- `type`: Purchase|Debit Note|Payment|Payables|Purchase Order|Receipt Note

### 6.2 Get Payables Aging
```http
GET /purchase/payables-aging
```

### 6.3 Get Purchase Orders
```http
GET /purchase/orders
```

### 6.4 Get Receipt Notes
```http
GET /purchase/receipt-notes
```

---

## 7. CASH & BANK TAB

### 7.1 Get Cash Position
```http
GET /cash-bank/cash
```

### 7.2 Get Bank Position
```http
GET /cash-bank/bank
```

### 7.3 Get Cash Flow
```http
GET /cash-bank/flow?from_date=2024-01-01&to_date=2024-12-31&account=All
```

### 7.4 Get Bank Reconciliation
```http
GET /cash-bank/reconciliation?bank_account=HDFC+Bank
```

---

## 8. PARTIES TAB

### 8.1 Get Party List
```http
GET /parties?type=all&page=1&limit=50
```
**Query Parameters:**
- `type`: all|customer|supplier
- `search`: Search by name
- `group`: Filter by parent group

### 8.2 Get Party Detail
```http
GET /parties/:party_name
```

### 8.3 Get Party Transactions
```http
GET /parties/:party_name/transactions?from_date=2024-01-01
```

### 8.4 Get Party Statement
```http
GET /parties/:party_name/statement?from_date=2024-01-01&to_date=2024-12-31
```

---

## 9. ITEMS TAB

### 9.1 Get Item List
```http
GET /items?page=1&limit=50&category=All
```
**Query Parameters:**
- `category`: Filter by category
- `search`: Search by name
- `low_stock`: true|false - Filter low stock items

### 9.2 Get Item Detail
```http
GET /items/:item_name
```

### 9.3 Get Item Movement
```http
GET /items/:item_name/movement?from_date=2024-01-01
```

### 9.4 Get Item Stock Summary
```http
GET /items/summary/by-category
```

### 9.5 Get Stock Valuation
```http
GET /items/valuation?as_of_date=2024-12-31
```

---

## 10. DASHBOARD KPIs

### 10.1 Get All KPIs
```http
GET /kpis
```
**Response:**
```json
{
  "total_cash": 150000.00,
  "total_bank": 500000.00,
  "total_receivables": 750000.00,
  "total_payables": 400000.00,
  "mtd_sales": 1250000.00,
  "mtd_purchases": 875000.00,
  "active_items": 150,
  "active_parties": 75
}
```

### 10.2 Get Quick Stats
```http
GET /kpis/quick
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "The date format should be YYYY-MM-DD"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "COMPANY_NOT_FOUND",
    "message": "Company not found"
  }
}
```

---

## Rate Limiting
- 1000 requests per hour per API key
- 100 requests per minute per IP

## Pagination
All list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 500)

## Filtering
Common filter parameters:
- `from_date` / `to_date`: Date range
- `search`: Text search
- `sort`: Sort field
- `order`: asc|desc
