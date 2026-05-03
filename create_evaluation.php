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
        empty($data->rapport_id) ||
        empty($data->enseignant_id)
    ) {
        throw new Exception("Champs requis manquants");
    }

    $db = new Database();
    $conn = $db->connect();

    if (!$conn) {
        throw new Exception("Erreur de connexion a la base de donnees");
    }

    $sql = "INSERT INTO evaluations (rapport_id, enseignant_id, note, remarque, status)
            VALUES (:rapport_id, :enseignant_id, :note, :remarque, 'done')";
    $stmt = $conn->prepare($sql);

    $note = isset($data->note) && $data->note !== "" ? $data->note : null;
    $remarque = isset($data->remarque) && $data->remarque !== "" ? $data->remarque : null;

    $stmt->bindParam(":rapport_id", $data->rapport_id, PDO::PARAM_INT);
    $stmt->bindParam(":enseignant_id", $data->enseignant_id, PDO::PARAM_INT);
    $stmt->bindParam(":note", $note);
    $stmt->bindParam(":remarque", $remarque);

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Evaluation enregistree"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>