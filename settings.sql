CREATE TABLE settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL
);

INSERT INTO settings
(setting_key, setting_value)
VALUES
('standard_vat_rate', '25.5');

INSERT INTO settings
(setting_key, setting_value)
VALUES
('company_name', '');

INSERT INTO settings
(setting_key, setting_value)
VALUES
('business_id', '');

INSERT INTO settings
(setting_key, setting_value)
VALUES
('default_currency', 'EUR');