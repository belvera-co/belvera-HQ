# BELVERA HQ - Franchise Kit

## 1. What You Get
- R&D Lab: All recipes with versions + COGS
- Production OS: Batches with QR traceability + expiry
- Supplier OS: Real cost per kg, reorder alerts
- Orders / Finance: P&L, revenue, profit auto-calculated from DB
- SOP Library: Opening, closing, hygiene checklist

## 2. How To Open Store
1. Clone HQ: docker-compose up -d
2. Login manager@belvera.com / manager123 (change password)
3. Add your location_id (ex: laval_mall)
4. Start production batches - labels print with QR
5. Daily SOP checklist must be 100%

## 3. Costs
- Avg bowl COGS: See Inventory → cost_per_unit
- Label includes batch_number + expiry_date for health inspector
- All logs saved in Postgres, never localStorage

## 4. Support
HQ backend logs everything: products, orders, batches, expenses with timestamps.