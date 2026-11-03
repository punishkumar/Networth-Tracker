# Networth Tracker - Complete Project Context & Continuity Guide

**File:** `context test.md`  
**Generated Date:** November 2, 2026  
**Project Path:** `c:\Users\HP\OneDrive\Punish\AI\Gemini\Networth Tracker`  
**Purpose:** Comprehensive context snapshot to resume development seamlessly in a new agent session without any lost history or architectural ambiguity.

---

## 1. Project Overview & Architecture

### What is Networth Tracker?
A modern, privacy-focused, 100% offline personal wealth desktop application tailored for individual and multi-profile family net worth tracking. It consolidates diverse investments (Equities, Mutual Funds, Bonds, Gold, EPS, NPS, Receivables) against Liabilities (Loans, Credit Cards), providing instantaneous net worth calculations and visual analytics.

### Architecture & Tech Stack
- **Desktop Shell:** Electron 35 (packaged as an unpacked standalone Windows `.exe` at `dist-electron\win-unpacked\Networth Tracker.exe`).
- **Frontend Framework:** React 19 + TypeScript + Vite 6.
- **Styling & UI:** Tailwind CSS 3.4 + Lucide React icons.
- **Charts:** Recharts (Asset Allocation Donut, Net Worth Growth Trajectory Area Chart, Liquidity Breakdown).
- **Data Parsing:** SheetJS (`xlsx`) + `PapaParse` for CSV and multi-section Excel broker statements.
- **Local Persistence:** Dual-mode persistence:
  - **In Electron:** Atomic file-backed JSON store saved at `%APPDATA%\NetworthTracker\networth_data.json` via IPC (`electron/main.cjs` <-> `electron/preload.cjs`).
  - **In Web Browser Dev Mode:** Automatic seamless fallback to browser `localStorage`.
- **Packaging Workflow:** Packaged via `npm run pack-app` (`scripts/pack-app.js`) which bundles `dist/`, `electron/`, and `package.json` directly into `dist-electron\win-unpacked\resources\app.asar`.

---

## 2. Implemented Features & Business Logic

### A. Formula & Categories (8 Sections)
$$\text{Net Worth} = \sum(\text{Total Assets}) - \sum(\text{Total Liabilities})$$

The 8 dedicated categories are:
1. **📈 Equity (`equity`):** Stocks/Shares, Ticker, Quantity, Avg Price, Current Price, Value.
2. **📊 Mutual Funds (`mutual_funds`):** Funds, Folio, Units, NAV, Current Value.
3. **🏛️ Bonds (`bonds`):** Sovereign Gold Bonds (SGBs), Government Securities (GS), Corporate Bonds, Coupon Rate.
4. **🪙 Gold (`gold`):** Physical Gold, SGBs, Gold ETFs (`GOLDBEES`), Digital Gold.
5. **🤝 Receivables (`receivables`):** Due amounts, Expected date, Debtor name.
6. **💼 EPS Balance (`eps`):** Employee Pension Scheme / EPF balance, Member ID, Employer.
7. **🛡️ NPS Balance (`nps`):** National Pension System, PRAN number, Tier 1/2.
8. **💳 Liabilities (`liabilities`):** Home Loans, Car Loans, Personal Loans, Credit Card dues (Subtracted from Net Worth).

### B. Multi-Profile System
- **Profiles:** Users can manage multiple profiles (e.g., *Self*, *Spouse*, *Parents*, *HUF*), each with customizable colors and avatar badges.
- **Scope Selector:** The top navigation bar contains a scope dropdown:
  - **Consolidated View (`ALL`):** Aggregates holdings and net worth across all family profiles.
  - **Individual Profile View:** Filters KPI cards, charts, and holdings for that profile only.
- **Safe Profile Deletion (`DeleteProfileModal.tsx`):**
  - Option 1 (Default): **"Delete profile AND delete all X records"** — Purges the profile and permanently deletes its holdings, immediately reducing the total net worth.
  - Option 2: **"Keep records and reassign to another profile"** — Transfers holdings so consolidated net worth remains unchanged.
  - Automatic fallback: If only 1 profile remains, the view automatically switches to that profile.

### C. Collapsible Holdings Manager (`HoldingsTab.tsx`)
- All 8 categories are rendered on a single page using collapsible accordions.
- Each accordion header displays the category icon, item count badge, subtotal value badge, and a quick `+ Add Record` button.
- Real-time reactivity: Adding, editing, or deleting any record instantly recalculates category subtotals, asset totals, and overall net worth without a page reload.

