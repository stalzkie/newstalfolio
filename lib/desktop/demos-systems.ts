/* ─────────────────────────────────────────────────────────────────────
   Walkthroughs — the full-stack systems.

   Screens, workflow states, and data models are reconstructed from each
   project's own schema, so the lifecycles and field names are the real
   shape of the system. Every record shown is invented.

   NDA: these are described by industry only. Nothing here names a
   client, a development, or a project — the development-specific
   entities, fields and pricing categories in the real repositories are
   deliberately excluded, as are partner and bank names.
   ───────────────────────────────────────────────────────────────────── */

import type { DemoSpec } from "./demo-types";

/* ─── Real estate sales & property system ──────────────────────────── */

const REAL_ESTATE: DemoSpec = {
  slug: "real-estate-pmss",
  name: "Real Estate Sales & Property System",
  blurb:
    "One system for a developer's whole buyer lifecycle: reservation, contract, amortization, collections, disbursement and commissions. Sample records throughout.",
  screens: [
    {
      id: "dash", label: "Dashboard", group: "Sales", title: "Sales dashboard",
      note: "Where the sales desk starts the day.",
      blocks: [
        { kind: "stats", items: [["248", "active buyer accounts"], ["31", "reservations this month"], ["12", "accounts in arrears"], ["4", "vouchers awaiting release"]] },
        { kind: "chart", title: "Collections against target", bars: [["Jan", 72], ["Feb", 81], ["Mar", 64], ["Apr", 88]] },
        { kind: "list", title: "Needs attention", items: [
          { title: "Buyer 0142 — 2 missed amortizations", meta: "delinquency · second demand letter", note: "Statement of account generated and queued." },
          { title: "Reservation R-0912 expires in 3 days", meta: "document deadline" },
          { title: "PO-0231 exceeds the department budget", meta: "disbursement", note: "Blocked until the finance director approves." },
          { title: "Commission tranche 3 locked", meta: "awaiting signed contract" },
        ] },
      ],
    },
    {
      id: "buyers", label: "Buyers", group: "Sales", title: "Buyer CRM",
      note: "Open a row to walk the full account.",
      blocks: [
        { kind: "filters", items: ["All", "Onboarding", "Active", "In arrears", "Fully paid", "Cancelled"], active: 0 },
        { kind: "table", open: "buyer", cols: ["Buyer", "Lot", "Scheme", "Account status", "KYC", "Outstanding"], rows: [
          ["Buyer 0142", "B-14", "In-house Installment", "[Active]", "[Approved]", "sample"],
          ["Buyer 0187", "C-03", "Bank Financing", "[Active]", "[Approved]", "sample"],
          ["Buyer 0203", "A-21", "Deferred Cash", "[Onboarding]", "[In Progress]", "sample"],
          ["Buyer 0219", "D-08", "Spot Cash", "[Fully Paid]", "[Approved]", "—"],
          ["Buyer 0224", "C-11", "In-house Installment", "[Invited]", "[Pending]", "—"],
        ] },
        { kind: "fields", entity: "Buyer", title: "what the record holds", items: [
          ["status", "enum", "Draft · Invited · Onboarding · Active · Fully Paid · Cancelled"],
          ["kyc_status", "enum", "Pending · In Progress · Approved · Rejected · Forfeited"],
          ["payment_scheme", "enum", "Spot Cash · Deferred Cash · In-house Installment · Bank Financing"],
          ["tcp", "number"],
          ["outstanding_balance", "number"],
          ["downpayment_percent", "number"],
          ["financed_principal", "number"],
          ["interest_rate", "number"],
          ["term_months", "number"],
          ["monthly_amortization", "number"],
          ["amortization_start_date", "date"],
          ["delinquency_stage", "enum", "None · Pre-Due Reminder · First Demand Letter · Second Demand Letter · Cancellation"],
          ["sales_agent_email", "string"],
          ["promo_code", "string"],
        ] },
      ],
    },
    {
      id: "buyer", label: "Buyer", title: "Buyer 0142", sub: true,
      note: "Sample account. Nothing here is a real buyer.",
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Account", items: [["Buyer", "0142"], ["Lot", "B-14"], ["Scheme", "In-house Installment"], ["Term", "120 months"], ["Interest", "sample %"], ["Agent", "Agent 04"]] }],
          right: [{ kind: "kv", title: "Ledger", items: [["Total contract price", "sample"], ["Paid to date", "sample"], ["Outstanding", "sample"], ["Missed", "2 installments"], ["Cumulative penalty", "auto-computed"], ["Stage", "[Second Demand Letter]"]] }] },
        { kind: "lifecycle", title: "Account lifecycle",
          note: "Where this account sits. Documents gate the moves, not dates.",
          states: ["Draft", "Invited", "Onboarding", "Reservation agreement signed", "Computation confirmed", "Contract signed", "Active", "Fully Paid"], at: 6 },
        { kind: "timeline", title: "Audit trail", items: [
          { when: "today 09:14", who: "system", what: "Delinquency evaluated", detail: "days_overdue 47 · stage escalated to Second Demand Letter" },
          { when: "today 09:14", who: "system", what: "Statement of account generated", detail: "soa_snapshot stored against the event" },
          { when: "today 09:15", who: "system", what: "Email sent", detail: "action: email_sent" },
          { when: "12 Mar", who: "Finance 02", what: "Penalty applied", detail: "penalty_months_applied 2 · penalty_locked" },
          { when: "02 Jan", who: "Agent 04", what: "Account transferred to finance" },
        ] },
      ],
    },
    {
      id: "resv", label: "Reservations", group: "Sales", title: "Reservations",
      note: "A reservation holds a lot for a fixed window, and expires if the documents do not land.",
      blocks: [
        { kind: "table", cols: ["Reservation", "Buyer", "Lot", "Fee paid", "Deadline", "Status"], rows: [
          ["R-0912", "Buyer 0203", "A-21", "yes", "in 3 days", "[Pending]"],
          ["R-0914", "Buyer 0224", "C-11", "yes", "in 11 days", "[Confirmed]"],
          ["R-0908", "Buyer 0198", "B-07", "no", "passed", "[Expired]"],
          ["R-0916", "Buyer 0231", "D-02", "yes", "—", "[Awaiting Approval]"],
        ] },
        { kind: "fields", entity: "Reservation", items: [
          ["status", "enum", "Awaiting Approval · Pending · Confirmed · Cancelled · Expired"],
          ["reservation_fee", "number"],
          ["holding_period_days", "number"],
          ["document_deadline", "date"],
          ["expiry_paused", "boolean", "a supervisor can pause the clock, and it is recorded"],
          ["promo_code", "string"],
        ] },
      ],
    },
    {
      id: "amort", label: "Amortization", group: "Finance", title: "Amortization schedule",
      note: "Generated once the computation is confirmed; every row carries its own principal, interest and penalty.",
      blocks: [
        { kind: "table", cols: ["#", "Due", "Amount due", "Principal", "Interest", "Penalty", "Status"], rows: [
          ["34", "01 Feb", "sample", "sample", "sample", "—", "[Paid]"],
          ["35", "01 Mar", "sample", "sample", "sample", "sample", "[Overdue]"],
          ["36", "01 Apr", "sample", "sample", "sample", "sample", "[Overdue]"],
          ["37", "01 May", "sample", "sample", "sample", "—", "[Due]"],
          ["38", "01 Jun", "sample", "sample", "sample", "—", "[Upcoming]"],
        ] },
        { kind: "fields", entity: "AmortizationSchedule", items: [
          ["installment_number", "number"],
          ["amount_due / principal / interest", "number"],
          ["penalty_amount", "number"],
          ["penalty_months_applied", "number"],
          ["penalty_locked", "boolean", "stops recomputation once a payment is matched"],
          ["status", "enum", "Upcoming · Due · Paid · Partial · Overdue · Waived · Forfeited"],
          ["deferral_id", "ref", "a deferral rewrites the dates and is kept as its own record"],
        ] },
      ],
    },
    {
      id: "pay", label: "Payments", group: "Finance", title: "Payments & receipts",
      blocks: [
        { kind: "table", cols: ["AR number", "Buyer", "Type", "Method", "Amount", "Status"], rows: [
          ["AR-10421", "Buyer 0187", "Monthly Amortization", "Bank transfer", "sample", "[Received]"],
          ["AR-10422", "Buyer 0203", "Reservation Fee", "e-wallet", "sample", "[Received]"],
          ["AR-10423", "Buyer 0142", "Penalty", "Cash", "sample", "[Pending]"],
          ["AR-10424", "Buyer 0231", "Downpayment", "Check", "sample", "[Pending]"],
        ] },
        { kind: "fields", entity: "Payment", items: [
          ["payment_type", "enum", "Reservation Fee · Downpayment · Monthly Amortization · Spot Cash · Penalty · Misc Fee"],
          ["status", "enum", "Pending · Received · Rejected"],
          ["principal_portion / interest_portion", "number", "split at posting, not at report time"],
          ["verified_by / verified_at", "audit"],
          ["receipt_url", "file"],
        ] },
        { kind: "note", text: "A payment is posted against a schedule row, which is what keeps the ledger and the schedule from drifting apart." },
      ],
    },
    {
      id: "inventory", label: "Lot inventory", group: "Sales", title: "Interactive lot map",
      note: "In the real system these maps are generated from site-plan PDFs with automated contour detection, then stored as SVG. Click a lot to change its state.",
      blocks: [
        { kind: "grid", title: "Block B — sample layout", cols: 12, legend: ["Available", "Reserved", "Sold", "Hold"],
          cells: [0,0,1,2,0,0,2,2,0,1,0,0, 0,2,2,0,0,1,0,0,2,0,0,1, 1,0,0,0,2,2,0,1,0,0,0,2, 0,0,1,0,0,0,2,0,0,1,0,0] },
        { kind: "fields", entity: "Lot", items: [
          ["lot_number / block_name", "string"],
          ["svg_id", "string", "ties the record to its shape on the generated map"],
          ["area_sqm / price_per_sqm", "number"],
          ["tcp", "number", "computed from the pricing configuration"],
          ["status", "enum", "Available · Assigned · Reserved · Sold · Hold · Forfeited · Non-Sellable"],
        ] },
        { kind: "stats", items: [["48", "lots in this block"], ["4,000+", "mapped in the real system"], ["SVG", "map format"]] },
      ],
    },
    {
      id: "disb", label: "Disbursement", group: "Operations", title: "Purchase orders & canvassing",
      note: "Click a card to move it along. The real status set is longer than most people expect, because receiving and payment are separate concerns.",
      blocks: [
        { kind: "board", cols: ["Pending approval", "Approved, awaiting issuance", "Issued, pending delivery", "Received, pending RR", "Closed, forwarded to AP"], cards: [
          { col: 0, text: "PO-0231 — site materials", meta: "exceeds budget" },
          { col: 0, text: "PO-0233 — office supplies", meta: "MRF-0455" },
          { col: 1, text: "PO-0229 — survey equipment", meta: "3 suppliers canvassed" },
          { col: 2, text: "PO-0225 — fittings", meta: "in transit" },
          { col: 3, text: "PO-0221 — fixtures", meta: "received with discrepancies" },
          { col: 4, text: "PO-0218 — hardware", meta: "CV-0441 attached" },
        ] },
        { kind: "lifecycle", title: "Purchase order states", states: [
          "Pending Approval", "Returned for Revision", "Approved Awaiting Issuance", "Issued Pending Delivery",
          "In Transit", "Delayed", "Received Pending RR", "Received with Discrepancies",
          "Closed Forwarded to AP", "Check Attached", "Acknowledged", "Voided",
        ], at: 3 },
      ],
    },
    {
      id: "vouchers", label: "Check vouchers", group: "Operations", title: "Check vouchers, petty cash & budget requests",
      blocks: [
        { kind: "table", cols: ["Voucher", "Source", "Payee", "Amount", "Status"], rows: [
          ["CV-0441", "Purchase Order", "Supplier 03", "sample", "[Issued]"],
          ["CV-0442", "Budget Request", "Department: works", "sample", "[Issued]"],
          ["CV-0438", "Job Order", "Supplier 01", "sample", "[Voided]"],
        ] },
        { kind: "fields", entity: "CheckVoucher", items: [
          ["source", "enum", "Budget Request · Purchase Order · Job Order · Direct Entry"],
          ["status", "enum", "Issued · Voided"],
          ["vat_amount / liquidated", "number · boolean"],
          ["approved_by / issued_by / received_by", "audit"],
          ["void_reason", "string", "a void never deletes the row"],
        ] },
      ],
    },
    {
      id: "comm", label: "Commissions", group: "Finance", title: "Sales commissions",
      note: "The part sales teams care about: commission unlocks in tranches as the buyer actually pays, not when the sale is written.",
      blocks: [
        { kind: "table", cols: ["Agent", "Buyer", "Rate", "Tranche 1", "Tranche 2", "Tranche 3"], rows: [
          ["Agent 04", "Buyer 0142", "sample %", "[Released]", "[Ready for Release]", "[Locked]"],
          ["Agent 01", "Buyer 0187", "sample %", "[Released]", "[Released]", "[On Hold]"],
          ["Agent 07", "Buyer 0219", "sample %", "[Released]", "[Released]", "[Released]"],
        ] },
        { kind: "fields", entity: "SalesCommission", items: [
          ["tranche_n_status", "enum", "Locked · Ready for Release · On Hold · Released"],
          ["dp_threshold_1 / 2 / 3", "number", "the downpayment collected that unlocks each tranche"],
          ["commission_rate", "number"],
          ["ntcp", "number", "net of discounts, so the base cannot be inflated"],
          ["ntcp_edit_history", "audit", "every change to the base is kept"],
        ] },
        { kind: "note", text: "Tranche 3 stays locked until the contract is signed and the full downpayment is collected — the two things that actually de-risk the sale." },
      ],
    },
    {
      id: "delinq", label: "Delinquency", group: "Finance", title: "Automated delinquency processing",
      blocks: [
        { kind: "lifecycle", title: "Escalation stages", states: ["None", "Pre-Due Reminder", "First Demand Letter", "Second Demand Letter", "Cancellation"], at: 3 },
        { kind: "fields", entity: "DelinquencyEvent", items: [
          ["action", "enum", "email_sent · email_failed · physical_mail_flagged · penalty_applied · status_changed · stage_escalated · cancellation_flagged · contract_cancelled · soa_generated"],
          ["days_overdue", "number"],
          ["unpaid_principal / cumulative_penalty / total_due", "number"],
          ["soa_snapshot", "json", "the statement as it was sent, frozen on the event"],
          ["physical_mail_required", "boolean"],
        ] },
        { kind: "note", text: "Every escalation writes an event with the figures it used. A dispute six months later can be answered with the exact statement that went out." },
      ],
    },
    {
      id: "portal", label: "Client portal", group: "Buyer-facing", title: "Client portal",
      note: "What a buyer sees when they sign in.",
      blocks: [
        { kind: "kv", title: "My account", items: [["Lot", "B-14"], ["Next due", "overdue"], ["Outstanding", "sample"], ["Documents", "3 available"]] },
        { kind: "list", items: [
          { title: "Statement of account", meta: "PDF" },
          { title: "Official receipts", meta: "PDF per payment" },
          { title: "Ownership certificate notice", meta: "email", note: "Sent automatically once the account is fully paid." },
        ] },
      ],
    },
    {
      id: "access", label: "Roles & audit", group: "Admin", title: "Module access and the audit log",
      blocks: [
        { kind: "table", cols: ["Module", "Sales", "Finance", "Management", "Buyer"], rows: [
          ["Buyers & reservations", "[write]", "[read]", "[read]", "—"],
          ["Amortization & payments", "[read]", "[write]", "[read]", "[own]"],
          ["Disbursement", "—", "[write]", "[approve]", "—"],
          ["Commissions", "[own]", "[write]", "[approve]", "—"],
          ["Audit log", "—", "[read]", "[read]", "—"],
        ] },
        { kind: "note", text: "Access is a record (RoleModuleAccess), not a hard-coded check, so a new role is configuration rather than a release." },
      ],
    },
  ],
};

