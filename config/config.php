<?php
/**
 * PARTO Auto Marketplace - Core Configuration
 * Compatible with Hostinger Shared Web Hosting & PHP 8.0+
 */

// Define application root
if (!defined('PARTO_ROOT')) {
    define('PARTO_ROOT', dirname(__DIR__));
}

// Environment settings
define('APP_NAME', 'PARTO');
define('APP_TAGLINE', 'Auto Spare Parts & Automotive Services');
define('APP_TAGLINE_AR', 'سوق قطع غيار السيارات والخدمات المتكاملة');
define('APP_URL', getenv('APP_URL') ?: 'https://parto.dynapulsar.com');
define('APP_VERSION', '2.0.0');

// Currency & Region Defaults
define('DEFAULT_CURRENCY', 'SAR');
define('CURRENCY_SYMBOL', 'ر.س');
define('CURRENCY_SYMBOL_EN', 'SAR');
define('DEFAULT_COUNTRY', 'SA');

// Session config
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Current Language Selection (Default: Arabic, fallback English)
if (isset($_GET['lang']) && in_array($_GET['lang'], ['ar', 'en'])) {
    $_SESSION['parto_lang'] = $_GET['lang'];
}
$currentLang = $_SESSION['parto_lang'] ?? 'ar';
$isRtl = ($currentLang === 'ar');

// Commission Rates by Business Category (Percentage)
$commissionRates = [
    'new_auto_spare_parts' => 8,   // 8% for New Auto Spare Parts
    'used_auto_spare_parts' => 10,  // 10% for Tashleeh (Used Parts)
    'tow_company'          => 12,  // 12% for Towing (Satḥa)
    'mobile_workshop'     => 12,  // 12% for Mobile Workshop
    'digital_alignment'   => 10,  // 10% for Wheel Alignment
    'mechanics_workshop'  => 10,  // 10% for Mechanics Workshop
];

// Helper to escape output
function e($str) {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

// Helper for formatted price
function formatPrice($amount, $currency = DEFAULT_CURRENCY, $lang = null) {
    global $currentLang;
    $lang = $lang ?: $currentLang;
    $formatted = number_format((float)$amount, 2);
    return $lang === 'ar' ? "{$formatted} " . CURRENCY_SYMBOL : "{$currency} {$formatted}";
}
