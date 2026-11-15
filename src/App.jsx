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

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🚀 VATFlow AI</h1>

      <p>
        VAT classification knowledge base and transaction matching engine.
      </p>

      <hr />

      <h2>VAT Rules Master Table</h2>

      <table
        border="1"
        cellPadding="10"
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
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Add New Rule</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: "10px",
            minWidth: "250px",
          }}
        />

        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          style={{
            padding: "10px",
          }}
        >
          <option>Debit</option>
          <option>Credit</option>
        </select>

        <select
          value={vatApplicable}
          onChange={(e) => setVatApplicable(e.target.value)}
          style={{
            padding: "10px",
          }}
        >
          <option>Yes</option>
          <option>No</option>
        </select>

        <button
          onClick={addRule}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Rule
        </button>
      </div>

      <hr />

      <h2>Next Development Phase</h2>

      <p>
        Upload bank transactions and automatically match them against these VAT
        rules.
      </p>
    </div>
  );
}

export default App;