/* ─── Motorcycle dealership ERP ────────────────────────────────────── */

const DEALERSHIP: DemoSpec = {
  slug: "motorcycle-dealership-erp",
  name: "Motorcycle Dealership ERP",
  blurb:
    "Eight role dashboards over one database: in-house financing, unit and parts inventory, payables and payroll. Sample records throughout.",
  screens: [
    {
      id: "roles", label: "Role dashboards", group: "Overview", title: "Eight dashboards, one system",
      note: "Every desk opens on its own view. Pick one.",
      blocks: [
        { kind: "table", open: "agent", cols: ["Role", "Opens on", "Can approve"], rows: [
          ["Owner", "balance sheet, overrides", "[everything]"],
          ["Branch manager", "branch targets, edit requests", "[edit requests]"],
          ["Finance", "applications queue, escalations", "[financing]"],
          ["Credit investigator", "investigation queue", "[CI result]"],
          ["Cashier", "payments, collection targets", "[—]"],
          ["Sales agent", "my applications", "[—]"],
          ["Secretary", "OR/CR documents", "[—]"],
          ["Inventory", "units, parts, small items", "[stock adjustments]"],
        ] },
      ],
    },
    {
      id: "agent", label: "Sales agent", title: "Sales agent dashboard", sub: true,
      blocks: [
        { kind: "stats", items: [["6", "open applications"], ["2", "awaiting CI"], ["1", "ready to release"], ["sample", "commission this period"]] },
        { kind: "list", items: [
          { title: "Applicant A-0098", meta: "To Be Approved by C.I.", note: "Submitted 3 days ago." },
          { title: "Applicant A-0101", meta: "Management Review", note: "Escalated after the CI report." },
          { title: "Applicant A-0104", meta: "Ready for Unit Release", note: "Unit U-2301 reserved." },
        ] },
      ],
    },
    {
      id: "apps", label: "Applications", group: "Financing", title: "Financing applications",
      note: "Click a card to move it along. The real lifecycle has 32 states — the board groups them into the phases a human thinks in.",
      blocks: [
        { kind: "board", cols: ["Application", "Credit investigation", "Approval", "Contract & downpayment", "Release"], cards: [
          { col: 0, text: "Applicant A-0110", meta: "Draft" },
          { col: 0, text: "Applicant A-0112", meta: "Draft" },
          { col: 1, text: "Applicant A-0098", meta: "To Be Approved by C.I." },
          { col: 2, text: "Applicant A-0101", meta: "Management Review" },
          { col: 3, text: "Applicant A-0106", meta: "Downpayment Confirmed" },
          { col: 4, text: "Applicant A-0104", meta: "Release Checklist Complete" },
        ] },
        { kind: "note", text: "Every move appends to the application's own audit trail with the role that acted." },
        { kind: "table", open: "appdetail", cols: ["Reference", "Unit", "Status", "Agent", "Days open"], rows: [
          ["A-0101", "U-2305", "[Management Review]", "Agent 02", "3"],
          ["A-0098", "U-2309", "[To Be Approved by C.I.]", "Agent 05", "3"],
          ["A-0104", "U-2301", "[Release Checklist Complete]", "Agent 02", "11"],
          ["A-0106", "U-2307", "[Downpayment Confirmed]", "Agent 01", "8"],
        ] },
        { kind: "note", text: "Open a row to walk one application." },
      ],
    },
    {
      id: "lifecycle", label: "Lifecycle", group: "Financing", title: "The application lifecycle",
      note: "This is the whole of it. Writing the states down is most of the work — an in-house financing account can be rejected at three different levels, fall into arrears, be repossessed, and be resold.",
      blocks: [
        { kind: "lifecycle", title: "Origination", states: [
          "Draft", "To Be Approved by C.I.", "Management Review", "Final Approval", "Approved",
          "Contract Signing", "Contract Signed", "Downpayment Received", "Downpayment Confirmed",
          "Ready for Unit Release", "Release Checklist Complete", "Unit Released",
        ], at: 10 },
        { kind: "lifecycle", title: "Registration documents", states: [
          "OR/CR Pending from LTO", "OR/CR on Hold", "OR/CR Copy Released", "OR/CR Original Released",
        ] },
        { kind: "lifecycle", title: "Collection and recovery", states: [
          "Due", "Past Due (Days 1-3)", "Late Notice (Week 1)", "Pre-Repossession (Month 1)",
          "For Repossession or Resale", "Repossession in Progress", "Repossessed", "Resold",
        ] },
        { kind: "lifecycle", title: "Closure", states: ["Closure Request Pending", "Fully Paid", "Account Closed"] },
        { kind: "lifecycle", title: "Rejection", note: "Which level rejected it matters, so each is its own state.",
          states: ["Rejected (C.I. level)", "Rejected (Management Review)", "Rejected (Owner level)", "Contract Rejected", "Release on Hold"] },
      ],
    },
    {
      id: "appdetail", label: "Application", title: "Applicant A-0101", sub: true,
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Applicant", items: [["Reference", "A-0101"], ["Status", "[Management Review]"], ["Agent", "Agent 02"], ["Credit score", "sample"], ["Co-maker", "on file"]] }],
          right: [{ kind: "kv", title: "Loan", items: [["Unit", "U-2305"], ["Downpayment", "sample"], ["Term", "sample months"], ["Schedule", "generated on approval"], ["Insurance", "financed"]] }] },
        { kind: "fields", entity: "Application", items: [
          ["customer / spouse / coMaker / references", "object", "the people a decision rests on"],
          ["income / expenses", "object", "capacity, not just willingness"],
          ["ciReport / creditScore", "object · number"],
          ["loanDetails / paymentSchedule", "object"],
          ["documents / payments", "array"],
          ["auditTrail", "array", "who did what, kept on the record itself"],
          ["linked_repossessed_unit_id", "ref", "a resold repossessed unit keeps its history"],
        ] },
        { kind: "timeline", title: "Audit trail", items: [
          { when: "today 11:02", who: "Finance 01", what: "Escalated to Management Review", detail: "CI report attached" },
          { when: "yesterday", who: "CI 03", what: "Credit investigation completed" },
          { when: "3 days ago", who: "Agent 02", what: "Application submitted" },
        ] },
      ],
    },
    {
      id: "units", label: "Units", group: "Inventory", title: "Unit inventory",
      blocks: [
        { kind: "filters", items: ["All", "Available", "Reserved", "Released", "Repossessed"], active: 0 },
        { kind: "table", open: "unit", cols: ["Unit", "Model", "Condition", "Status", "OR/CR"], rows: [
          ["U-2301", "sample model A", "new", "[Reserved]", "pending"],
          ["U-2302", "sample model A", "new", "[Available]", "—"],
          ["U-2305", "sample model B", "new", "[Available]", "—"],
          ["U-2318", "sample model B", "repossessed", "[Released]", "original released"],
          ["U-2320", "sample model C", "second_hand", "[Sold]", "copy released"],
        ] },
        { kind: "fields", entity: "Unit", items: [
          ["chassis_number / engine_number", "string", "the two numbers the registration office cares about"],
          ["product_code / si_number", "string"],
          ["condition", "enum", "new · second_hand · repossessed"],
          ["status", "enum", "Available · Reserved · Released · Fully Paid · Repossessed · Cancelled · Sold"],
          ["cost_price / selling_price / srp", "number"],
          ["unit_cost_with_delivery_fee", "number", "landed cost, so margin is honest"],
          ["tools_status / warranty_status", "enum"],
        ] },
      ],
    },
    {
      id: "unit", label: "Unit", title: "Unit U-2301", sub: true,
      blocks: [
        { kind: "kv", items: [["Unit", "U-2301"], ["Status", "[Reserved]"], ["Buyer", "Applicant A-0104"], ["Chassis", "sample"], ["Engine", "sample"], ["OR/CR", "pending from LTO"]] },
        { kind: "lifecycle", title: "Where the unit has been", states: ["Purchase order", "Delivery received", "Available", "Reserved", "Released", "Fully paid"], at: 3 },
      ],
    },
    {
      id: "parts", label: "Parts & stock", group: "Inventory", title: "Parts, small items & adjustments",
      blocks: [
        { kind: "table", cols: ["SKU", "Part", "On hand", "Reorder level", "Unit"], rows: [
          ["SKU-1042", "sample part A", "18", "10", "piece"],
          ["SKU-1055", "sample part B", "4", "12", "box"],
          ["SKU-1061", "sample part C", "0", "6", "set"],
        ] },
        { kind: "fields", entity: "Part · StockAdjustment", items: [
          ["quantity_on_hand / reorder_level / reorder_quantity", "number"],
          ["wholesale_qty / wholesale_price", "number", "price breaks are data, not a formula in a report"],
          ["unit", "enum", "piece · box · set"],
          ["adjustment_type / reason", "enum · string", "stock never moves without a reason"],
          ["adjusted_by / adjustment_date", "audit"],
        ] },
      ],
    },
    {
      id: "payables", label: "Payables", group: "Finance", title: "Payables, expenses & balance sheet",
      blocks: [
        { kind: "chart", title: "Payables by week", bars: [["W1", 42], ["W2", 68], ["W3", 55], ["W4", 30]] },
        { kind: "table", cols: ["Payable", "Vendor", "Due", "Terms", "Status"], rows: [
          ["AP-0310", "Supplier 02", "12 Apr", "30 days", "[Pending]"],
          ["AP-0311", "Utilities", "15 Apr", "on receipt", "[Pending]"],
          ["AP-0305", "Supplier 01", "01 Apr", "30 days", "[Overdue]"],
          ["AP-0298", "Supplier 04", "—", "30 days", "[Partial]"],
        ] },
        { kind: "fields", entity: "Payable", items: [
          ["status", "enum", "Pending · Paid · Overdue · Partial"],
          ["estimated_invoice_amount vs actual_payment_amount", "number", "the gap is the thing worth reporting"],
          ["payment_discrepancy_reason", "string"],
          ["po_reference / delivery_reference / or_number", "ref"],
        ] },
      ],
    },
    {
      id: "payroll", label: "Payroll", group: "Finance", title: "Payroll, attendance & commissions",
      blocks: [
        { kind: "stats", items: [["2", "runs this month"], ["36", "staff in sample"], ["Draft", "current run state"]] },
        { kind: "table", cols: ["Run", "Period", "Lines", "Total payout", "Status"], rows: [
          ["PR-0042", "01–15 Apr", "36", "sample", "[Finalized]"],
          ["PR-0043", "16–30 Apr", "36", "sample", "[Draft]"],
        ] },
        { kind: "fields", entity: "PayrollRun · Commission", items: [
          ["status", "enum", "Draft · Finalized"],
          ["lines", "array", "a frozen snapshot per employee, so a finalized run never changes"],
          ["finalized_by / finalized_at", "audit"],
          ["commission_rate / sales_amount / commission_amount", "number"],
          ["commission status", "enum", "pending · approved · paid"],
        ] },
      ],
    },
    {
      id: "edits", label: "Edit requests", group: "Admin", title: "Edit requests & approvals",
      note: "The answer to \"a cashier posted the wrong amount\": not a direct edit, a request someone approves.",
      blocks: [
        { kind: "table", cols: ["Request", "Entity", "Action", "Requested by", "Status"], rows: [
          ["ER-0231", "unit", "edit", "Cashier 02", "[pending]"],
          ["ER-0230", "attendance_record", "edit", "Secretary 01", "[approved]"],
          ["ER-0228", "purchase_order", "delete", "Inventory 01", "[rejected]"],
        ] },
        { kind: "fields", entity: "EditRequest", items: [
          ["entity_type", "enum", "unit · part · small_item · purchase_order · delivery · attendance_record"],
          ["action", "enum", "edit · delete"],
          ["changes", "json", "the proposed diff, reviewable before it lands"],
          ["reason", "string"],
          ["status", "enum", "pending · approved · rejected"],
          ["reviewed_by / review_note / reviewed_at", "audit"],
        ] },
      ],
    },
    {
      id: "override", label: "Owner controls", group: "Admin", title: "Owner controls",
      blocks: [
        { kind: "list", items: [
          { title: "Calamity override", meta: "owner only", note: "Relieves payment schedules across a date range for an affected area, and records why." },
          { title: "Bulk import", meta: "admin", note: "Staged into an ImportBatch so a bad file can be rolled back." },
          { title: "Audit trail", meta: "read-only", note: "Role and timestamp on every sensitive change, system-wide." },
        ] },
      ],
    },
  ],
};

