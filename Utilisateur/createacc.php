<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "../database.php";

$data = json_decode(file_get_contents("php://input"));

if (
    isset($data->nom) && !empty($data->nom) &&
    isset($data->prenom) && !empty($data->prenom) &&
    isset($data->email) && !empty($data->email) &&
    isset($data->password) && !empty($data->password) &&
    isset($data->role) && !empty($data->role)
) {
    try {
        $db = new Database();
        $conn = $db->connect();

        if (!$conn) {
            throw new Exception("Erreur de connexion à la base de données");
        }

        // Vérifier si un utilisateur avec le même email existe déjà
        $check_sql = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();

        if ($check_stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode([
                "success" => false,
                "message" => "Un utilisateur avec cet email existe déjà."
            ]);
            exit;
        }

        // Hachage du mot de passe
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

        // Par défaut, le status est "pending" lors de la création de compte
        $status = "pending";

        // Insérer l'utilisateur
        $insert_sql = "INSERT INTO users (nom, prenom, email, mot_de_passe, role, status) VALUES (:nom, :prenom, :email, :mot_de_passe, :role, :status)";
        $insert_stmt = $conn->prepare($insert_sql);

        $insert_stmt->bindParam(':nom', $data->nom);
        $insert_stmt->bindParam(':prenom', $data->prenom);
        $insert_stmt->bindParam(':email', $data->email);
        $insert_stmt->bindParam(':mot_de_passe', $hashed_password);
        $insert_stmt->bindParam(':role', $data->role);
        $insert_stmt->bindParam(':status', $status);

        if ($insert_stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Utilisateur ajouté. En attente de validation par l'admin."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de l'ajout de l'utilisateur."
            ]);
        }

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Données manquantes"
    ]);
}
?>
