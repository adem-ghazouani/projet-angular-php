<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && !empty($data->id)) {
    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        echo json_encode(["success" => false, "message" => "Erreur de connexion à la base de données"]);
        exit;
    }

    $sql = "UPDATE users SET status = :status WHERE id = :id";
    $stmt = $conn->prepare($sql);

    $status = "approved";
    $stmt->bindParam(":status", $status);
    $stmt->bindParam(":id", $data->id, PDO::PARAM_INT);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Compte approuvé"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'approbation du compte"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID manquant"]);
}
?>