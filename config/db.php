<?php
/**
 * PARTO Database Configuration & Connection Manager
 * Supports Yii 2 ActiveRecord / Connection Component and legacy PDO fallback.
 * Works seamlessly with Hostinger MySQL / MariaDB and embedded SQLite.
 */

require_once __DIR__ . '/config.php';

// Helper class for legacy / direct PDO queries
class Database {
    private static ?PDO $instance = null;
    private static string $driver = 'mysql';

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        self::loadEnv();

        $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
        $dbName = getenv('DB_NAME') ?: 'u87654321_parto';
        $dbUser = getenv('DB_USER') ?: 'u87654321_parto';
        $dbPass = getenv('DB_PASS') ?: '';
        $dbPort = getenv('DB_PORT') ?: '3306';

        // Try MySQL first if credentials detected
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

                $prodCount = 0;
                try {
                    $prodCount = (int)$pdo->query("SELECT count(*) FROM products WHERE status = 'active'")->fetchColumn();
                } catch (Exception $e) {
                    $prodCount = 0;
                }
                if ($prodCount < 20) {
                    self::initializeTables($pdo);
                }

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

        $prodCount = 0;
        try {
            $prodCount = (int)$pdo->query("SELECT count(*) FROM products WHERE status = 'active'")->fetchColumn();
        } catch (Exception $e) {
            $prodCount = 0;
        }

        if ($isNewDb || filesize($sqlitePath) < 1000 || $prodCount < 20) {
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
        $schemaFile = __DIR__ . '/schema.sql';
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            
            if (self::$driver === 'sqlite') {
                $sql = str_replace(['AUTO_INCREMENT', 'INT PRIMARY KEY AUTO_INCREMENT', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'], 
                                   ['AUTOINCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT', 'DATETIME DEFAULT CURRENT_TIMESTAMP'], $sql);
                $sql = preg_replace('/ENGINE\s*=\s*InnoDB[^;]*/i', '', $sql);
                $sql = preg_replace('/CHARACTER SET [a-zA-Z0-9_]+/i', '', $sql);
                $sql = preg_replace('/COLLATE [a-zA-Z0-9_]+/i', '', $sql);
            }

            try {
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                foreach ($statements as $stmt) {
                    if (!empty($stmt)) {
                        $pdo->exec($stmt);
                    }
                }

                // Ensure Tashleeh tenant and used parts are deactivated for launch
                $pdo->exec("UPDATE tenants SET status = 'inactive' WHERE id = 't-tashleeh-star'");
                $pdo->exec("UPDATE products SET status = 'inactive' WHERE id IN ('p-tashleeh-v6-engine', 'p-tashleeh-gearbox')");
            } catch (Exception $e) {
                error_log("Schema auto-init notice: " . $e->getMessage());
            }
        }
    }
}

function getDB(): PDO {
    return Database::getConnection();
}

// -------------------------------------------------------------
// Return Yii 2 DB Component Configuration
// -------------------------------------------------------------
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS') ?: '';
$dbPort = getenv('DB_PORT') ?: '3306';

$sqlitePath = PARTO_ROOT . '/config/parto.sqlite';

if (!empty($dbName) && !empty($dbUser)) {
    return [
        'class' => 'yii\db\Connection',
        'dsn' => "mysql:host={$dbHost};port={$dbPort};dbname={$dbName}",
        'username' => $dbUser,
        'password' => $dbPass,
        'charset' => 'utf8mb4',
        'enableSchemaCache' => (defined('YII_ENV_PROD') && YII_ENV_PROD),
        'schemaCacheDuration' => 3600,
        'schemaCache' => 'cache',
    ];
}

// Default to SQLite (zero-config, high-speed plug-and-play)
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'sqlite:' . $sqlitePath,
    'charset' => 'utf8',
    'enableSchemaCache' => (defined('YII_ENV_PROD') && YII_ENV_PROD),
    'schemaCacheDuration' => 3600,
    'schemaCache' => 'cache',
];
