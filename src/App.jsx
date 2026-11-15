function App() {
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "0 auto"
      }}
    >
      <h1>🚀 VATFlow AI</h1>

      <p>
        AI-powered VAT classification and reporting tool for Finnish businesses.
      </p>

      <h2>Project Goal</h2>

      <p>
        Upload monthly bank transactions, identify VAT-applicable transactions,
        calculate VAT automatically, and generate VAT reports for Vero.
      </p>

      <h2>Features</h2>

      <ul>
        <li>Upload CSV bank statements</li>
        <li>Review transactions</li>
        <li>Classify VAT Applicable / Non-VAT</li>
        <li>Calculate VAT automatically</li>
        <li>Generate monthly VAT summary</li>
        <li>AI-powered VAT recommendations</li>
      </ul>

      <button
        style={{
          padding: "12px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Upload Transactions
      </button>
    </div>
  );
}

export default App;