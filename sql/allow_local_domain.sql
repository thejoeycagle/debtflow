-- Allow debtflow.local domain for internal users
INSERT INTO auth.email_allow_list (email)
VALUES ('*@debtflow.local')
ON CONFLICT DO NOTHING;