<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "database.php";

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || empty($data->id) || empty($data->status)) {
        throw new Exception("Champs requis manquants");
    }

    $allowed = ["accepted", "rejected", "pending"];
    if (!in_array($data->status, $allowed, true)) {
        throw new Exception("Status invalide");
    }

    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    $sql = "UPDATE demandes SET status = :status, enseignant_id = :enseignant_id WHERE id = :id";
    $stmt = $conn->prepare($sql);

    $enseignantId = isset($data->enseignant_id) && $data->enseignant_id !== "" ? $data->enseignant_id : null;

    $stmt->bindParam(":status", $data->status);
    $stmt->bindParam(":enseignant_id", $enseignantId, $enseignantId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindParam(":id", $data->id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Demande mise a jour"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>