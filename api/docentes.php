<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// GET → listar todos
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM docentes ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
}

// POST → crear
elseif ($method === 'POST') {
    $sql = "INSERT INTO docentes 
            (tipoDoc,numDoc,nombre,apellido,fechaNac,nivel,area,asignatura,grado,eps,salario)
            VALUES (:tipoDoc,:numDoc,:nombre,:apellido,:fechaNac,:nivel,:area,:asignatura,:grado,:eps,:salario)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($body);
    echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Docente creado']);
}

// PUT → actualizar
elseif ($method === 'PUT') {
    $sql = "UPDATE docentes SET 
            tipoDoc=:tipoDoc, numDoc=:numDoc, nombre=:nombre, apellido=:apellido,
            fechaNac=:fechaNac, nivel=:nivel, area=:area, asignatura=:asignatura,
            grado=:grado, eps=:eps, salario=:salario
            WHERE id=:id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($body);
    echo json_encode(['message' => 'Docente actualizado']);
}

// DELETE → eliminar
elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    $pdo->prepare("DELETE FROM docentes WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Docente eliminado']);
}
?>