/* ─── Business education & mentorship platform ─────────────────────── */

const EDUCATION: DemoSpec = {
  slug: "business-education-platform",
  name: "Business Education & Mentorship Platform",
  blurb:
    "Learning, paid mentorship with escrow, server-scored assessment, verifiable credentials and hiring — across student, mentor, coordinator and employer. Sample records throughout.",
  screens: [
    {
      id: "path", label: "My path", group: "Student", title: "Learning path",
      blocks: [
        { kind: "steps", items: ["Foundation", "Specialization", "Peer review", "Benchmark", "Credential"], active: 1 },
        { kind: "stats", items: [["62%", "path complete"], ["4", "badges"], ["11", "day streak"], ["sample", "XP"]] },
        { kind: "fields", entity: "Module", items: [
          ["path_type", "enum", "foundation · specialization"],
          ["module_type", "enum", "core · major · elective · capstone"],
          ["credit_points / estimated_hours", "number"],
          ["sequence_order", "number"],
          ["learning_objectives", "array"],
        ] },
      ],
    },
    {
      id: "bench", label: "Benchmark", group: "Student", title: "Skills benchmark",
      note: "Scored on the server. A browser cannot be trusted with its own result.",
      blocks: [
        { kind: "chart", title: "Sample result by area", bars: [["Analysis", 78], ["Communication", 64], ["Operations", 83], ["Finance", 55]] },
        { kind: "fields", entity: "AssessmentSession", items: [
          ["status", "enum", "pending · active · submitted · flagged"],
          ["tab_switch_count", "number", "integrity signal, recorded not punished automatically"],
          ["time_remaining_seconds", "number", "server-held, so a refresh does not grant more time"],
          ["started_at / submitted_at", "timestamp"],
        ] },
        { kind: "note", text: "Server-side scoring and a server-held clock were two of the fixes from the security remediation." },
      ],
    },
    {
      id: "mentor", label: "Mentorship", group: "Marketplace", title: "Mentorship marketplace",
      blocks: [
        { kind: "table", open: "engagement", cols: ["Mentor", "Focus", "Rate", "Availability"], rows: [
          ["Mentor 01", "operations", "sample", "[available]"],
          ["Mentor 02", "finance", "sample", "[available]"],
          ["Mentor 03", "go-to-market", "sample", "[booked]"],
        ] },
        { kind: "lifecycle", title: "From application to review", states: [
          "Application", "Plan agreed", "Contract sent for signature", "Escrow funded",
          "Sessions", "Milestone released", "Engagement completed", "Review",
        ], at: 3 },
      ],
    },
    {
      id: "engagement", label: "Engagement", title: "Engagement & escrow", sub: true,
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Engagement", items: [["Mentor", "Mentor 01"], ["Status", "[active]"], ["Sessions", "4 of 8 completed"], ["Renewals", "0"]] }],
          right: [{ kind: "kv", title: "Escrow", items: [["Status", "[funded]"], ["Amount", "sample"], ["Platform fee", "sample %"], ["Net to mentor", "sample"]] }] },
        { kind: "fields", entity: "EscrowTransaction", items: [
          ["status", "enum", "pending_deposit · funded · released · refunded · disputed · partially_released"],
          ["platform_fee / fee_percentage / net_amount", "number"],
          ["funded_at / released_at / refunded_at", "timestamp"],
        ] },
        { kind: "fields", entity: "Dispute", title: "when it goes wrong", items: [
          ["dispute_type", "enum", "quality · non_delivery · scope_change · payment · communication · other"],
          ["desired_resolution", "enum", "full_release · partial_release · full_refund · partial_refund · revision"],
          ["status", "enum", "open · under_review · resolved · escalated"],
          ["resolution_type", "enum", "full_release · partial_release · full_refund · partial_refund · mutual_cancellation"],
          ["evidence_files", "array"],
        ] },
        { kind: "note", text: "Money sitting between two strangers is the hard part of a marketplace. Partial release and mutual cancellation exist because most disputes are not all-or-nothing." },
      ],
    },
    {
      id: "cred", label: "Credentials", group: "Hiring", title: "Verifiable credentials",
      blocks: [
        { kind: "kv", items: [["Certificate number", "DEMO-0000-0000"], ["Tier", "[high_pass]"], ["Status", "[active]"], ["Issued", "sample date"], ["Expires", "sample date"]] },
        { kind: "fields", entity: "Credential", items: [
          ["credential_type / specialization_paths", "string · array"],
          ["exam_tier", "enum", "distinction · high_pass · pass"],
          ["status", "enum", "active · expiring_soon · expired · renewed · suspended"],
          ["xp_at_issuance", "number", "frozen, so later activity cannot rewrite the award"],
          ["is_verified / suspended_reason", "boolean · string"],
        ] },
        { kind: "note", text: "The verification page is public, so an employer can check a credential without an account." },
      ],
    },
    {
      id: "employer", label: "Employer", group: "Hiring", title: "Job board, apprenticeships & match scores",
      blocks: [
        { kind: "table", cols: ["Role", "Applicants", "Top match", "Stage"], rows: [
          ["Sample role A", "18", "84%", "[applied]"],
          ["Sample role B", "7", "71%", "[interviewing]"],
          ["Apprenticeship 01", "22", "90%", "[pending]"],
        ] },
        { kind: "fields", entity: "JobApplication · ApprenticeshipApplication", items: [
          ["job status", "enum", "saved · applied · interviewing · offer · rejected · withdrawn"],
          ["apprenticeship status", "enum", "pending · accepted · declined · withdrawn"],
          ["learning_goals / portfolio_preview", "array · ref"],
          ["follow_up_date", "date"],
        ] },
        { kind: "note", text: "Match scores and the generated apprenticeship reports come from the AI tools; the figures here are placeholders." },
      ],
    },
    {
      id: "sec", label: "Security", group: "Admin", title: "Security remediation",
      note: "The engagement this project is known for.",
      blocks: [
        { kind: "stats", items: [["22", "vulnerabilities remediated"], ["3", "critical"], ["9", "high"], ["35", "codebase issues fixed"]] },
        { kind: "list", items: [
          { title: "Role guards on every route", meta: "access control", note: "Authorization checked server-side, not by hiding a menu item." },
          { title: "IDOR fixes", meta: "object ownership", note: "Every record read checks who is asking for it." },
          { title: "Server-side scoring", meta: "assessment integrity" },
          { title: "Upload validation", meta: "file handling" },
          { title: "Security headers and a central error handler", meta: "hardening", note: "Errors stopped leaking stack traces to the client." },
        ] },
      ],
    },
  ],
};

