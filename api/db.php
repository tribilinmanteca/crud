<?php
$host   = 'localhost';
$dbname = 'instituto_tecnico';
$user   = 'root';
$pass   = '';          // En XAMPP por defecto no hay contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Conexión fallida: ' . $e->getMessage()]);
    exit;
}
?>