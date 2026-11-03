import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Camera,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { CategoryType, ImportMode, ParsedBrokerRow } from '../types';
import { CATEGORIES, CATEGORY_KEYS, formatCurrency } from '../utils/formatters';

export const BrokerUploadTab: React.FC = () => {
  const { data, importHoldings, setActiveTab } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetProfileId, setTargetProfileId] = useState<string>(
    data.profiles[0]?.id || ''
  );
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedBrokerRow[]>([]);
  const [bulkCategory, setBulkCategory] = useState<CategoryType>('equity');
  const [defaultCategory, setDefaultCategory] = useState<CategoryType>('equity');
  const [importMode, setImportMode] = useState<ImportMode>('update_sync');
  const [createSnapshotBefore, setCreateSnapshotBefore] = useState<boolean>(true);
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [brokerSummaryValue, setBrokerSummaryValue] = useState<number | null>(null);

  /**
   * Intelligently classifies an instrument based on symbol, sector, and instrument type
   */
  const classifyInstrument = (
    rawName: string,
    sector?: string,
    instrumentType?: string
  ): CategoryType => {
    const sym = rawName.toUpperCase().trim();
    const sec = (sector || '').toUpperCase().trim();
    const inst = (instrumentType || '').toUpperCase().trim();

    // 1. Bonds / Debt Securities
    if (
      sec === 'DEBT' ||
      sec === 'BOND' ||
      sec === 'BONDS' ||
      sym.endsWith('-F') ||
      sym.includes('BOND') ||
      sym.includes('NCD') ||
      sym.includes('G-SEC') ||
      sym.includes('GSEC') ||
      sym.includes('SDL')
    ) {
      return 'bonds';
    }

    // 2. Gold & Precious Metals
    if (
      sym.startsWith('SGB') ||
      sym.includes('GOLDIETF') ||
      sym.includes('GOLDBEES') ||
      sym.includes('GOLD') ||
      sym.includes('SILVER')
    ) {
      return 'gold';
    }

    // 3. Mutual Funds
    if (
      inst.includes('EQUITY -') ||
      inst.includes('DEBT -') ||
      inst.includes('HYBRID -') ||
      inst.includes('CAP') ||
      inst.includes('VALUE') ||
      sym.includes('DIRECT PLAN') ||
      sym.includes('REGULAR PLAN') ||
      sym.includes('FUND -') ||
      sym.includes('GROWTH') ||
      sym.includes('MUTUAL')
    ) {
      return 'mutual_funds';
    }

    // 4. Default to Equity (or user default) for stocks and general ETFs
    return defaultCategory;
  };

  /**
   * Map rows from parsed objects to ParsedBrokerRow[]
   */
  const mapRawRowsToHoldings = (rawRows: Record<string, any>[]): ParsedBrokerRow[] => {
    if (!rawRows || rawRows.length === 0) return [];

    const headers = Object.keys(rawRows[0] || {}).map((h) => h.trim());

    const findKey = (candidates: string[]) => {
      return headers.find((h) =>
        candidates.some((c) => h.toLowerCase().trim() === c.toLowerCase().trim())
      ) || headers.find((h) =>
        candidates.some((c) => h.toLowerCase().includes(c.toLowerCase()))
      );
    };

    const nameKey = findKey([
      'symbol',
      'instrument',
      'stock',
      'scheme name',
      'scheme',
      'company',
      'security',
      'description',
      'name',
    ]);

    const isinKey = findKey(['isin']);
    const sectorKey = findKey(['sector']);
    const instrumentTypeKey = findKey(['instrument type', 'type']);

    const qtyKey = findKey([
      'quantity available',
      'quantity',
      'qty.',
      'qty',
      'units',
      'balance units',
      'holding',
      'shares',
    ]);

    const priceKey = findKey([
      'previous closing price',
      'ltp',
      'last price',
      'nav',
      'current price',
      'market price',
      'mkt_price',
      'close',
    ]);

    const avgPriceKey = findKey([
      'average price',
      'avg. cost',
      'avg cost',
      'buy avg',
      'avg price',
      'cost price',
      'purchase price',
    ]);

    const valueKey = findKey([
      'present value',
      'cur. val',
      'current value',
      'market value',
      'value',
      'total value',
      'investment value',
    ]);

    const results: ParsedBrokerRow[] = [];

    rawRows.forEach((row, index) => {
      const rawName = nameKey ? String(row[nameKey] || '').trim() : '';
      if (!rawName || rawName === '-' || rawName.toLowerCase() === 'symbol') return;

      const isin = isinKey ? String(row[isinKey] || '').trim() : undefined;
      const sector = sectorKey ? String(row[sectorKey] || '').trim() : undefined;
      const instrumentType = instrumentTypeKey ? String(row[instrumentTypeKey] || '').trim() : undefined;

      const cleanNum = (val: any) => {
        if (val === undefined || val === null || val === '-' || val === '') return undefined;
        const n = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
        return isNaN(n) ? undefined : n;
      };

      const qty = qtyKey ? cleanNum(row[qtyKey]) : undefined;
      const price = priceKey ? cleanNum(row[priceKey]) : undefined;
      const avg = avgPriceKey ? cleanNum(row[avgPriceKey]) : undefined;

      let totalVal = 0;
      if (valueKey && row[valueKey] !== undefined) {
        totalVal = cleanNum(row[valueKey]) || 0;
      }

      // If value column is not directly present, calculate from Qty * (Price || Avg)
      if ((!totalVal || totalVal === 0) && qty) {
        if (price && price > 0) {
          totalVal = qty * price;
        } else if (avg && avg > 0) {
          totalVal = qty * avg;
        }
      }

      const category = classifyInstrument(rawName, sector, instrumentType);

      results.push({
        id: `row_${index}_${Date.now()}`,
        rawName,
        isin: isin && isin !== '-' ? isin : undefined,
        sector: sector && sector !== '-' ? sector : undefined,
        quantity: qty,
        currentPrice: price,
        avgPrice: avg,
        totalValue: Math.round(totalVal),
        category,
        selected: true,
      });
    });

    return results;
  };

  /**
   * Process raw file text (CSV)
   */
  const processCSVText = (text: string) => {
    const lines = text.split(/\r?\n/);

    // Extract summary present value if present in header metadata
    let summaryVal: number | null = null;
    for (const line of lines) {
      if (line.includes('Present Value')) {
        const match = line.match(/Present Value,\s*([0-9.]+)/i);
        if (match && match[1]) {
          summaryVal = parseFloat(match[1]);
        }
      }
    }
    setBrokerSummaryValue(summaryVal);

    // Check for Multi-Section Statements (e.g. Zerodha Console export)
    // If 'Combined Holdings Statement' is present, prioritize it to prevent double-counting!
    const combinedIndex = lines.findIndex((l) =>
      l.toLowerCase().includes('combined holdings statement')
    );

    let targetHeaderIndex = -1;
    if (combinedIndex !== -1) {
      for (let i = combinedIndex; i < lines.length; i++) {
        const l = lines[i];
        if (
          l.includes('Symbol') &&
          (l.includes('Quantity') || l.includes('ISIN') || l.includes('Sector'))
        ) {
          targetHeaderIndex = i;
          break;
        }
      }
    }

    // If no Combined section, find any holding table header
    if (targetHeaderIndex === -1) {
      targetHeaderIndex = lines.findIndex((l) => {
        const lower = l.toLowerCase();
        return (
          (lower.includes('symbol') || lower.includes('instrument') || lower.includes('scheme')) &&
          (lower.includes('quantity') || lower.includes('qty') || lower.includes('units') || lower.includes('isin'))
        );
      });
    }

    if (targetHeaderIndex === -1) {
      setErrorMessage(
        'Could not detect holding columns. Please ensure your CSV has Symbol, Quantity, or Instrument headers.'
      );
      setIsProcessing(false);
      return;
    }

    // Slice from target header onwards
    const subCsv = lines.slice(targetHeaderIndex).join('\n');
    Papa.parse(subCsv, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        setIsProcessing(false);
        const mapped = mapRawRowsToHoldings(results.data as Record<string, any>[]);
        if (mapped.length === 0) {
          setErrorMessage('No valid holding rows were found under the detected statement header.');
        } else {
          setParsedRows(mapped);
        }
      },
      error: (err: any) => {
        setIsProcessing(false);
        setErrorMessage('Failed to parse CSV: ' + err.message);
      },
    });
  };

  /**
   * Process Excel workbook
   */
  const processExcelBuffer = (buffer: any) => {
    try {
      const workbook = XLSX.read(buffer, { type: 'binary' });

      // Look for a sheet named 'Combined' or pick the first sheet
      let sheetName = workbook.SheetNames.find((s) =>
        s.toLowerCase().includes('combined')
      ) || workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];
      // Convert to 2D array to locate the real header row
      const raw2D = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

      // Search for header row
      let headerRowIndex = -1;
      // First check if combined statement is in this sheet
      const combinedRowIndex = raw2D.findIndex((row) =>
        row.some((cell) => String(cell || '').toLowerCase().includes('combined holdings'))
      );

      const startIndex = combinedRowIndex !== -1 ? combinedRowIndex : 0;
      for (let i = startIndex; i < raw2D.length; i++) {
        const row = raw2D[i] || [];
        const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
        if (
          (rowStr.includes('symbol') || rowStr.includes('instrument') || rowStr.includes('scheme')) &&
          (rowStr.includes('quantity') || rowStr.includes('qty') || rowStr.includes('units') || rowStr.includes('isin'))
        ) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        setIsProcessing(false);
        setErrorMessage('Could not find holding table headers in the Excel file.');
        return;
      }

      // Convert from headerRowIndex down into JSON objects
      const headers = raw2D[headerRowIndex].map((h) => String(h || '').trim());
      const rawRows: Record<string, any>[] = [];

      for (let r = headerRowIndex + 1; r < raw2D.length; r++) {
        const rowData = raw2D[r];
        if (!rowData || rowData.length === 0) continue;
        const obj: Record<string, any> = {};
        headers.forEach((h, colIdx) => {
          if (h) obj[h] = rowData[colIdx];
        });
        rawRows.push(obj);
      }

      setIsProcessing(false);
      const mapped = mapRawRowsToHoldings(rawRows);
      if (mapped.length === 0) {
        setErrorMessage('No valid holding rows found in Excel sheet.');
      } else {
        setParsedRows(mapped);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage('Failed to read Excel workbook: ' + err.message);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setErrorMessage('');
    setIsProcessing(true);
    setImportSuccessCount(null);
    setBrokerSummaryValue(null);

    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isExcel) {
      setErrorMessage('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
      setIsProcessing(false);
      return;
    }

    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processCSVText(text);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Error reading CSV file.');
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        processExcelBuffer(buffer);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Error reading Excel file.');
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Row operations
  const updateRowCategory = (id: string, newCat: CategoryType) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: newCat } : r))
    );
  };

  const toggleRowSelected = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, selected: select })));
  };

  const applyBulkCategory = () => {
    setParsedRows((prev) =>
      prev.map((r) => (r.selected ? { ...r, category: bulkCategory } : r))
    );
  };

  const removeRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Final confirmation
  const handleFinalImport = () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      alert('Please select at least one row to import.');
      return;
    }

    const targetProf = data.profiles.find((p) => p.id === targetProfileId) || data.profiles[0];

    const recordsToImport = selectedRows.map((r) => {
      let notes = `Imported on ${new Date().toLocaleDateString()}`;
      if (r.isin) notes += ` | ISIN: ${r.isin}`;
      if (r.sector) notes += ` | Sector: ${r.sector}`;

      return {
        profileId: targetProf.id,
        category: r.category,
        name: r.rawName,
        units: r.quantity,
        avgPrice: r.avgPrice,
        currentPrice: r.currentPrice,
        currentValue: r.totalValue,
        institutionOrFolio: fileName ? `Broker (${fileName.slice(0, 24)})` : 'Broker Statement',
        notes,
      };
    });

    importHoldings(recordsToImport, {
      mode: importMode,
      profileId: targetProf.id,
      createSnapshotBefore,
      snapshotLabel: snapshotLabel.trim() || undefined,
    });
    setImportSuccessCount(recordsToImport.length);
    setParsedRows([]);
  };

  const selectedCount = parsedRows.filter((r) => r.selected).length;
  const totalSelectedValue = parsedRows
    .filter((r) => r.selected)
    .reduce((sum, r) => sum + r.totalValue, 0);

  const targetProfObj = data.profiles.find((p) => p.id === targetProfileId);

  // Category breakdown of parsed rows
  const parsedCategoryBreakdown = parsedRows.reduce((acc, r) => {
    if (r.selected) {
      acc[r.category] = (acc[r.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Broker Statement Upload & Intelligent Classification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Seamlessly import statements from Zerodha Console, Groww, CAMS CAS, ICICI Direct, and multi-section broker files.
          Automatically detects bonds, SGBs, gold ETFs, mutual funds, and equities with customizable row-by-row categorization.
        </p>
      </div>

      {/* Success Notification */}
      {importSuccessCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold">Import Successful!</div>
              <div className="text-xs text-emerald-400/90">
                Successfully added {importSuccessCount} investment records to profile "{targetProfObj?.name}".
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md hover:bg-emerald-400 transition-colors"
          >
            <span>View Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Step 1: Upload and Configuration Card */}
      {parsedRows.length === 0 && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Profile Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Profile for this Upload *
              </label>
              <select
                value={targetProfileId}
                onChange={(e) => setTargetProfileId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {data.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isDefault ? '(Primary Profile)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                All records parsed from this statement will be associated with this profile.
              </p>
            </div>

            {/* Default Category Pre-selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Category Fallback
              </label>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORIES[k].name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Bonds, Gold, and Mutual Funds will still be auto-detected automatically.
              </p>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Click to browse or drag and drop your broker file here
                </p>
                <p className="text-xs text-slate-400">
                  Supports CSV (`.csv`) or Excel (`.xlsx`, `.xls`)
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zerodha Console, Groww, CAMS CAS, ICICI Direct, Angel One</span>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="text-center py-4 text-xs font-semibold text-cyan-400 animate-pulse">
              Parsing broker statement, please wait...
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Interactive Classification & Review Grid */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          {/* File summary and bulk classifier toolbar */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-slate-100 text-base">
                    Statement: {fileName}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    {parsedRows.length} holdings parsed
                  </span>
                  {brokerSummaryValue && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>
                        Statement Value: {formatCurrency(brokerSummaryValue, data.settings.currency, data.settings.numberFormat)}
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Target Profile:{' '}
                    <span className="text-slate-200 font-semibold">{targetProfObj?.name}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Selected: <span className="text-emerald-400 font-bold">{selectedCount}</span> of {parsedRows.length}
                  </span>
                  <span>•</span>
                  <span>
                    Calculated Total Value:{' '}
                    <span className="text-emerald-400 font-extrabold">
                      {formatCurrency(totalSelectedValue, data.settings.currency, data.settings.numberFormat)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Bulk Categorization Toolbar */}
              <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 pl-1 flex items-center space-x-1">
                  <Filter className="h-3 w-3" />
                  <span className="hidden sm:inline">Set Selected:</span>
                </span>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value as CategoryType)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {CATEGORY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {CATEGORIES[k].name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={applyBulkCategory}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Auto-detected category tags badge list */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-500 font-medium">Auto-classified breakdown:</span>
              {Object.entries(parsedCategoryBreakdown).map(([catKey, count]) => {
                const meta = CATEGORIES[catKey as CategoryType];
                if (!meta) return null;
                return (
                  <span
                    key={catKey}
                    className="px-2 py-0.5 rounded-md flex items-center space-x-1 border font-medium"
                    style={{
                      backgroundColor: `${meta.color}15`,
                      borderColor: `${meta.color}40`,
                      color: meta.color,
                    }}
                  >
                    <span>{meta.name}:</span>
                    <span className="font-bold">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Monthly Update & Snapshot Strategy Selector */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-sm text-slate-100">Monthly Update & Snapshot Strategy</span>
              </div>
              <span className="text-xs text-slate-400">Loading new monthly data</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1 */}
              <div
                onClick={() => setImportMode('update_sync')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'update_sync'
                    ? 'bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'update_sync'}
                    onChange={() => setImportMode('update_sync')}
                    className="text-cyan-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-slate-100">Smart Sync & Update (Recommended)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-5">
                  Updates prices, units, and values of existing stocks/funds; appends newly bought instruments.
                </p>
              </div>

              {/* Option 2 */}
              <div
                onClick={() => setImportMode('replace_profile')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'replace_profile'
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace_profile'}
                    onChange={() => setImportMode('replace_profile')}
                    className="text-amber-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-slate-100">Replace Demat Holdings</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-5">
                  Replaces previous stocks/MFs for this profile with this statement. Non-broker items (EPF, NPS, Loans) stay intact.
                </p>
              </div>

              {/* Option 3 */}
              <div
                onClick={() => setImportMode('append')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'append'
                    ? 'bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-purple-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-slate-100">Append All as New</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-5">
                  Adds all rows alongside existing holdings. (Ideal when adding a 2nd broker like Groww alongside Zerodha).
                </p>
              </div>
            </div>

            {/* Snapshot capture toggle */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={createSnapshotBefore}
                  onChange={(e) => setCreateSnapshotBefore(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Camera className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Capture current portfolio snapshot before applying this update</span>
                </span>
              </label>
              {createSnapshotBefore && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Snapshot Label:</span>
                  <input
                    type="text"
                    placeholder="e.g. Previous Month"
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-36"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Select all/none bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleSelectAll(true)}
                className="hover:text-slate-200 flex items-center space-x-1"
              >
                <CheckSquare className="h-3.5 w-3.5 text-cyan-400" />
                <span>Select All</span>
              </button>
              <button
                onClick={() => toggleSelectAll(false)}
                className="hover:text-slate-200 flex items-center space-x-1"
              >
                <Square className="h-3.5 w-3.5" />
                <span>Deselect All</span>
              </button>
            </div>
            <span>You can customize the section dropdown for any row below:</span>
          </div>

          {/* Review Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Inc.</th>
                    <th className="py-2.5 px-3">Symbol / Instrument</th>
                    <th className="py-2.5 px-3">Sector / Type</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Closing Price</th>
                    <th className="py-2.5 px-3 text-right">Calculated Value</th>
                    <th className="py-2.5 px-3">Target Section</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        !row.selected ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRowSelected(row.id)}
                          className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        <div>{row.rawName}</div>
                        {row.isin && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            ISIN: {row.isin}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {row.sector ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              row.sector === 'DEBT'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : row.sector === 'ETF'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {row.sector}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300 font-medium">
                        {row.quantity !== undefined ? row.quantity : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        {row.currentPrice
                          ? formatCurrency(row.currentPrice, data.settings.currency, data.settings.numberFormat)
                          : row.avgPrice
                          ? formatCurrency(row.avgPrice, data.settings.currency, data.settings.numberFormat)
                          : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {formatCurrency(row.totalValue, data.settings.currency, data.settings.numberFormat)}
                      </td>

                      <td className="py-2.5 px-3">
                        {/* Customizable Classification Dropdown per row */}
                        <select
                          value={row.category}
                          onChange={(e) =>
                            updateRowCategory(row.id, e.target.value as CategoryType)
                          }
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-cyan-300 focus:outline-none focus:border-cyan-500"
                        >
                          {CATEGORY_KEYS.map((k) => (
                            <option key={k} value={k}>
                              {CATEGORIES[k].name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setParsedRows([]);
                setFileName('');
                setBrokerSummaryValue(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel & Upload Another Statement
            </button>

            <button
              onClick={handleFinalImport}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              <span>
                Confirm & Import {selectedCount} Records into "{targetProfObj?.name}"
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