/* ─── Restaurant operations suite ──────────────────────────────────── */

const RESTAURANT: DemoSpec = {
  slug: "restaurant-operations-suite",
  name: "Restaurant Operations Suite",
  blurb:
    "Floor, kitchen, stockroom, cash office and the public site on one system. Sample records throughout.",
  screens: [
    {
      id: "pos", label: "POS & kitchen", group: "Floor", title: "Order taking and the kitchen display",
      note: "Click a ticket to move it through the kitchen.",
      blocks: [
        { kind: "split",
          left: [
            { kind: "kv", title: "Table 7 — open order", items: [["Section", "sample"], ["Capacity", "4"], ["Status", "[occupied]"], ["Waiter", "Staff 03"]] },
            { kind: "list", items: [
              { title: "Sample dish A ×2", meta: "no notes" },
              { title: "Sample dish B ×1", meta: "allergy note" },
              { title: "Sample drink ×3", meta: "bar" },
            ] },
            { kind: "note", text: "Discounts and voids need a manager PIN, and the reason is stored on a correction entry." },
          ],
          right: [
            { kind: "board", cols: ["Pending", "In kitchen", "Ready to serve", "Served"], cards: [
              { col: 0, text: "Ticket 118 — table 7", meta: "3 items" },
              { col: 1, text: "Ticket 117 — table 2", meta: "2 items" },
              { col: 2, text: "Ticket 115 — takeout", meta: "printed" },
              { col: 3, text: "Ticket 112 — table 9", meta: "ready for billing" },
            ] },
          ] },
        { kind: "lifecycle", title: "Order lifecycle", states: [
          "draft", "pending", "in_kitchen", "preparing", "ready_to_serve", "served", "ready_for_billing", "billed", "completed", "cancelled",
        ], at: 2 },
        { kind: "note", text: "in_kitchen_at, ready_to_serve_at and served_at are stored separately, which is what makes ticket times measurable instead of anecdotal." },
      ],
    },
    {
      id: "tables", label: "Tables", group: "Floor", title: "Floor plan & table state",
      blocks: [
        { kind: "grid", title: "Sample sections", cols: 8, legend: ["available", "occupied", "reserved", "cleaning"],
          cells: [0,1,1,0,2,0,0,1, 1,1,0,0,0,3,1,0, 0,2,1,1,0,0,0,1, 1,0,0,3,1,1,0,0] },
        { kind: "fields", entity: "RestaurantTable", items: [
          ["status", "enum", "available · occupied · reserved · merged · cleaning"],
          ["capacity / seat_count / section", "number · string"],
          ["merged_with / is_merged_parent / original_capacity", "ref · boolean · number", "two tables pushed together for a party of eight, and put back afterwards"],
        ] },
      ],
    },
    {
      id: "sale", label: "Billing", group: "Floor", title: "Billing & receipts",
      blocks: [
        { kind: "kv", title: "Sample sale", items: [["Official receipt", "sample"], ["Subtotal", "sample"], ["Senior citizen discount", "statutory"], ["PWD discount", "statutory"], ["Voucher", "applied"], ["Loyalty points earned", "sample"]] },
        { kind: "fields", entity: "Sale", items: [
          ["payment_method", "enum", "cash · e-wallet · credit_card · debit_card · bank_transfer · split"],
          ["payment_status", "enum", "completed · pending · refunded · voided"],
          ["senior_citizen_discount / pwd_discount", "number", "statutory discounts computed, not typed in"],
          ["loyalty_points_earned / loyalty_reward_applied", "number · ref"],
          ["official_receipt_number", "string"],
        ] },
      ],
    },
    {
      id: "inv", label: "Inventory", group: "Back office", title: "Ingredient-level inventory",
      note: "The difference between stock control and guessing: a recipe knows its serving size, so a sale draws down grams.",
      blocks: [
        { kind: "table", cols: ["Item", "On hand", "Minimum", "Unit", "State"], rows: [
          ["Sample item 01", "4.2", "6", "kg", "[low_stock]"],
          ["Sample item 02", "18", "12", "piece", "[available]"],
          ["Sample item 03", "0.8", "2", "L", "[critical]"],
        ] },
        { kind: "fields", entity: "InventoryItem · Ingredient", items: [
          ["inventory_type", "enum", "raw_goods_for_sale · raw_goods_internal"],
          ["unit_of_measure / pack_size_label / conversion_factor", "string · number", "a 5kg sack and a 100g serving are the same item"],
          ["minimum_stock_type", "enum", "quantity · percentage"],
          ["critical_stock_status", "enum", "available · low_stock · critical"],
          ["retail_unit_type", "enum", "per_kg · per_100g · per_pack · per_piece"],
          ["serving_size_grams / cost_per_serving", "number", "which is where food cost actually comes from"],
        ] },
      ],
    },
    {
      id: "procure", label: "Procurement", group: "Back office", title: "Suppliers, purchase orders & receiving",
      blocks: [
        { kind: "lifecycle", title: "Purchase order", states: ["draft", "sent", "confirmed", "partially_received", "completed", "cancelled"], at: 3 },
        { kind: "fields", entity: "StockReceiving", items: [
          ["status", "enum", "draft · received · verified · posted"],
          ["invoice_number / po_number", "ref"],
          ["batch_number / expiry_date", "string · date", "so a recall is a query, not a hunt"],
          ["quantity_received / unit_cost / total_cost", "number"],
        ] },
      ],
    },
    {
      id: "cash", label: "Cash office", group: "Back office", title: "Cash drawer, daily sales & expenses",
      blocks: [
        { kind: "stats", items: [["3", "shifts today"], ["2", "over/short to review"], ["[open]", "current shift"]] },
        { kind: "fields", entity: "CashDrawerShift", items: [
          ["status", "enum", "open · closed · remitted"],
          ["opening_cash_breakdown / closing_cash_breakdown", "json", "counted by denomination, not a single number"],
          ["expected_cash_total", "number", "computed from sales, not typed"],
          ["over_short_amount", "number", "the figure a manager actually looks at"],
          ["remitted_amount / cash_on_hand_for_next_shift", "number"],
        ] },
        { kind: "chart", title: "Sales by day part", bars: [["Lunch", 64], ["Afternoon", 28], ["Dinner", 88]] },
      ],
    },
    {
      id: "print", label: "Printing", group: "Back office", title: "Kitchen & bar printing",
      note: "Unglamorous and the first thing to break on a busy night, so it is a tracked job queue rather than a fire-and-forget call.",
      blocks: [
        { kind: "table", cols: ["Job", "Printer", "Type", "Trigger", "Status", "Attempts"], rows: [
          ["PJ-4411", "Kitchen", "kitchen_ticket", "auto", "[completed]", "1"],
          ["PJ-4412", "Bar", "bar_ticket", "auto", "[failed]", "3"],
          ["PJ-4413", "Counter", "receipt", "manual_reprint", "[printing]", "1"],
        ] },
        { kind: "fields", entity: "PrintJob", items: [
          ["job_type", "enum", "kitchen_ticket · receipt · bar_ticket"],
          ["status", "enum", "pending · printing · completed · failed"],
          ["triggered_by", "enum", "auto · manual_reprint"],
          ["attempts / error_message", "number · string"],
        ] },
      ],
    },
    {
      id: "crm", label: "Loyalty & CRM", group: "Guests", title: "Loyalty, vouchers & sequences",
      blocks: [
        { kind: "kv", title: "Digital stamp card", items: [["Stamps", "6 of 10"], ["Reward", "[free_item]"], ["Validity", "sample days"], ["Sleeping after", "sample days"]] },
        { kind: "fields", entity: "LoyaltyCard · QRVoucher", items: [
          ["reward_type", "enum", "percentage_discount · fixed_discount · free_item"],
          ["stamps_required / validity_days / sleeping_days", "number", "a sleeping card is what triggers a win-back"],
          ["QR voucher redemption", "ref", "single use, recorded against the sale"],
        ] },
        { kind: "list", items: [
          { title: "Table booking confirmed", meta: "email" },
          { title: "Catering package enquiry", meta: "form" },
          { title: "Win-back sequence", meta: "automated", note: "Fires when a loyalty card goes quiet." },
        ] },
      ],
    },
    {
      id: "site", label: "Website", group: "Guests", title: "Website, menu & assistants",
      blocks: [
        { kind: "note", text: "The public site, its menu and the guest chatbot are edited from the same admin, so the menu cannot be right in one place and wrong in another." },
        { kind: "list", items: [
          { title: "Dine-in menu", meta: "published" },
          { title: "Catering menu", meta: "draft" },
          { title: "Guest chatbot", meta: "answers from the live menu" },
          { title: "AI business analyst", meta: "owner-facing", note: "Summarises the week against the figures in the system." },
        ] },
      ],
    },
  ],
};

