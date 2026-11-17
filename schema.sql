CREATE TABLE vat_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    vat_applicable TEXT NOT NULL
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_date TEXT,
    details TEXT,
    transaction_type TEXT,
    amount REAL,
    system_suggestion TEXT,
    user_decision TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);