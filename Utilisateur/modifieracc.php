<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "../database.php";

try {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !$data ||
        empty($data->id) ||
        empty($data->nom) ||
        empty($data->prenom) ||
        empty($data->email) ||
        empty($data->role) ||
        empty($data->status)
    ) {
        throw new Exception("Champs requis manquants");
    }

    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    $sql = "UPDATE users SET nom = :nom, prenom = :prenom, email = :email, role = :role, status = :status WHERE id = :id";
    $stmt = $conn->prepare($sql);

    $stmt->bindParam(":nom", $data->nom);
    $stmt->bindParam(":prenom", $data->prenom);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":role", $data->role);
    $stmt->bindParam(":status", $data->status);
    $stmt->bindParam(":id", $data->id, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Utilisateur modifie"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