/* ─── Hoverscan ────────────────────────────────────────────────────── */

const HOVERSCAN: DemoSpec = {
  slug: "hoverscan",
  name: "Hoverscan",
  blurb:
    "Multi-tenant QR ordering for restaurants and venues: guest menu, live order board, category-routed printing and a platform admin. Sample records throughout.",
  screens: [
    {
      id: "menu", label: "Guest menu", group: "Guest", title: "Scan to order",
      blocks: [
        { kind: "steps", items: ["Scan the table QR", "Browse the menu", "Build an order", "Send to the kitchen"], active: 1 },
        { kind: "list", title: "Sample menu", items: [
          { title: "Sample item A", meta: "grill", note: "Routed to the grill printer by its category." },
          { title: "Sample item B", meta: "bar", note: "Routed to the bar printer." },
          { title: "Sample item C", meta: "kitchen · unavailable", note: "is_available is a toggle staff can hit mid-service." },
        ] },
        { kind: "note", text: "An AI waiter answers menu questions in the guest view." },
      ],
    },
    {
      id: "live", label: "Live orders", group: "Venue", title: "Live order board",
      blocks: [
        { kind: "board", cols: ["Pending", "Confirmed", "In progress", "Ready", "Completed"], cards: [
          { col: 0, text: "Ticket 0441 — table 3", meta: "2 items" },
          { col: 1, text: "Ticket 0442 — table 9", meta: "modification requested" },
          { col: 2, text: "Ticket 0440 — table 1", meta: "4 items" },
          { col: 3, text: "Ticket 0438 — table 6", meta: "printed" },
          { col: 4, text: "Ticket 0437 — bar", meta: "closed" },
        ] },
        { kind: "fields", entity: "OrderTicket", items: [
          ["status", "enum", "pending · confirmed · in_progress · ready · completed · voided"],
          ["modification_requested / modification_note", "boolean · string", "the guest asks, staff decide"],
          ["void_reason", "string"],
          ["printed_at / completed_at", "timestamp"],
          ["is_manual", "boolean", "a phone order typed in by staff lives in the same queue"],
        ] },
      ],
    },
    {
      id: "print", label: "Printers", group: "Venue", title: "Category routing & print jobs",
      note: "Each menu category is routed to a printer, so an item prints where it is made.",
      blocks: [
        { kind: "table", cols: ["Category", "Printer", "Jobs today", "Last status"], rows: [
          ["Grill", "Printer 01", "42", "[success]"],
          ["Bar", "Printer 02", "67", "[failed]"],
          ["Desserts", "Printer 01", "11", "[success]"],
        ] },
        { kind: "fields", entity: "PrinterCategoryRoute · PrintJob", items: [
          ["printer / category", "ref", "the routing table itself"],
          ["status", "enum", "pending · success · failed"],
          ["triggered_by", "enum", "auto · manual_reprint"],
          ["error_message / attempted_at", "string · timestamp"],
        ] },
      ],
    },
    {
      id: "qr", label: "Menu & QR", group: "Venue", title: "Menu editor, categories & QR codes",
      blocks: [
        { kind: "table", cols: ["Table", "QR", "Scans today"], rows: [
          ["Table 1", "[active]", "12"],
          ["Table 3", "[active]", "8"],
          ["Bar", "[active]", "21"],
        ] },
        { kind: "list", items: [
          { title: "Theme editor", meta: "per venue", note: "Each tenant gets its own look without a code change." },
          { title: "Receipt template", meta: "per venue" },
          { title: "POS integration", meta: "optional", note: "Orders sync outward, with the sync state kept per ticket so a failure is visible." },
        ] },
      ],
    },
    {
      id: "admin", label: "Tenants", group: "Platform", title: "Business registry",
      blocks: [
        { kind: "table", cols: ["Venue", "Type", "Tables", "Status"], rows: [
          ["Venue 01", "restaurant", "18", "[active]"],
          ["Venue 02", "cafe", "9", "[pending]"],
          ["Venue 03", "bar", "12", "[suspended]"],
        ] },
        { kind: "fields", entity: "Business", items: [
          ["business_type", "enum", "restaurant · cafe · bar · food_stall · other"],
          ["status", "enum", "active · suspended · pending"],
          ["slug / menu_url", "string", "each tenant's public menu address"],
          ["table_count / order_notification_email", "number · string"],
        ] },
        { kind: "note", text: "Every tenant's data is scoped by business, and the platform admin has its own audit log." },
      ],
    },
  ],
};

