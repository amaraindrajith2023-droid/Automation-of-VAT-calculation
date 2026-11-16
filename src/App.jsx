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
  ]);

  const [keyword, setKeyword] = useState("");
  const [transactionType, setTransactionType] = useState("Debit");
  const [vatApplicable, setVatApplicable] = useState("Yes");

  const addRule = () => {
    if (!keyword.trim()) return;

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

  const getSuggestion = (description, type) => {
    const match = vatRules.find(
      (rule) =>
        description
          .toLowerCase()
          .includes(rule.keyword.toLowerCase()) &&
        rule.transactionType === type
    );

    return match ? match.vatApplicable : "Review Required";
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
                  onClick={() => deleteRule(rule.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "30px" }}>
        Add New Rule
      </h3>

      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
        />

        <select
          value={transactionType}
          onChange={(e) =>
            setTransactionType(e.target.value)
          }
        >
          <option>Debit</option>
          <option>Credit</option>
        </select>

        <select
          value={vatApplicable}
          onChange={(e) =>
            setVatApplicable(e.target.value)
          }
        >
          <option>Yes</option>
          <option>No</option>
        </select>

        <button onClick={addRule}>
          Add Rule
        </button>
      </div>

      <hr />

      <h2>Transaction Matching Engine</h2>

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
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount (€)</th>
            <th>System Suggestion</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>{transaction.transactionType}</td>
              <td>{transaction.amount}</td>
              <td>
                {getSuggestion(
                  transaction.description,
                  transaction.transactionType
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;