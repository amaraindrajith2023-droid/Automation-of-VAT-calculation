import { useState } from "react";

function App() {
  const [vatRules, setVatRules] = useState([
    {
      id: 1,
      keyword: "Microsoft",
      transactionType: "Debit",
      vatApplicable: "Yes",
    },
    {
      id: 2,
      keyword: "Salary",
      transactionType: "Debit",
      vatApplicable: "No",
    },
    {
      id: 3,
      keyword: "Vero",
      transactionType: "Debit",
      vatApplicable: "No",
    },
  ]);

  const [keyword, setKeyword] = useState("");
  const [transactionType, setTransactionType] = useState("Debit");
  const [vatApplicable, setVatApplicable] = useState("Yes");

  const [transactions] = useState([
    {
      id: 1,
      date: "2026-11-01",
      description: "Microsoft Ireland",
      transactionType: "Debit",
      amount: 25,
    },
    {
      id: 2,
      date: "2026-11-03",
      description: "Salary Payment",
      transactionType: "Debit",
      amount: 3500,
    },
    {
      id: 3,
      date: "2026-11-05",
      description: "ABC Consulting Oy",
      transactionType: "Debit",
      amount: 500,
    },
    {
      id: 4,
      date: "2026-11-08",
      description: "Customer Invoice Payment",
      transactionType: "Credit",
      amount: 1200,
    },
  ]);

  const addRule = () => {
    if (!keyword.trim()) {
      alert("Please enter a keyword");
      return;
    }

    const newRule = {
      id: Date.now(),
      keyword,
      transactionType,
      vatApplicable,
    };

    setVatRules([...vatRules, newRule]);

    setKeyword("");
    setTransactionType("Debit");
    setVatApplicable("Yes");
  };

  const deleteRule = (id) => {
    setVatRules(vatRules.filter((rule) => rule.id !== id));
  };

  const getSuggestion = (description, transactionType) => {
    const rule = vatRules.find(
      (rule) =>
        description
          .toLowerCase()
          .includes(rule.keyword.toLowerCase()) &&
        transactionType === rule.transactionType
    );

    return rule ? rule.vatApplicable : "Review Required";
  };

  const addTransactionAsRule = (transaction) => {
    const newRule = {
      id: Date.now(),
      keyword: transaction.description,
      transactionType: transaction.transactionType,
      vatApplicable: "Yes",
    };

    setVatRules([...vatRules, newRule]);

    alert(
      `"${transaction.description}" added to VAT Rules table`
    );
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🚀 VATFlow AI</h1>

      <p>
        VAT classification engine with rules-based transaction matching.
      </p>

      <hr />

      <h2>VAT Rules Master Table</h2>

      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Transaction Type</th>
            <th>VAT Applicable</th>
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
                <button
                  onClick=