### D. Broker File Upload & Statement Parsing (`BrokerUploadTab.tsx`)
- **Supported Formats:** `.xlsx`, `.xls`, `.csv`.
- **Tested & Handled Multi-Section Statements (Zerodha Console Holdings Statement):**
  - Zerodha exports 3 tables in one sheet: `Equity Holdings Statement`, `Mutual Funds Holdings Statement`, and `Combined Holdings Statement`.
  - The parser specifically detects and extracts the **`Combined Holdings Statement`** section to capture 100% of holdings (equities + mutual funds + bonds) without double-counting.
  - Automatically handles leading blank commas/columns.
  - Automatically extracts ISIN, Quantity, and Previous Closing Price (Valuation = Quantity * Closing Price).
  - Smart auto-categorization heuristics:
    - Symbols starting with `IN00`, `GS`, `GOI` -> **Bonds**.
    - Symbols matching `GOLDBEES`, `SGB`, `GOLD` -> **Gold**.
    - Mutual fund entries -> **Mutual Funds**.
    - Other equities -> **Equity**.
- **3 Monthly Update Strategies:**
  1. **Smart Sync & Update (Recommended):** Matches existing holdings by instrument name/ISIN. Updates latest market price, units, and valuation. Inserts new instruments. Preserves custom notes and non-broker categories.
  2. **Replace Demat Holdings:** Overwrites existing holdings for that profile within demat categories (Equity, MFs, Gold, Bonds). Non-broker categories (EPF, NPS, Loans, Receivables) are 100% untouched.
  3. **Append All as New:** Inserts all records alongside existing ones (ideal for multi-broker setups).

### E. Monthly Snapshots & Historical Trajectory
- **Milestone Freezing:** Captures net worth, total assets, total liabilities, and category breakdown at any point in time (e.g., Nov 2026, Dec 2026).
- **Auto-Snapshot on Broker Upload:** Checkbox in the upload wizard to freeze the previous month's snapshot before applying new statement data.
- **Net Worth Trajectory Area Chart (`DashboardTab.tsx`):** Visualizes portfolio progression over time with milestone points and growth indicators.
- **Milestone History Manager:** Modal to view, inspect, or delete snapshots.

### F. Privacy & Regional Settings
- **Stealth Privacy Mode:** Toggle in navbar that applies a blur filter (`privacy-blur`) to all financial amounts (useful for screen sharing or public use).
- **Number Formatting:** Toggle between Indian Lakhs/Crores (`₹ 12,34,567`) and International formatting (`₹ 1,234,567`).
- **Currency Support:** INR (`₹`), USD (`$`), EUR (`€`), GBP (`£`), AED (`د.إ`).
- **Data Export & Import:** Full JSON backup and restore in the **Settings** tab.

---

## 3. Workspace Directory Structure

