# Fugo-Innovations — PHP Database Configuration

This repository now includes minimal PHP files to connect to a MySQL database named `data_fugo`.

Files added

- `config.php` — DB configuration array. Default dbname is `data_fugo`. Update `user` and `pass` with your credentials.
- `db.php` — PDO wrapper that returns a connected PDO instance via `getPDO()`.
- `test_db.php` — quick script to verify the connection (runs `SELECT 1`).

How to configure

1. Open `config.php` and set your MySQL credentials (host, user, pass). The `dbname` is already set to `data_fugo`.

How to test (PowerShell on Windows)

Run a PHP built-in server from the repo root and open the test script in a browser or curl it.

```powershell
# start built-in server on port 8000
php -S localhost:8000 -t .;
# then open in browser: http://localhost:8000/test_db.php
# or from PowerShell use Invoke-WebRequest
Invoke-WebRequest http://localhost:8000/test_db.php -UseBasicParsing | Select-Object -ExpandProperty Content
```

If you don't have PHP installed, install a current PHP runtime (7.4+ recommended) or use XAMPP/WAMP/MAMP and place the repo in the web root.

Security note

These files are intended for development and local testing. Avoid committing real credentials into version control. For production, use environment variables or a secrets manager and remove verbose error messages.
