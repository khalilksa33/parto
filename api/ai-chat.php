<?php
/**
 * PARTO API - AI Automotive Assistant & Diagnostics Endpoint
 * Supports Google Gemini API with smart offline fallback
 */

header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$message = trim($input['message'] ?? '');

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

$apiKey = getenv('GEMINI_API_KEY') ?: '';

// If Gemini API Key exists, call Google Gemini 1.5 Flash endpoint
if (!empty($apiKey)) {
    try {
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($apiKey);
        
        $prompt = "You are the PARTO AI Garage Assistant, an expert auto mechanic for Saudi Arabia automotive marketplace.
Diagnose car issues based on user symptoms, or help them identify the exact auto part they need.
Respond in Arabic or English according to the user's language.
If you determine the user needs a replacement part, append a JSON block at the end:
```json
{\"action\": \"redirect_tashleeh\", \"part\": \"Part Name\", \"make\": \"Make\", \"model\": \"Model\"}
```
If they need an emergency flatbed tow truck (highway breakdown, engine seized, cannot drive), append:
```json
{\"action\": \"redirect_towing\"}
```
If they need on-site repair/maintenance (dead battery jump start, flat tire, brake inspection, mobile mechanic), append:
```json
{\"action\": \"redirect_workshop\"}
```
User inquiry: " . $message;

        $postData = [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ];

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $geminiRes = json_decode($response, true);
            $aiText = $geminiRes['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            // Extract JSON action block if present
            $action = null;
            $part = null;
            $make = null;
            $model = null;

            if (preg_match('/```json\s*(\{.*?\})\s*```/s', $aiText, $matches)) {
                $actionData = json_decode($matches[1], true);
                if ($actionData) {
                    $action = $actionData['action'] ?? null;
                    $part = $actionData['part'] ?? null;
                    $make = $actionData['make'] ?? null;
                    $model = $actionData['model'] ?? null;
                }
                $aiText = trim(str_replace($matches[0], '', $aiText));
            }

            echo json_encode([
                'success' => true,
                'response' => $aiText,
                'action' => $action,
                'part' => $part,
                'make' => $make,
                'model' => $model
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log("Gemini API call exception: " . $e->getMessage());
    }
}

// Smart Heuristic Diagnostic Engine (Offline / Standalone mode)
$msg = mb_strtolower($message, 'UTF-8');
$action = null;
$part = null;
$make = null;
$model = null;
$responseText = '';

// Check for vehicle make
$brands = ['toyota' => 'Toyota', 'تويوتا' => 'Toyota', 'nissan' => 'Nissan', 'نيسان' => 'Nissan', 'hyundai' => 'Hyundai', 'هيونداي' => 'Hyundai', 'kia' => 'Kia', 'كيا' => 'Kia', 'lexus' => 'Lexus', 'لكزس' => 'Lexus', 'ford' => 'Ford', 'فورد' => 'Ford', 'bmw' => 'BMW'];
foreach ($brands as $needle => $brandName) {
    if (str_contains($msg, $needle)) {
        $make = $brandName;
        break;
    }
}

if (str_contains($msg, 'بطار') || str_contains($msg, 'battery') || str_contains($msg, 'سلف') || str_contains($msg, 'starter') || str_contains($msg, 'دقة')) {
    $responseText = "بناءً على وصفك، المشكلة غالباً في ضعف بطارية السيارة أو تلف بادئ الحركة (السلف). نوفر لك خدمة ورشة متنقلة لعمل اشتراك وفحص البطارية، أو يمكنك طلب بطارية بديلة من التشليح.";
    $action = 'redirect_workshop';
    $part = 'Car Battery / Starter';
} elseif (str_contains($msg, 'سطحة') || str_contains($msg, 'سحب') || str_contains($msg, 'tow') || str_contains($msg, 'طريق') || str_contains($msg, 'حرارة') || str_contains($msg, 'قير خربان') || str_contains($msg, 'دخان')) {
    $responseText = "سلامتك أولاً! ننصح بعدم القيادة تجنباً لأي ضرر للمحرك. سأقوم بتحويلك لطلب سطحة فورية مزودة بتتبع مباشر لتوصيل سيارتك لأقرب ورشة متخصصة.";
    $action = 'redirect_towing';
} elseif (str_contains($msg, 'مكينة') || str_contains($msg, 'مكينه') || str_contains($msg, 'engine') || str_contains($msg, 'قير') || str_contains($msg, 'transmission') || str_contains($msg, 'باب') || str_contains($msg, 'صدام') || str_contains($msg, 'تشليح') || str_contains($msg, 'مستعمل')) {
    $responseText = "هذه القطعة متوفرة بكثرة في ساحات التشليح المعتمدة بأسعار منافسة وفحص ميكانيكي. سأقوم بتوجيهك لإرسال طلب فوري لكافة باعة التشليح المسجلين.";
    $action = 'redirect_tashleeh';
    $part = 'Engine / Mechanical Body Parts';
} elseif (str_contains($msg, 'فرامل') || str_contains($msg, 'فحمات') || str_contains($msg, 'brake') || str_contains($msg, 'هوبات')) {
    $responseText = "صوت الصفير أو الاهتزاز عند التوقف يدل على تآكل الفحمات أو الحاجة لخرط/تبديل الهوبات. تتوفر لدينا أطقم فحمات وهوبات سيراميك أصلية في المتجر.";
    $action = 'redirect_tashleeh';
    $part = 'Ceramic Brake Pads Kit';
} else {
    $responseText = "أهلاً بك! أنا المساعد الذكي لمنصة بارتو. أستطيع تشخيص أعطال سيارتك، توجيهك لأفضل قطع الغيار، وطلب سطحة أو ورشة متنقلة في ثوانٍ. ما هي المشكلة التي تواجهها بسيارتك؟";
}

echo json_encode([
    'success' => true,
    'response' => $responseText,
    'action' => $action,
    'part' => $part,
    'make' => $make,
    'model' => $model
]);