```
Networth Tracker/
├── .gitignore
├── package.json                   # Dependencies, build & packaging scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                 # Vite bundler config
├── tailwind.config.js             # Tailwind CSS theme and styling rules
├── postcss.config.js
├── index.html                     # HTML root template
├── SPEC.md                        # Complete master specification
├── README.md                      # Project setup & quickstart guide
├── Run-NetworthTracker.bat        # One-click launch for standalone Windows desktop app
├── Run-Dev-Browser.bat            # One-click launch for Web Browser live dev (http://localhost:5173)
├── Run-Dev-Electron.bat           # Launches Electron dev mode
├── context test.md                # THIS continuity reference file
│
├── dist/                          # Compiled web build (HTML/CSS/JS)
├── dist-electron/
│   └── win-unpacked/              # Unpacked Windows Standalone Desktop App
│       ├── Networth Tracker.exe   # Standalone executable
│       └── resources/
│           └── app.asar           # Packed application bundle
│
├── electron/
│   ├── main.cjs                   # Electron main process (window lifecycle, IPC file storage)
│   └── preload.cjs                # Secure contextBridge IPC bridge
│
├── scripts/
│   └── pack-app.js                # ASAR packaging script to update app.asar from dist/ & electron/
│
├── sample-data/                   # Test files
│   ├── zerodha_sample_holdings.csv
│   ├── groww_sample_holdings.csv
│   └── zerodha_console_holdings.csv # Real multi-section 72-row holdings test dataset
│
└── src/
    ├── main.tsx                   # React root entry point
    ├── App.tsx                    # Main app container & tab routing
    ├── index.css                  # Tailwind imports & privacy blur CSS rules
    │
    ├── types/
    │   └── index.ts               # Core TypeScript models (HoldingRecord, Profile, Snapshot, etc.)
    │
    ├── utils/
    │   ├── formatters.ts          # Currency, Indian Lakhs/Crores, category metadata
    │   └── storage.ts             # Storage layer (Electron IPC with fallback to localStorage)
    │
    ├── context/
    │   └── AppContext.tsx          # Central reactive state provider (CRUD, computations, filters)
    │
    └── components/
        ├── Navbar.tsx             # Header, scope selector, net worth pill, privacy toggle
        ├── DashboardTab.tsx       # KPI cards, Trajectory Area Chart, Donut Charts, Snapshot modal
        ├── HoldingsTab.tsx        # 8 Collapsible accordions with inline CRUD
        ├── HoldingModal.tsx       # Add / Edit investment record modal
        ├── BrokerUploadTab.tsx    # Upload wizard (multi-section parser, mapping, sync strategies)
        ├── ProfilesTab.tsx        # Profile cards with individual net worth & delete trigger
        ├── ProfileModal.tsx       # Add / Edit profile modal
        ├── DeleteProfileModal.tsx # Safe delete modal (Delete records vs Reassign)
        ├── SnapshotModal.tsx      # Take new snapshot / manage milestone history
        └── SettingsTab.tsx        # Currency, Lakhs/Crores, JSON backup & restore, reset data
```

---

## 4. Key Workflows & Scripts

### How to Run the App
- **Option 1: Windows Desktop App (`.exe`):**
  - Double-click `Run-NetworthTracker.bat` or run:
    `dist-electron\win-unpacked\Networth Tracker.exe`
- **Option 2: Web Browser Dev Server:**
  - Double-click `Run-Dev-Browser.bat` or run:
    `npm run dev`
    (Opens `http://localhost:5173` with instant hot-reloading).

### How to Rebuild & Repackage After Code Changes
When changes are made to the React frontend or Electron scripts:
```powershell
npm run build:app
```
*(This automatically runs `tsc && vite build` followed by `node scripts/pack-app.js`, updating `dist-electron\win-unpacked\resources\app.asar` immediately without touching `electron-builder`.)*

---

## 5. Known Issues & Past Solutions (Reference for the Agent)

1. **Profile Deletion Not Reducing Net Worth:**
   - *Previous bug:* Old confirm prompt reassigned all records to the default profile, keeping net worth unchanged.
   - *Fix:* Built `DeleteProfileModal.tsx` which defaults to permanently deleting all records associated with that profile, properly reducing total net worth and switching the scope.
2. **Zerodha Multi-Section Statement Parsing:**
   - *Issue:* Zerodha Console statement exports Equity, Mutual Funds, and Combined Statements on one sheet.
   - *Fix:* `BrokerUploadTab.tsx` scans for `# Combined Holdings Statement` or `Combined Holdings Statement` to capture both stocks and mutual funds without double counting.
3. **Electron Builder Privilege Limitation on Windows:**
   - *Issue:* `electron-builder` fails to unpack `winCodeSign` when standard symlink privileges are absent.
   - *Fix:* Built as unpacked dir (`"win": { "target": "dir" }`) and updates to the app code are bundled directly into `app.asar` using `@electron/asar`.

---

## 6. Prompt to Start Afresh in a New Session

When starting a new conversation in a fresh session, simply copy and paste the prompt below into the chat:

```markdown
I am resuming work on my "Networth Tracker" personal wealth management desktop app.
The project is located at: `c:\Users\HP\OneDrive\Punish\AI\Gemini\Networth Tracker`.

Please read the file `context test.md` and `SPEC.md` in the project root to load the entire project context, architecture, data schemas, and current implementation status.

Once you have read them, confirm that you have full context of:
1. The 8 financial categories and multi-profile system.
2. The broker upload parser (including Zerodha multi-section statement handling and 3 sync strategies).
3. The collapsible holdings manager, dashboard charts, and snapshot mechanism.
4. The build and packaging setup (`npm run build:app` and `dist-electron\win-unpacked\Networth Tracker.exe`).

Then let me know you're ready so we can continue testing and adding features!
```
