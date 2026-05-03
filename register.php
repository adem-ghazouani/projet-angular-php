<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (
    isset($data->nom) &&
    isset($data->prenom) &&
    isset($data->email) &&
    isset($data->mot_de_passe) &&
    isset($data->role) &&
    !empty($data->nom) &&
    !empty($data->prenom) &&
    !empty($data->email) &&
    !empty($data->mot_de_passe) &&
    !empty($data->role)
) {
    $roles_valides = ['etudiant', 'enseignant', 'admin'];
    if (!in_array($data->role, $roles_valides)) {
        echo json_encode(["success" => false, "message" => "Rôle invalide"]);
        exit;
    }

    $db = new Database();
    $conn = $db->connect();

    $verifQuery = "SELECT id FROM users WHERE email = :email";
    $verifStmt = $conn->prepare($verifQuery);
    $verifStmt->bindParam(":email", $data->email);
    $verifStmt->execute();

    if ($verifStmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Cet email existe déjà"]);
        exit;
    }

    // Hash du mot de passe
    $password = password_hash($data->mot_de_passe, PASSWORD_BCRYPT);

    // Insertion dans la table users
    $query = "INSERT INTO users (nom, prenom, email, mot_de_passe, role)
              VALUES (:nom, :prenom, :email, :mot_de_passe, :role)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":nom", $data->nom);
    $stmt->bindParam(":prenom", $data->prenom);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":mot_de_passe", $password);
    $stmt->bindParam(":role", $data->role);

    if ($stmt->execute()) {
        $user_id = $conn->lastInsertId();

        // Ajout du user_id dans la table spécifique
        if ($data->role == "etudiant") {
            $subStmt = $conn->prepare("INSERT INTO etudiants (user_id, role_etudiant) VALUES (:user_id, 'stagiaire')");
            $subStmt->bindParam(":user_id", $user_id);
            $subStmt->execute();
        } elseif ($data->role == "enseignant") {
            $subStmt = $conn->prepare("INSERT INTO enseignants (user_id, role_enseignant) VALUES (:user_id, 'encadrant')");
            $subStmt->bindParam(":user_id", $user_id);
            $subStmt->execute();
        } elseif ($data->role == "admin") {
            $subStmt = $conn->prepare("INSERT INTO administrateurs (user_id, role_admin) VALUES (:user_id, 'admin')");
            $subStmt->bindParam(":user_id", $user_id);
            $subStmt->execute();
        }

        echo json_encode(["success" => true, "message" => "Inscription réussie"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'inscription"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Données incomplètes"]);
}?>
