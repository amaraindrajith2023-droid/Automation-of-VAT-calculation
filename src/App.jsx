import { useState } from "react";
import * as XLSX from "xlsx";

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

  const [transactions, setTransactions] = useState([]);

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

  const getSuggestion = (description, transactionType) => {
    const match = vatRules.find(
      (rule) =>
        description
          ?.toLowerCase()
          .includes(rule.keyword.toLowerCase()) &&
        rule.transactionType === transactionType
    );

    return match ? match.vatApplicable : "Review Required";
  };

  const addTransactionAsRule = (transaction) => {
    const newRule = {
      id: Date.now(),
      keyword: transaction.details,
      transactionType: transaction.transactionType,
      vatApplicable: transaction.userDecision || "Yes",
    };

    setVatRules([...vatRules, newRule]);

    alert("Rule added successfully");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map(
        (row, index) => ({
          id: index + 1,
          bookingDate: row["Booking Date"] || "",
          details: row["Details"] || "",
          transactionType:
            row["Debit/Credit"] || "",
          amount: Number(
            row["Amount"] || 0
          ),
          userDecision: "",
        })
      );

      setTransactions(formattedData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🚀 VATFlow AI</h1>

      <p>
        Upload bank transactions and
        automatically classify VAT.
      </p>

      <hr />

      <h2>Upload Bank Statement</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />

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
                <button
                  onClick={() =>
                    deleteRule(rule.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "25px" }}>
        Add New Rule
      </h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
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

      <h2>Imported Transactions</h2>

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
            <th>Booking Date</th>
            <th>Details</th>
            <th>Debit/Credit</th>
            <th>Amount</th>
            <th>System Suggestion</th>
            <th>User Decision</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => {
            const suggestion =
              getSuggestion(
                transaction.details,
                transaction.transactionType
              );

            return (
              <tr key={transaction.id}>
                <td>
                  {transaction.bookingDate}
                </td>

                <td>
                  {transaction.details}
                </td>

                <td>
                  {transaction.transactionType}
                </td>

                <td>
                  €
                  {transaction.amount.toFixed(
                    2
                  )}
                </td>

                <td>{suggestion}</td>

                <td>
                  <select>
                    <option>
                      Select
                    </option>
                    <option>
                      Yes
                    </option>
                    <option>
                      No
                    </option>
                  </select>
                </td>

                <td>
                  {suggestion ===
                    "Review Required" && (
                    <button
                      onClick={() =>
                        addTransactionAsRule(
                          transaction
                        )
                      }
                    >
                      Add As Rule
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;