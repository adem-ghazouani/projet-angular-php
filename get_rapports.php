<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include_once "database.php";

try {
    $db = new Database();
    $conn = $db->connect();
    if (!$conn) throw new Exception("Erreur de connexion a la base de donnees");

    $baseUrl = "http://localhost/projet_php/";

    $sql = "SELECT r.*, u.nom AS etudiant_nom, u.prenom AS etudiant_prenom
            FROM rapports r
            JOIN users u ON r.user_id = u.id
            WHERE 1=1";
    $params = [];

    if (isset($_GET["user_id"]) && $_GET["user_id"] !== "") {
        $sql .= " AND r.user_id = :user_id";
        $params[":user_id"] = (int)$_GET["user_id"];
    }

    if (isset($_GET["demande_id"]) && $_GET["demande_id"] !== "") {
        $sql .= " AND r.demande_id = :demande_id";
        $params[":demande_id"] = (int)$_GET["demande_id"];
    }

    if (isset($_GET["status"]) && $_GET["status"] !== "") {
        $sql .= " AND r.status = :status";
        $params[":status"] = $_GET["status"];
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rapports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rapports as &$r) {
        $r["fichier_url"] = (!empty($r["fichier"])) ? ($baseUrl . $r["fichier"]) : null;
    }

    echo json_encode(["success" => true, "rapports" => $rapports]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>