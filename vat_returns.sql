CREATE TABLE vat_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vat_period TEXT NOT NULL,
    vat_rate REAL NOT NULL,
    output_vat REAL NOT NULL,
    input_vat REAL NOT NULL,
    vat_payable REAL NOT NULL,
    confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);