/* ─── ChatZilla CRM ────────────────────────────────────────────────── */

const CHATZILLA: DemoSpec = {
  slug: "chatzilla-crm",
  name: "ChatZilla CRM",
  blurb:
    "Lead capture through an AI receptionist, client onboarding, NPS, referrals and the SaaS numbers behind them. Sample records throughout.",
  screens: [
    {
      id: "leads", label: "Leads", group: "Pipeline", title: "Lead pipeline",
      blocks: [
        { kind: "board", cols: ["New", "Contacted", "Qualified", "Proposal", "Won"], cards: [
          { col: 0, text: "Lead 0231", meta: "web form" },
          { col: 0, text: "Lead 0232", meta: "receptionist" },
          { col: 1, text: "Lead 0229", meta: "called back" },
          { col: 2, text: "Lead 0225", meta: "scorecard 72" },
          { col: 3, text: "Lead 0221", meta: "sent" },
          { col: 4, text: "Lead 0218", meta: "closed" },
        ] },
        { kind: "fields", entity: "leads", items: [
          ["company_name / contact_name / contact_email", "text"],
          ["stage / source / vertical", "text", "where it came from matters as much as where it is"],
          ["estimated_value", "numeric"],
          ["last_stage_change", "timestamptz", "which is what makes a stalled deal visible"],
          ["next_follow_up", "date"],
          ["assigned_to", "ref"],
        ] },
      ],
    },
    {
      id: "quiz", label: "Scorecard", group: "Capture", title: "Lead-response scorecard",
      note: "A short quiz that scores how fast a business answers its own leads — the hook that starts the conversation.",
      blocks: [
        { kind: "form", title: "Sample answers", fields: [
          ["How fast do you reply?", "within an hour"],
          ["Who answers after hours?", "nobody"],
          ["Do you track every enquiry?", "sometimes"],
        ] },
        { kind: "chart", title: "Sample score", bars: [["Speed", 55], ["Coverage", 30], ["Tracking", 60]] },
      ],
    },
    {
      id: "recept", label: "AI receptionist", group: "Capture", title: "Voice receptionist",
      blocks: [
        { kind: "list", title: "Sample transcript", items: [
          { title: "Caller", meta: "0:02", note: "Hi, do you have availability this week?" },
          { title: "Receptionist", meta: "0:04", note: "We do. Can I take your name and number?" },
          { title: "Caller", meta: "0:09", note: "Sure, it's a sample caller." },
        ] },
        { kind: "note", text: "Scripted in this walkthrough. Nothing here places a call or reaches a model." },
      ],
    },
    {
      id: "onboard", label: "Onboarding", group: "Accounts", title: "Client onboarding",
      note: "A checklist with a health status, so a stalling rollout is visible before it becomes a churn risk.",
      blocks: [
        { kind: "table", cols: ["Day", "Phase", "Task", "Done"], rows: [
          ["1", "setup", "Account created", "yes"],
          ["2", "setup", "Call forwarding configured", "yes"],
          ["5", "configure", "Persona tuned", "no"],
          ["9", "launch", "Live traffic switched on", "no"],
          ["14", "review", "Sign-off", "no"],
        ] },
        { kind: "fields", entity: "clients · onboarding_checklists", items: [
          ["tier / vertical", "text"],
          ["deployment_date", "date"],
          ["ai_persona_name / call_forwarding_number", "text"],
          ["integration_status", "text"],
          ["health_status", "text", "the single field an account manager scans for"],
          ["signed_off_by / signed_off_at", "audit"],
        ] },
      ],
    },
    {
      id: "nps", label: "NPS & churn", group: "Accounts", title: "NPS, churn risk & referrals",
      blocks: [
        { kind: "table", open: "client", cols: ["Client", "NPS", "Churn risk", "Referrals", "Follow-up"], rows: [
          ["Client 01", "9", "[low]", "2", "—"],
          ["Client 02", "7", "[medium]", "0", "required"],
          ["Client 03", "4", "[high]", "0", "required"],
        ] },
        { kind: "fields", entity: "nps_scores · referrals", items: [
          ["score / recorded_month / feedback", "integer · date · text"],
          ["churn_risk", "text"],
          ["follow_up_required / follow_up_completed", "boolean", "a low score with no follow-up is the actual failure"],
          ["commission_percentage / commission_amount / commission_paid_at", "numeric · timestamptz"],
          ["pipeline_stage", "text", "a referral is a lead with a payout attached"],
        ] },
      ],
    },
    {
      id: "client", label: "Client", title: "Client 03", sub: true,
      blocks: [
        { kind: "kv", items: [["Client", "03"], ["Tier", "sample"], ["Deployed", "sample date"], ["NPS", "4"], ["Churn risk", "[high]"], ["Owner", "Team member A"]] },
        { kind: "timeline", title: "Recent activity", items: [
          { when: "today", who: "system", what: "NPS recorded", detail: "score 4 · follow_up_required set" },
          { when: "last week", who: "Team member A", what: "Check-in call logged" },
          { when: "last month", who: "system", what: "Onboarding signed off" },
        ] },
      ],
    },
    {
      id: "fin", label: "Financials", group: "Business", title: "SaaS financials",
      note: "The numbers an owner runs the business on, kept in the same system as the accounts they come from.",
      blocks: [
        { kind: "chart", title: "Sample MRR movement", bars: [["New", 48], ["Expansion", 22], ["Contraction", 12], ["Churned", 18]] },
        { kind: "fields", entity: "monthly_financials · cac_by_channel", items: [
          ["mrr / arr", "numeric"],
          ["new_mrr / expansion_mrr / contraction_mrr / churned_mrr", "numeric", "the four movements, not one net figure"],
          ["churn_rate / nrr", "numeric"],
          ["active_clients / new_clients / churned_clients", "integer"],
          ["channel / ad_spend / clients_acquired / cac", "text · numeric", "acquisition cost per channel, computed"],
        ] },
        { kind: "note", text: "Revenue scenarios sit alongside the actuals, so a projection can be compared with what happened." },
      ],
    },
  ],
};

export const SYSTEM_DEMOS: DemoSpec[] = [
  REAL_ESTATE,
  DEALERSHIP,
  EDUCATION,
  RESTAURANT,
  HOVERSCAN,
  CHATZILLA,
];
