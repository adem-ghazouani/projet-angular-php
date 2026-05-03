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

    $sql = "SELECT e.*,
                   r.titre AS rapport_titre,
                   r.user_id AS etudiant_id,
                   u.nom AS enseignant_nom
            FROM evaluations e
            JOIN rapports r ON e.rapport_id = r.id
            JOIN users u ON e.enseignant_id = u.id
            WHERE 1=1";
    $params = [];

    // filtre étudiant via rapport.user_id
    if (isset($_GET["user_id"]) && $_GET["user_id"] !== "") {
        $sql .= " AND r.user_id = :user_id";
        $params[":user_id"] = (int)$_GET["user_id"];
    }

    if (isset($_GET["rapport_id"]) && $_GET["rapport_id"] !== "") {
        $sql .= " AND e.rapport_id = :rapport_id";
        $params[":rapport_id"] = (int)$_GET["rapport_id"];
    }

    $sql .= " ORDER BY e.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $evaluations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "evaluations" => $evaluations
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>