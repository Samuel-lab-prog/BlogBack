INSERT INTO users VALUES(default, 'Alice', 'Smith', 'alicesmith@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', false)
ON CONFLICT DO NOTHING;
INSERT INTO users VALUES(default, 'Bob', 'Johnson', 'bobjohnson@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', false)
ON CONFLICT DO NOTHING;
INSERT INTO users VALUES(default, 'Charlie', 'Brown', 'charliebrown@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', false)
ON CONFLICT DO NOTHING;
INSERT INTO users VALUES(default, 'Diana', 'Prince', 'dianaprince@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', false)
ON CONFLICT DO NOTHING;
INSERT INTO users VALUES(default, 'Ethan', 'Hunt', 'ethanhunt@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', false)
ON CONFLICT DO NOTHING;  
INSERT INTO users VALUES(default, 'Admin', 'User', 'adminuser@gmail.com', '$2a$10$7QJH6jF1Zp1Zp1Zp1Zp1uE6jF1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1Zp1', true)
ON CONFLICT DO NOTHING;
