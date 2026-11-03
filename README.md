# 💰 Networth Tracker

A simple, modern, and privacy-focused personal net worth tracker desktop application built with **React 19, TypeScript, Tailwind CSS, Recharts, and Electron**.

---

## 🌟 Key Features

### 1. 8 Financial Asset & Liability Categories
* **📈 Equity**: Direct Demat stock holdings (NSE/BSE), shares, and tickers.
* **📊 Mutual Funds**: Active & passive equity, index, hybrid, and debt schemes with Folio tracking.
* **🏛️ Bonds**: Government securities (G-Sec), corporate bonds, FDs, and debt securities with interest rates.
* **🪙 Gold**: Sovereign Gold Bonds (SGB), 24K physical gold/jewellery, and Gold ETFs.
* **🤝 Receivables**: Pending refunds, security deposits, expected payouts, and money lent.
* **💼 EPS / EPF Balance**: Employee Provident Fund and pension corpus.
* **🛡️ NPS Balance**: National Pension System (Tier 1 & Tier 2) retirement wealth.
* **💳 Liabilities**: Home loans, personal loans, car loans, and credit card balances (automatically deducted to calculate true Net Worth).

$$\text{Net Worth} = \sum(\text{Total Assets}) - \sum(\text{Total Liabilities})$$

---

### 2. Multi-Profile & Family Wealth Management
* Create multiple profiles (e.g. **Self**, **Spouse**, **Parents**, **Kids**, **Family Trust / HUF**).
* View either a **Consolidated Portfolio View** or an individual **Profile-Specific View** with a single click in the header.
* Reassign or safely migrate records when managing profiles.

---

### 3. Collapsible Single-Page Holdings Manager
* All 8 categories are accessible on one unified page in **collapsible accordions**.
* Each accordion displays the category badge, item count, and total valuation.
* Add, edit, or delete any record in place.
* **Instant Reactivity**: Every modification immediately updates your dashboard metrics and charts without refreshing.

---

### 4. Broker File Upload & Intelligent Classification
* Upload holdings statements directly from **Zerodha Console**, **Groww**, **CAMS / KFintech CAS**, **ICICI Direct**, or any standard CSV / Excel (`.xlsx`, `.xls`) statement.
* **Tag to Profile**: Select which profile the uploaded holdings belong to.
* **Customizable Classification Grid**: Review all imported rows in an interactive table and customize the category dropdown for each instrument (or bulk-classify) prior to final import.

---

### 5. Smart Wealth Analytics Dashboard
* **Hero Cards**: Net Worth, Total Assets, Total Liabilities, and Debt-to-Asset ratio health indicator (`<30%` Healthy, `30-50%` Moderate, `>50%` High Debt).
* **Asset Allocation Donut Chart**: Visual distribution across asset classes with interactive tooltips and category legends.
* **Liquidity Profile**: Differentiates readily accessible liquid funds from locked-in retirement wealth (EPF/NPS/Bonds).
* **Family Member Share**: Visual breakdown of each profile's share of total family net worth.

---

### 6. Privacy & Polish
* **🛡️ Stealth / Privacy Mode**: One-click toggle in the header that blurs all numbers (`₹ •••••••`) so you can open your dashboard in public or share screenshots safely.
* **🇮🇳 Indian Rupee Notation**: Full support for Lakhs/Crores (`₹ 15,25,000` / `1.52 Cr`) as well as International Millions notation.
* **💾 Local JSON Backup & Restore**: One-click export and import of your entire database.
* **🔒 100% Offline & Private**: Zero cloud servers, zero tracking. All portfolio records are saved exclusively to `%APPDATA%\NetworthTracker\networth_data.json`.

---

## 🚀 Getting Started

### Development Mode
To launch the desktop application in live reload mode:
```bash
npm run electron:dev
```
Or to run purely in your web browser:
```bash
npm run dev
```

### Build Windows Executable (`.exe`)
To package the app into a standalone Windows `.exe`:
```bash
npm run electron:build
```
The executable is saved in the `dist-electron/` folder.

---

## 📁 Sample Broker Statements Included

Ready-to-test broker sample statements are available in the [`sample-data/`](./sample-data/) directory:
* [`sample-data/zerodha_sample_holdings.csv`](./sample-data/zerodha_sample_holdings.csv): Sample Zerodha Console holdings CSV.
* [`sample-data/groww_sample_holdings.csv`](./sample-data/groww_sample_holdings.csv): Sample Groww Mutual Fund holdings CSV.

Test the **Broker Upload** tab by dropping either of these files to see column auto-detection and customizable classification in action!
