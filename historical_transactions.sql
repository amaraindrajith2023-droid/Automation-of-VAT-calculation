CREATE TABLE historical_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    vat_return_id INTEGER,

    booking_date TEXT,
    details TEXT,
    transaction_type TEXT,

    amount REAL,

    system_suggestion TEXT,

    user_decision TEXT,

    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
