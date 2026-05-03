<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "../database.php";

try {
    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    // On exclut les utilisateurs dont le rôle est 'admin'
    $sql = "SELECT id, nom, prenom, email, role, status, created_at FROM users WHERE role != 'admin'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
