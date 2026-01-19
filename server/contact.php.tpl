<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

// هذه القيم سيتم استبدالها تلقائياً بواسطة سكريبت deploy.sh أثناء الرفع
$TURNSTILE_SECRET_KEY = '{{TURNSTILE_SECRET_KEY}}';
$SMTP_USER = '{{SMTP_USER}}';
$EMAIL_TO  = '{{EMAIL_TO}}';

$token = $_POST['cf-turnstile-response'] ?? '';
$name  = strip_tags($_POST['name'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$msg   = strip_tags($_POST['message'] ?? '');

// 1. التحقق من Turnstile
$ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'secret' => $TURNSTILE_SECRET_KEY,
    'response' => $token,
]);
$response = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!$response['success']) {
    http_response_code(403);
    echo json_encode(['error' => 'Security check failed.']);
    exit;
}

// 2. إرسال البريد (عبر دالة mail المجهزة في cPanel للعمل مع SMTP المحلي)
$subject = "New Contact from halghamdi.com: $name";
$headers = "From: $SMTP_USER\r\n" .
           "Reply-To: $email\r\n" .
           "X-Mailer: PHP/" . phpversion();
$body = "Name: $name\nEmail: $email\n\nMessage:\n$msg";

if (mail($EMAIL_TO, $subject, $body, $headers)) {
    echo json_encode(['success' => 'Message sent successfully!']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Mail server error.']);
}