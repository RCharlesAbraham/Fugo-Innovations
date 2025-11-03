-- init_data.sql
-- MySQL-compatible SQL file with schema and sample data for the Fugo Innovations project.
-- NOTE: Passwords are inserted here as plaintext for convenience; hash passwords before using in production.

-- Wrap in a transaction (optional)
START TRANSACTION;

-- Users table (admin + sample users)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Services table (offers / products)
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  short_desc VARCHAR(255),
  long_desc TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  image VARCHAR(255),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inquiries / contact messages
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  service_id INT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inquiry_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: a simple images table if you want to manage image metadata (not required)
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample users
INSERT INTO users (username, password, role, email) VALUES
('admin', 'admin123', 'admin', 'admin@example.com'),
('alice', 'alicepass', 'user', 'alice@example.com'),
('bob', 'bobpass', 'user', 'bob@example.com');

-- Insert sample services (images reference files under Images/ folder)
INSERT INTO services (title, short_desc, long_desc, price, image, active) VALUES
('Cloud Hosting', 'Scalable cloud hosting', 'Managed cloud hosting with auto-scaling, backups and 24/7 support.', 199.00, 'Images/BG1.jpg', 1),
('Web Development', 'Modern responsive websites', 'Full-stack web development: UI/UX, frontend, backend, and deployment.', 2999.00, 'Images/BG2.jpg', 1),
('Mobile App', 'iOS & Android apps', 'Native and cross-platform mobile app development with analytics integration.', 4999.00, 'Images/BG3.jpg', 1),
('Data Analytics', 'Insights & dashboards', 'Data pipeline setup, dashboards, and predictive analytics.', 2499.00, 'Images/BG4.jpg', 1),
('AI Consulting', 'ML & AI strategy', 'Proof-of-concepts, model training, and MLOps guidance.', 3999.00, 'Images/BG5.jpg', 1);

-- Insert sample inquiries (some linked to services)
INSERT INTO inquiries (name, email, message, service_id, status) VALUES
('Alice Smith', 'alice@example.com', 'I\'m interested in Cloud Hosting for a startup. Can you provide estimated costs for 50 users?', 1, 'new'),
('Bob Johnson', 'bob@example.com', 'We need a web app for our e-commerce store. What is your typical timeline?', 2, 'new'),
('Charlie Lee', 'charlie@example.com', 'Do you offer maintenance packages after launch?', NULL, 'new');

-- Optional: register images (mirrors files in Images/ folder)
INSERT INTO images (path, alt_text) VALUES
('Images/BG1.jpg', 'Background 1'),
('Images/BG2.jpg', 'Background 2'),
('Images/BG3.jpg', 'Background 3'),
('Images/BG4.jpg', 'Background 4'),
('Images/BG5.jpg', 'Background 5'),
('Images/Logo.png', 'Fugo Innovations logo');

COMMIT;

-- End of init_data.sql
-- To adapt for Postgres: replace `INT AUTO_INCREMENT` with `SERIAL` and adjust engine/charset lines.
-- To adapt for SQLite: replace AUTO_INCREMENT and engine/charset lines, and use INTEGER PRIMARY KEY AUTOINCREMENT.
