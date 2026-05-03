<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "database.php";

try {
    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    $sql = "SELECT d.*,
                   u.nom AS etudiant_nom,
                   u.prenom AS etudiant_prenom,
                   u.email AS etudiant_email
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE 1=1";
    $params = [];

    if (isset($_GET["user_id"]) && $_GET["user_id"] !== "") {
        $sql .= " AND d.user_id = :user_id";
        $params[":user_id"] = (int)$_GET["user_id"];
    }

    if (isset($_GET["status"]) && $_GET["status"] !== "") {
        $sql .= " AND d.status = :status";
        $params[":status"] = $_GET["status"];
    }

    $sql .= " ORDER BY d.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $demandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "demandes" => $demandes
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>