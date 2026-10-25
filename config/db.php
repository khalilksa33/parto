<?php
/**
 * Database Connection Manager (PDO)
 * Supports Hostinger MySQL / MariaDB and automatic zero-config SQLite fallback.
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;
    private static string $driver = 'mysql';

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // Check environment or .env file
        self::loadEnv();

        $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
        $dbName = getenv('DB_NAME') ?: 'u87654321_parto';
        $dbUser = getenv('DB_USER') ?: 'u87654321_parto';
        $dbPass = getenv('DB_PASS') ?: '';
        $dbPort = getenv('DB_PORT') ?: '3306';

        // Try MySQL first if credentials or Hostinger config detected
        if (getenv('DB_NAME') && getenv('DB_USER')) {
            try {
                $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
                $pdo = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
                self::$instance = $pdo;
                self::$driver = 'mysql';
                return self::$instance;
            } catch (PDOException $e) {
                error_log("MySQL connection failed: " . $e->getMessage() . ". Falling back to embedded SQLite.");
            }
        }

        // SQLite fallback (Zero-configuration plug-and-play)
        $sqlitePath = PARTO_ROOT . '/config/parto.sqlite';
        $isNewDb = !file_exists($sqlitePath);

        $pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $pdo->exec("PRAGMA foreign_keys = ON;");
        self::$instance = $pdo;
        self::$driver = 'sqlite';

        if ($isNewDb || filesize($sqlitePath) < 1000) {
            self::initializeTables($pdo);
        }

        return self::$instance;
    }

    public static function getDriver(): string {
        return self::$driver;
    }

    private static function loadEnv(): void {
        $envFile = PARTO_ROOT . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '#')) continue;
                [$key, $val] = explode('=', $line, 2) + [null, null];
                if ($key && $val !== null) {
                    putenv(trim($key) . '=' . trim(trim($val), "\"'"));
                }
            }
        }
    }

    public static function initializeTables(PDO $pdo): void {
        // Auto-initialize schema and default seed data
        $schemaFile = __DIR__ . '/schema.sql';
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            
            // If SQLite, adjust MySQL-specific syntax
            if (self::$driver === 'sqlite') {
                $sql = str_replace(['AUTO_INCREMENT', 'INT PRIMARY KEY AUTO_INCREMENT', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'], 
                                   ['AUTOINCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT', 'DATETIME DEFAULT CURRENT_TIMESTAMP'], $sql);
                $sql = preg_replace('/ENGINE\s*=\s*InnoDB[^;]*/i', '', $sql);
                $sql = preg_replace('/CHARACTER SET [a-zA-Z0-9_]+/i', '', $sql);
                $sql = preg_replace('/COLLATE [a-zA-Z0-9_]+/i', '', $sql);
            }

            try {
                // Execute individual statements
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                foreach ($statements as $stmt) {
                    if (!empty($stmt)) {
                        $pdo->exec($stmt);
                    }
                }
            } catch (Exception $e) {
                error_log("Schema auto-init notice: " . $e->getMessage());
            }
        }
    }
}

// Function shorthand
function getDB(): PDO {
    return Database::getConnection();
}
