<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

try {
    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    $sql = "SELECT id, nom, prenom, email, role, status, created_at FROM users WHERE status = :status";
    $stmt = $conn->prepare($sql);
    $status = "pending";
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);

    $stmt->execute();

    $comptes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "comptes_en_attente" => $comptes
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>