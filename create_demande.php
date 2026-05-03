<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "database.php";

try {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !$data ||
        empty($data->user_id) ||
        empty($data->titre_stage) ||
        empty($data->entreprise)
    ) {
        throw new Exception("Champs requis manquants");
    }

    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    $sql = "INSERT INTO demandes (user_id, titre_stage, entreprise, duree, description, status)
            VALUES (:user_id, :titre_stage, :entreprise, :duree, :description, 'pending')";
    $stmt = $conn->prepare($sql);

    $stmt->bindParam(":user_id", $data->user_id, PDO::PARAM_INT);
    $stmt->bindParam(":titre_stage", $data->titre_stage);
    $stmt->bindParam(":entreprise", $data->entreprise);
    $duree = isset($data->duree) && $data->duree !== "" ? $data->duree : null;
    $description = isset($data->description) && $data->description !== "" ? $data->description : null;

    $stmt->bindParam(":duree", $duree);
    $stmt->bindParam(":description", $description);

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Demande envoyee"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>