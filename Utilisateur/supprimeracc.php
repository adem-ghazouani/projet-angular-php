<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "../database.php";

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || empty($data->id)) {
        throw new Exception("ID manquant");
    }

    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    // Suppression logique : on met à jour le champ deleted_at au lieu de supprimer
    $sql = "UPDATE users SET deleted_at = NOW() WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":id", $data->id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Utilisateur supprimé (suppression logique)"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
