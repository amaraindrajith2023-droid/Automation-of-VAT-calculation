import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function App() {
  const [vatRules, setVatRules] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [transactionType, setTransactionType] = useState("Debit");
  const [vatApplicable, setVatApplicable] = useState("Yes");

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [vatFilter, setVatFilter] = useState("All");
  const [transactionsConfirmed, setTransactionsConfirmed] = useState(false);
  const [vatPeriod, setVatPeriod] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [vatHistory, setVatHistory] = useState([]);
  const [historicalTransactions, setHistoricalTransactions] = useState([]);
  const [historySearchText, setHistorySearchText] = useState("");
  const [historyVatPeriod, setHistoryVatPeriod] = useState("All");
  const [historyTransactionType, setHistoryTransactionType] = useState("All");
  const [activePage, setActivePage] = useState("home");

  // Phase 8: Configurable VAT Rate & Company Profile State
  const [vatRate, setVatRate] = useState(25.5);
  const [vatRateInput, setVatRateInput] = useState("25.5");
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    businessId: "",
    vatNumber: "",
    address: "",
    email: "",
    phone: "",
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState("");
  const [dbConnected, setDbConnected] = useState(true);

  // Phase 10: AI Assistant State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  const appVersion = "1.0.0";

  const showSettingsSaved = (message = "✅ Settings saved") => {
    setSettingsSavedMessage(message);
    setTimeout(() => {
      setSettingsSavedMessage("");
    }, 3000);
  };

  const loadRules = async () => {
    try {
      const response = await fetch("/api/rules");
      if (!response.ok) throw new Error("Failed to load rules");
      const data = await response.json();

      setVatRules(
        data.map((rule) => ({
          id: rule.id,
          keyword: rule.keyword,
          transactionType: rule.transaction_type,
          vatApplicable: rule.vat_applicable,
        }))
      );
      setDbConnected(true);
    } catch (error) {
      console.error("Error loading rules:", error);
      setDbConnected(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to load transactions");
      const data = await response.json();

      setTransactions(
        data.map((item) => ({
          id: item.id,
          bookingDate: item.booking_date,
          details: item.details || "",
          transactionType: item.transaction_type,
          amount: Number(item.amount) || 0,
          userDecision: item.user_decision || "",
        }))
      );
      setDbConnected(true);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setDbConnected(false);
    }
  };

  const loadVatHistory = async () => {
    try {
      const response = await fetch("/api/vatreturns");
      if (!response.ok) throw new Error("Failed to load VAT history");
      const data = await response.json();
      setVatHistory(Array.isArray(data) ? data : []);
      setDbConnected(true);
    } catch (error) {
      console.error("Error loading VAT history:", error);
      setDbConnected(false);
    }
  };

  const loadHistoricalTransactions = async () => {
    try {
      const response = await fetch("/api/historical_transactions");
      if (!response.ok) throw new Error("Failed to load historical transactions");

      const data = await response.json();

      console.log("Historical Transactions API Response:", data);

      setHistoricalTransactions(Array.isArray(data) ? data : []);
      setDbConnected(true);
    } catch (error) {
      console.error("Error loading historical transactions:", error);
      setDbConnected(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedCompany = localStorage.getItem("vatflow_company_info");
      if (savedCompany) {
        setCompanyInfo(JSON.parse(savedCompany));
      }
      const savedVatRate = localStorage.getItem("vatflow_vat_rate");
      if (savedVatRate) {
        const parsedRate = parseFloat(savedVatRate);
        if (!isNaN(parsedRate)) {
          setVatRate(parsedRate);
          setVatRateInput(String(parsedRate));
        }
      }

      const response = await fetch("/api/settings");

      if (
        response.ok &&
        response.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await response.json();
        if (data && typeof data === "object") {
          setCompanyInfo((prev) => ({
            companyName:
              data.companyName ?? data.company_name ?? prev.companyName,
            businessId: data.businessId ?? data.business_id ?? prev.businessId,
            vatNumber: data.vatNumber ?? data.vat_number ?? prev.vatNumber,
            address: data.address ?? prev.address,
            email: data.email ?? prev.email,
            phone: data.phone ?? prev.phone,
          }));
          if (data.vatRate !== undefined || data.vat_rate !== undefined) {
            const apiRate = Number(data.vatRate ?? data.vat_rate);
            if (!isNaN(apiRate)) {
              setVatRate(apiRate);
              setVatRateInput(String(apiRate));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSaveCompanyInfo = async () => {
    localStorage.setItem("vatflow_company_info", JSON.stringify(companyInfo));
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyInfo,
          vatRate,
        }),
      });
    } catch (error) {
      console.warn("Settings API unavailable, saved locally:", error);
    }
    showSettingsSaved("✅ Settings saved");
  };

  const handleSaveVatRate = async () => {
    const parsed = parseFloat(vatRateInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert("Please enter a valid VAT rate between 0 and 100.");
      return;
    }
    setVatRate(parsed);
    localStorage.setItem("vatflow_vat_rate", String(parsed));
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyInfo,
          vatRate: parsed,
        }),
      });
    } catch (error) {
      console.warn("Settings API unavailable, saved locally:", error);
    }
    showSettingsSaved("✅ Settings saved");
  };

  // Phase 8: Database Maintenance Actions
  const handleClearImportedTransactions = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all imported transactions?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await fetch("/api/transactions", { method: "DELETE" });
    } catch (error) {
      console.warn("Transactions DELETE endpoint skipped:", error);
    }
    setTransactions([]);
    setTransactionsConfirmed(false);
    alert("Imported transactions cleared.");
  };

  const handleClearArchive = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all archived transactions and VAT history?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await fetch("/api/historical_transactions", { method: "DELETE" });
      await fetch("/api/vatreturns", { method: "DELETE" });
    } catch (error) {
      console.warn("Archive DELETE endpoint skipped:", error);
    }
    setHistoricalTransactions([]);
    setVatHistory([]);
    alert("Archive cleared.");
  };

  const handleResetRules = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all VAT rules?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    try {
      for (const rule of vatRules) {
        await fetch(`/api/rules?id=${rule.id}`, {
          method: "DELETE",
        });
      }
      await loadRules();
    } catch (error) {
      console.warn("Error resetting rules:", error);
    }
    alert("VAT rules have been reset.");
  };

  const handleResetEverything = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset EVERYTHING (transactions, archive, rules, and settings)?\n\nThis action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await fetch("/api/transactions", { method: "DELETE" });
      await fetch("/api/historical_transactions", { method: "DELETE" });
      await fetch("/api/vatreturns", { method: "DELETE" });
      for (const rule of vatRules) {
        await fetch(`/api/rules?id=${rule.id}`, { method: "DELETE" });
      }
    } catch (error) {
      console.warn("Reset API calls encountered errors:", error);
    }

    localStorage.removeItem("vatflow_company_info");
    localStorage.removeItem("vatflow_vat_rate");

    setTransactions([]);
    setTransactionsConfirmed(false);
    setHistoricalTransactions([]);
    setVatHistory([]);
    setVatRules([]);
    setVatRate(25.5);
    setVatRateInput("25.5");
    setCompanyInfo({
      companyName: "",
      businessId: "",
      vatNumber: "",
      address: "",
      email: "",
      phone: "",
    });
    alert("Application data has been completely reset.");
  };

  const getSuggestion = (description, transactionType) => {
    const text = (description || "").toLowerCase();

    const match = vatRules.find(
      (rule) =>
        rule.keyword &&
        text.includes(rule.keyword.toLowerCase()) &&
        rule.transactionType === transactionType
    );

    return match ? match.vatApplicable : "Review Required";
  };

  const getFinalVatDecision = (transaction) => {
    if (transaction.userDecision) {
      return transaction.userDecision;
    }

    return getSuggestion(transaction.details, transaction.transactionType);
  };

  const saveTransactions = async (transactionsToSave) => {
    try {
      for (const transaction of transactionsToSave) {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingDate: transaction.bookingDate,
            details: transaction.details,
            transactionType: transaction.transactionType,
            amount: transaction.amount,
            systemSuggestion: getSuggestion(
              transaction.details,
              transaction.transactionType
            ),
            userDecision: transaction.userDecision || "",
          }),
        });
      }
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  };

  useEffect(() => {
    loadRules();
    loadTransactions();
    loadVatHistory();
    loadHistoricalTransactions();
    loadSettings();
  }, []);

  const addRule = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: trimmed,
        transactionType,
        vatApplicable,
      }),
    });

    await loadRules();

    setKeyword("");
    setTransactionType("Debit");
    setVatApplicable("Yes");
  };

  const deleteRule = async (id) => {
    await fetch(`/api/rules?id=${id}`, { method: "DELETE" });
    await loadRules();
  };

  const updateUserDecision = (transactionId, decision) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, userDecision: decision }
          : transaction
      )
    );
  };

  const addTransactionAsRule = async (transaction) => {
    if (!transaction.userDecision) {
      alert("Please select Yes or No first.");
      return;
    }

    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: transaction.details,
        transactionType: transaction.transactionType,
        vatApplicable: transaction.userDecision,
      }),
    });

    await loadRules();

    alert(`Rule added with VAT = ${transaction.userDecision}`);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const parts = String(dateValue).split("/");

    if (parts.length === 3) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      let year = parts[2];

      if (year.length === 2) year = `20${year}`;

      return `${day}/${month}/${year}`;
    }

    return dateValue;
  };

  const parseAmount = (value) => {
    let s = String(value ?? "").replace(/[€\s]/g, "");
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");

    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }

    return parseFloat(s) || 0;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
      });

      const formattedData = jsonData.map((row, index) => ({
        id: index + 1,
        bookingDate: formatDate(row["Booking Date"]),
        details: row["Details"] || "",
        transactionType: row["Debit/Credit"] || "",
        amount: parseAmount(row["Amount"]),
        userDecision: "",
      }));

      setTransactions(formattedData);
      setTransactionsConfirmed(false);

      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const totalTransactions = transactions.length;

  const reviewRequired = transactions.filter(
    (t) =>
      getSuggestion(t.details, t.transactionType) === "Review Required" &&
      !t.userDecision
  ).length;

  const vatApplicableCount = transactions.filter(
    (t) => getFinalVatDecision(t) === "Yes"
  ).length;

  const vatNotApplicableCount = transactions.filter(
    (t) => getFinalVatDecision(t) === "No"
  ).length;

  const autoMatched = totalTransactions - reviewRequired;

  const inputVAT = transactionsConfirmed
    ? transactions
        .filter(
          (t) =>
            t.transactionType === "Debit" && getFinalVatDecision(t) === "Yes"
        )
        .reduce((sum, t) => sum + (t.amount * vatRate) / (100 + vatRate), 0)
    : 0;

  const outputVAT = transactionsConfirmed
    ? transactions
        .filter(
          (t) =>
            t.transactionType === "Credit" && getFinalVatDecision(t) === "Yes"
        )
        .reduce((sum, t) => sum + (t.amount * vatRate) / (100 + vatRate), 0)
    : 0;

  const vatPayable = outputVAT - inputVAT;

  const filteredTransactions = transactions.filter((transaction) => {
    const suggestion = getSuggestion(
      transaction.details,
      transaction.transactionType
    );

    const matchesSearch = (transaction.details || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesType =
      typeFilter === "All" || transaction.transactionType === typeFilter;

    const matchesVat = vatFilter === "All" || suggestion === vatFilter;

    return matchesSearch && matchesType && matchesVat;
  });

  const filteredHistoricalTransactions = historicalTransactions.filter(
    (transaction) => {
      const matchesSearch = (transaction.details || "")
        .toLowerCase()
        .includes(historySearchText.toLowerCase());

      const matchesVatPeriod =
        historyVatPeriod === "All" ||
        transaction.vat_period === historyVatPeriod;

      const matchesType =
        historyTransactionType === "All" ||
        transaction.transaction_type === historyTransactionType;

      return matchesSearch && matchesVatPeriod && matchesType;
    }
  );

  const isHistoryFilterDefault =
    historySearchText === "" &&
    historyVatPeriod === "All" &&
    historyTransactionType === "All";

  const totalArchivedTransactions = historicalTransactions.length;

  const totalVatReturnsFiled = vatHistory.length;

  const lastVatReturnDate =
    vatHistory.length > 0 ? vatHistory[0].confirmed_at : "-";

  const averageMonthlyVat =
    vatHistory.length > 0
      ? vatHistory.reduce(
          (sum, item) => sum + Number(item.vat_payable || 0),
          0
        ) / vatHistory.length
      : 0;

  const highestVatReturn =
    vatHistory.length > 0
      ? Math.max(...vatHistory.map((item) => Number(item.vat_payable || 0)))
      : 0;

  const totalRules = vatRules.length;

  const totalDebitValue = historicalTransactions
    .filter((t) => t.transaction_type === "Debit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCreditValue = historicalTransactions
    .filter((t) => t.transaction_type === "Credit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const lastFiledPeriod =
    vatHistory.length > 0 ? vatHistory[0].vat_period : "-";

  const mostUsedVatRule =
    vatRules.length > 0 ? vatRules[0].keyword : "-";

  const topDescriptions = Object.entries(
    historicalTransactions.reduce((acc, transaction) => {
      const details = transaction.details || "Unknown";

      acc[details] = (acc[details] || 0) + 1;

      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Phase 8: Next VAT Filing Due (12th of the following month for selected/current VAT period)
  const getNextVatFilingDate = () => {
    const basePeriod = vatPeriod || new Date().toISOString().substring(0, 7);
    const [yearStr, monthStr] = basePeriod.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    if (!isNaN(year) && !isNaN(month)) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      return `12/${String(nextMonth).padStart(2, "0")}/${nextYear}`;
    }

    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 12);
    return `${String(nextMonthDate.getDate()).padStart(2, "0")}/${String(
      nextMonthDate.getMonth() + 1
    ).padStart(2, "0")}/${nextMonthDate.getFullYear()}`;
  };

  const nextVatFilingDate = getNextVatFilingDate();

  // Phase 8 Review Fix 1: System Health Status
  const isSystemHealthy =
    dbConnected &&
    Array.isArray(historicalTransactions) &&
    Array.isArray(vatHistory);

  const systemStatusText = isSystemHealthy ? "Healthy" : "Attention Required";

  // Phase 9: Trend Analytics Calculations
  const autoMatchRate =
    totalTransactions > 0
      ? ((autoMatched / totalTransactions) * 100).toFixed(1)
      : 0;

  const vatRecoveryRatio =
    outputVAT > 0 ? ((inputVAT / outputVAT) * 100).toFixed(1) : 0;

  const topSuppliers = Object.entries(
    historicalTransactions
      .filter((t) => t.transaction_type === "Debit")
      .reduce((acc, t) => {
        const supplier = t.details || "Unknown";

        acc[supplier] = (acc[supplier] || 0) + 1;

        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topCustomers = Object.entries(
    historicalTransactions
      .filter((t) => t.transaction_type === "Credit")
      .reduce((acc, t) => {
        const customer = t.details || "Unknown";

        acc[customer] = (acc[customer] || 0) + 1;

        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const monthlyVatTrend = vatHistory
    .map((item) => ({
      period: item.vat_period,
      amount: Number(item.vat_payable || 0),
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  // Phase 10: Chart Data
  const debitCreditData = [
    {
      name: "Debit",
      value: totalDebitValue,
    },
    {
      name: "Credit",
      value: totalCreditValue,
    },
  ];

  const supplierChartData = topSuppliers.map(([name, value]) => ({
    name,
    value,
  }));

  const cardStyle = {
    padding: "24px",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    minWidth: "260px",
    backgroundColor: "#ffffff",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    transition: "0.2s ease",
  };

  const navButtonStyle = {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "1px solid #1976d2",
    backgroundColor: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  };

  const getNavButtonStyle = (page) => ({
    ...navButtonStyle,
    backgroundColor: activePage === page ? "#1976d2" : "#ffffff",
    color: activePage === page ? "#ffffff" : "#000000",
  });

  const settingsSectionStyle = {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "25px",
    backgroundColor: "#fafafa",
  };

  const settingsInputStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "8px",
    marginTop: "4px",
    marginBottom: "12px",
    display: "block",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const saveVatReturn = async () => {
    const response = await fetch("/api/vatreturns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vatPeriod,
        vatRate,
        inputVAT,
        outputVAT,
        vatPayable,
      }),
    });

    if (!response.ok) {
      throw new Error(`Saving VAT return failed (${response.status})`);
    }

    return response.json();
  };

  const archiveTransactions = async () => {
    const response = await fetch("/api/archive-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vatPeriod,
        transactions: transactions.map((t) => ({
          ...t,
          systemSuggestion: getSuggestion(t.details, t.transactionType),
          finalVatDecision: getFinalVatDecision(t),
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Archiving transactions failed (${response.status})`);
    }
  };

  const confirmVatReturn = async () => {
    if (!vatPeriod) {
      alert("Please select a VAT period first.");
      return;
    }

    if (vatApplicableCount === 0) {
      alert("No VAT applicable transactions found.");
      return;
    }

    const confirmed = window.confirm(
      `VAT Return Summary

VAT Period:
${vatPeriod}

Input VAT:
€${inputVAT.toFixed(2)}

Output VAT:
€${outputVAT.toFixed(2)}

VAT Due To VERO:
€${vatPayable.toFixed(2)}

Continue?`
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log("Step 1 - Saving VAT Return");

      await saveVatReturn();

      console.log("Step 2 - Archiving Transactions");

      await archiveTransactions();

      console.log("Step 3 - Refreshing Data");
      await loadTransactions();
      await loadVatHistory();
      await loadHistoricalTransactions();

      setTransactionsConfirmed(false);

      alert("VAT Return saved successfully.");

      console.log("Step 4 - Opening VERO");

      window.open("https://www.vero.fi/en/e-file/mytax/", "_blank");
    } catch (error) {
      console.error(error);

      alert(
        `Failed to save VAT Return

${error.message}`
      );
    }
  };

  // Phase 10: Local AI Assistant (Final Polished)
  const askAssistant = () => {
    if (!aiQuestion.trim()) {
      setAiAnswer("Please enter a question.");
      return;
    }

    const q = aiQuestion.toLowerCase();

    if (q.includes("highest vat")) {
      setAiAnswer(`Highest VAT return was €${highestVatReturn.toFixed(2)}`);
      return;
    }

    if (q.includes("vat returns")) {
      setAiAnswer(`Total VAT Returns Filed: ${totalVatReturnsFiled}`);
      return;
    }

    if (q.includes("transactions")) {
      setAiAnswer(`Total Archived Transactions: ${totalArchivedTransactions}`);
      return;
    }

    if (q.includes("top supplier") || q.includes("largest supplier")) {
      const supplier =
        topSuppliers.length > 0 ? topSuppliers[0][0] : "No supplier data";

      setAiAnswer(`Most frequent supplier: ${supplier}`);
      return;
    }

    if (q.includes("top customer") || q.includes("largest customer")) {
      const customer =
        topCustomers.length > 0 ? topCustomers[0][0] : "No customer data";

      setAiAnswer(`Most frequent customer: ${customer}`);
      return;
    }

    if (q.includes("auto match")) {
      setAiAnswer(`Current auto match rate is ${autoMatchRate}%`);
      return;
    }

    if (q.includes("recovery")) {
      setAiAnswer(`Current VAT recovery ratio is ${vatRecoveryRatio}%`);
      return;
    }

    if (q.includes("latest filing")) {
      setAiAnswer(`Latest filing period is ${lastFiledPeriod}`);
      return;
    }

    setAiAnswer("I couldn't answer that question.");
  };

  return (
    <div
      style={{
        maxWidth: "1800px",
        margin: "0 auto",
        padding: "30px 40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h1>🚀 VATFlow AI v1.0</h1>
        {companyInfo.companyName && (
          <div style={{ color: "#555", fontWeight: "bold" }}>
            🏢 {companyInfo.companyName}
            {companyInfo.vatNumber ? ` (${companyInfo.vatNumber})` : ""}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
          borderBottom: "1px solid #ccc",
          paddingBottom: "15px",
        }}
      >
        <button
          onClick={() => setActivePage("home")}
          style={getNavButtonStyle("home")}
        >
          🏠 Home
        </button>

        <button
          onClick={() => setActivePage("entry")}
          style={getNavButtonStyle("entry")}
        >
          ➕ New Entry
        </button>

        <button
          onClick={() => setActivePage("history")}
          style={getNavButtonStyle("history")}
        >
          📜 History
        </button>

        <button
          onClick={() => setActivePage("insights")}
          style={getNavButtonStyle("insights")}
        >
          📊 Business Insights
        </button>

        <button
          onClick={() => setActivePage("ai")}
          style={getNavButtonStyle("ai")}
        >
          🤖 AI Assistant
        </button>

        <button
          onClick={() => setActivePage("settings")}
          style={getNavButtonStyle("settings")}
        >
          ⚙️ Settings
        </button>
      </div>

      {activePage === "home" && (
        <>
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <h1>Executive Dashboard</h1>
            <p
              style={{
                color: "#666",
                fontSize: "16px",
              }}
            >
              Monitor VAT compliance, transaction activity, filing status and
              key business performance metrics.
            </p>
          </div>

          {/* ROW 1: OPERATIONAL KPIs */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div style={cardStyle}>
              <h3>Transactions Processed</h3>
              <h2>{totalTransactions}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Automatically Classified</h3>
              <h2>{autoMatched}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Pending Review</h3>
              <h2>{reviewRequired}</h2>
            </div>

            <div style={cardStyle}>
              <h3>VAT Eligible</h3>
              <h2>{vatApplicableCount}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Non-VAT Transactions</h3>
              <h2>{vatNotApplicableCount}</h2>
            </div>
          </div>

          {/* ROW 2: VAT KPIs */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div style={cardStyle}>
              <h3>Recoverable VAT Input</h3>
              <h2>€{inputVAT.toFixed(2)}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Collected VAT Output</h3>
              <h2>€{outputVAT.toFixed(2)}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Net VAT Liability</h3>
              <h2>€{vatPayable.toFixed(2)}</h2>
            </div>

            <div style={cardStyle}>
              <h3>🎯 Auto Match Rate</h3>
              <h2>{autoMatchRate}%</h2>
            </div>

            <div style={cardStyle}>
              <h3>♻️ VAT Recovery Ratio</h3>
              <h2>{vatRecoveryRatio}%</h2>
            </div>
          </div>

          {/* ROW 3: BUSINESS KPIs */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div style={cardStyle}>
              <h3>📁 Archived Records</h3>
              <h2>{totalArchivedTransactions}</h2>
            </div>

            <div style={cardStyle}>
              <h3>🧾 Filed VAT Returns</h3>
              <h2>{totalVatReturnsFiled}</h2>
            </div>

            <div style={cardStyle}>
              <h3>📊 Avg Monthly VAT</h3>
              <h2>€{averageMonthlyVat.toFixed(2)}</h2>
            </div>

            <div style={cardStyle}>
              <h3>📈 Highest VAT Return</h3>
              <h2>€{highestVatReturn.toFixed(2)}</h2>
            </div>
          </div>

          {/* ROW 4: SYSTEM KPIs */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div style={cardStyle}>
              <h3>📆 Next VAT Filing Due</h3>
              <h2>{nextVatFilingDate}</h2>
            </div>

            <div style={cardStyle}>
              <h3>{isSystemHealthy ? "🟢" : "🟡"} Platform Health</h3>
              <h2
                style={{
                  color: isSystemHealthy ? "#2e7d32" : "#ed6c02",
                }}
              >
                {systemStatusText}
              </h2>
            </div>

            <div style={cardStyle}>
              <h3>📅 Last Filed Period</h3>
              <h2>{lastFiledPeriod}</h2>
            </div>

            <div style={cardStyle}>
              <h3>⚙️ Classification Rules</h3>
              <h2>{totalRules}</h2>
            </div>
          </div>
        </>
      )}

      {activePage === "entry" && (
        <>
          <h1>VAT Processing Centre</h1>
          <p
            style={{
              color: "#666",
              marginBottom: "20px",
            }}
          >
            Import transactions, review VAT classifications, and prepare VAT
            returns.
          </p>

          <hr />

          <section>
            <h2>Transaction Import</h2>
            <p>
              Import transaction data from a bank statement for VAT analysis and
              classification.
            </p>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

            {transactions.length === 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  border: "1px dashed #ccc",
                  borderRadius: "10px",
                  backgroundColor: "#fafafa",
                }}
              >
                <h3>No Transactions Imported</h3>
                <p>
                  Upload an Excel bank statement to begin VAT processing.
                </p>
              </div>
            )}
          </section>

          {transactions.length > 0 && (
            <>
              <hr />

              <section>
                <h2>Transaction Review &amp; Classification</h2>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search description"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Debit</option>
                    <option>Credit</option>
                  </select>

                  <select
                    value={vatFilter}
                    onChange={(e) => setVatFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Review Required</option>
                  </select>
                </div>

                <table
                  border="1"
                  cellPadding="8"
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>Booking Date</th>
                      <th style={{ width: "35%" }}>Details</th>
                      <th>Debit/Credit</th>
                      <th>Amount</th>
                      <th>System Suggestion</th>
                      <th>User Decision</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const suggestion = getSuggestion(
                        transaction.details,
                        transaction.transactionType
                      );

                      return (
                        <tr key={transaction.id}>
                          <td>{transaction.bookingDate}</td>

                          <td style={{ textAlign: "left", paddingLeft: "10px" }}>
                            {transaction.details}
                          </td>

                          <td>{transaction.transactionType}</td>

                          <td style={{ textAlign: "right", fontWeight: "bold" }}>
                            €{Number(transaction.amount).toFixed(2)}
                          </td>

                          <td>{suggestion}</td>

                          <td>
                            <select
                              value={transaction.userDecision}
                              onChange={(e) =>
                                updateUserDecision(
                                  transaction.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </td>

                          <td>
                            {suggestion === "Review Required" ? (
                              <button
                                onClick={() =>
                                  addTransactionAsRule(transaction)
                                }
                              >
                                Add As Rule
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              <hr />

              <section>
                <h2>VAT Filing Summary</h2>
                <div
                  style={{
                    padding: "20px",
                    border: "2px solid #1976d2",
                    borderRadius: "10px",
                    backgroundColor: "#f5f9ff",
                    marginBottom: "30px",
                  }}
                >
                  <p>VAT Rate: {vatRate}%</p>
                  <div style={{ marginBottom: "15px" }}>
                    <label>VAT Period: </label>

                    <input
                      type="month"
                      value={vatPeriod}
                      onChange={(e) => setVatPeriod(e.target.value)}
                    />
                  </div>

                  <p>
                    Transactions Status:
                    {transactionsConfirmed
                      ? " ✅ Confirmed"
                      : " ⏳ Awaiting Confirmation"}
                  </p>

                  <p>Recoverable VAT Input: €{inputVAT.toFixed(2)}</p>
                  <p>Collected VAT Output: €{outputVAT.toFixed(2)}</p>

                  <h2>Net VAT Liability: €{vatPayable.toFixed(2)}</h2>

                  <button
                    onClick={() => {
                      if (reviewRequired > 0) {
                        alert(
                          `There are still ${reviewRequired} transactions requiring review.`
                        );
                        return;
                      }

                      setTransactionsConfirmed(true);
                    }}
                    style={{
                      backgroundColor: "#2e7d32",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      fontWeight: "bold",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Validate Transactions
                  </button>

                  <button
                    onClick={confirmVatReturn}
                    disabled={!transactionsConfirmed}
                    style={{
                      backgroundColor: "#1976d2",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      fontWeight: "bold",
                      cursor: transactionsConfirmed ? "pointer" : "not-allowed",
                      opacity: transactionsConfirmed ? 1 : 0.6,
                    }}
                  >
                    Submit VAT Return
                  </button>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {activePage === "history" && (
        <>
          <h2>📜 VAT Return History</h2>

          <table
            border="1"
            cellPadding="8"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "30px",
            }}
          >
            <thead>
              <tr>
                <th>VAT Period</th>
                <th>Recoverable VAT Input</th>
                <th>Collected VAT Output</th>
                <th>Net VAT Liability</th>
                <th>Filed Date</th>
              </tr>
            </thead>
            <tbody>
              {vatHistory.map((item) => (
                <tr key={item.id}>
                  <td>{item.vat_period}</td>
                  <td>€{Number(item.input_vat).toFixed(2)}</td>
                  <td>€{Number(item.output_vat).toFixed(2)}</td>
                  <td>€{Number(item.vat_payable).toFixed(2)}</td>
                  <td>{item.confirmed_at}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>📁 Archived Records</h2>

          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={{ marginRight: "6px" }}>
                Search by Description:
              </label>
              <input
                type="text"
                placeholder="Enter description"
                value={historySearchText}
                onChange={(e) => setHistorySearchText(e.target.value)}
                style={{
                  width: "220px",
                  padding: "6px 8px",
                }}
              />
            </div>

            <div>
              <label style={{ marginRight: "6px" }}>VAT Period:</label>
              <select
                value={historyVatPeriod}
                onChange={(e) => setHistoryVatPeriod(e.target.value)}
                style={{ padding: "6px 8px" }}
              >
                <option value="All">All Periods</option>
                {[...new Set(historicalTransactions.map((t) => t.vat_period))]
                  .filter(Boolean)
                  .sort()
                  .reverse()
                  .map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label style={{ marginRight: "6px" }}>Type:</label>
              <select
                value={historyTransactionType}
                onChange={(e) => setHistoryTransactionType(e.target.value)}
                style={{ padding: "6px 8px" }}
              >
                <option value="All">All Types</option>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <button
              onClick={() => {
                setHistorySearchText("");
                setHistoryVatPeriod("All");
                setHistoryTransactionType("All");
              }}
              disabled={isHistoryFilterDefault}
              style={{
                padding: "6px 14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                opacity: isHistoryFilterDefault ? 0.5 : 1,
                cursor: isHistoryFilterDefault ? "not-allowed" : "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>

          <p>
            Total Archived Records: {filteredHistoricalTransactions.length}
          </p>

          {filteredHistoricalTransactions.length === 0 && (
            <p
              style={{
                color: "#666",
                fontStyle: "italic",
              }}
            >
              No archived transactions found.
            </p>
          )}

          <table
            border="1"
            cellPadding="8"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th>Booking Date</th>
                <th style={{ textAlign: "left", paddingLeft: "10px" }}>
                  Details
                </th>
                <th>Type</th>
                <th>Amount</th>
                <th>VAT Decision</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistoricalTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.booking_date}</td>
                  <td style={{ textAlign: "left", paddingLeft: "10px" }}>
                    {transaction.details}
                  </td>
                  <td>{transaction.transaction_type}</td>
                  <td>€{Number(transaction.amount).toFixed(2)}</td>
                  <td>{transaction.user_decision}</td>
                  <td>{transaction.archived_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activePage === "insights" && (
        <>
          <h1>Business Intelligence Dashboard</h1>
          <p
            style={{
              color: "#666",
            }}
          >
            Visual analysis of VAT trends, financial activity and supplier
            concentration.
          </p>

          <div
            style={{
              marginBottom: "40px",
            }}
          >
            <h3>Monthly VAT Trend</h3>

            {monthlyVatTrend.length === 0 ? (
              <p>No VAT history available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyVatTrend}>
                  <XAxis dataKey="period" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#1976d2"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            style={{
              marginBottom: "40px",
            }}
          >
            <h3>Debit vs Credit</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={debitCreditData}>
                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="value" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginBottom: "40px",
            }}
          >
            <h3>Supplier Distribution</h3>

            {supplierChartData.length === 0 ? (
              <p>No supplier data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={supplierChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {activePage === "ai" && (
        <>
          <h1>VAT Intelligence Assistant</h1>

          <p>
            Ask questions about VAT returns, transactions, suppliers, customers
            and business metrics.
          </p>

          <textarea
            rows="5"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={askAssistant}
            style={{
              padding: "10px 20px",
            }}
          >
            Ask AI
          </button>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              minHeight: "100px",
            }}
          >
            {aiAnswer || "Ask a question to begin."}
          </div>

          <h3
            style={{
              marginTop: "30px",
            }}
          >
            Example Questions
          </h3>

          <ul>
            <li>What was our highest VAT?</li>

            <li>How many VAT returns do we have?</li>

            <li>Who is our top supplier?</li>

            <li>Who is our top customer?</li>

            <li>How many archived transactions are stored?</li>

            <li>What is our auto match rate?</li>

            <li>What is our VAT recovery ratio?</li>

            <li>What is the latest filing period?</li>
          </ul>
        </>
      )}

      {activePage === "settings" && (
        <>
          <h2>⚙️ Settings</h2>

          {settingsSavedMessage && (
            <div
              style={{
                color: "green",
                fontWeight: "bold",
                padding: "10px 14px",
                marginBottom: "20px",
                backgroundColor: "#e8f5e9",
                border: "1px solid #a5d6a7",
                borderRadius: "6px",
              }}
            >
              {settingsSavedMessage}
            </div>
          )}

          {/* SECTION 1: COMPANY INFORMATION */}
          <div style={settingsSectionStyle}>
            <h3>🏢 Company Information</h3>

            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Consulting Oy"
              value={companyInfo.companyName}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyName: e.target.value })
              }
              style={settingsInputStyle}
            />

            <label>Business ID</label>
            <input
              type="text"
              placeholder="e.g. 1234567-8"
              value={companyInfo.businessId}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, businessId: e.target.value })
              }
              style={settingsInputStyle}
            />

            <label>VAT Number</label>
            <input
              type="text"
              placeholder="e.g. FI12345678"
              value={companyInfo.vatNumber}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, vatNumber: e.target.value })
              }
              style={settingsInputStyle}
            />

            <label>Address</label>
            <input
              type="text"
              placeholder="e.g. Mannerheimintie 1, 00100 Helsinki"
              value={companyInfo.address}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, address: e.target.value })
              }
              style={settingsInputStyle}
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="e.g. finance@company.fi"
              value={companyInfo.email}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, email: e.target.value })
              }
              style={settingsInputStyle}
            />

            <label>Phone</label>
            <input
              type="text"
              placeholder="e.g. +358 40 123 4567"
              value={companyInfo.phone}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, phone: e.target.value })
              }
              style={settingsInputStyle}
            />

            <button
              onClick={handleSaveCompanyInfo}
              style={{
                padding: "8px 16px",
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save Company Information
            </button>
          </div>

          {/* SECTION 2: VAT CONFIGURATION */}
          <div style={settingsSectionStyle}>
            <h3>💶 VAT Configuration</h3>
            <p>Current Active VAT Rate: {vatRate}%</p>

            <label>VAT Rate (%)</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <input
                type="number"
                step="0.1"
                value={vatRateInput}
                onChange={(e) => setVatRateInput(e.target.value)}
                style={{
                  width: "120px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={handleSaveVatRate}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save VAT Rate
              </button>
            </div>
          </div>

          {/* VAT RULES MASTER TABLE */}
          <div style={settingsSectionStyle}>
            <h3>📋 Classification Rules Master Table</h3>

            <table
              border="1"
              cellPadding="8"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#fff",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Type</th>
                  <th>VAT</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vatRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.keyword}</td>
                    <td>{rule.transactionType}</td>
                    <td>{rule.vatApplicable}</td>
                    <td>
                      <button onClick={() => deleteRule(rule.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Add New Rule</h4>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ padding: "6px 8px" }}
              />

              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                style={{ padding: "6px 8px" }}
              >
                <option>Debit</option>
                <option>Credit</option>
              </select>

              <select
                value={vatApplicable}
                onChange={(e) => setVatApplicable(e.target.value)}
                style={{ padding: "6px 8px" }}
              >
                <option>Yes</option>
                <option>No</option>
              </select>

              <button onClick={addRule} style={{ padding: "6px 14px" }}>
                Add Rule
              </button>
            </div>
          </div>

          {/* SECTION 3: SYSTEM STATISTICS */}
          <div style={settingsSectionStyle}>
            <h3>📊 System Statistics</h3>

            <table
              border="1"
              cellPadding="8"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderCollapse: "collapse",
                backgroundColor: "#fff",
              }}
            >
              <tbody>
                <tr>
                  <td>
                    <strong>Transactions Processed</strong>
                  </td>
                  <td>{totalTransactions}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Archived Records</strong>
                  </td>
                  <td>{totalArchivedTransactions}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Filed VAT Returns</strong>
                  </td>
                  <td>{totalVatReturnsFiled}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Classification Rules</strong>
                  </td>
                  <td>{totalRules}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Version</strong>
                  </td>
                  <td>{appVersion}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 4: DATABASE MAINTENANCE */}
          <div style={settingsSectionStyle}>
            <h3>🛠️ Database Maintenance</h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Administrative reset and cleanup utilities. All actions require
              confirmation.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleClearImportedTransactions}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Clear Imported Transactions
              </button>

              <button
                onClick={handleClearArchive}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Clear Archive
              </button>

              <button
                onClick={handleResetRules}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Reset Rules
              </button>

              <button
                onClick={handleResetEverything}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #d32f2f",
                  borderRadius: "4px",
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Reset Everything
              </button>
            </div>
          </div>

          {/* SECTION 5: APPLICATION INFORMATION */}
          <div style={settingsSectionStyle}>
            <h3>ℹ️ Application Information</h3>
            <p>
              <strong>Application:</strong> VATFlow AI
            </p>
            <p>
              <strong>Version:</strong> {appVersion}
            </p>
            <p>
              <strong>Database:</strong>{" "}
              {dbConnected ? "Connected" : "Disconnected"}
            </p>
            <p>
              <strong>Rules Loaded:</strong> {totalRules}
            </p>
            <p>
              <strong>Archived Records:</strong> {totalArchivedTransactions}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;