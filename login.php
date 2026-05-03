<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (
    isset($data->email) && !empty($data->email) &&
    isset($data->mot_de_passe) && !empty($data->mot_de_passe)
) {
    try {
        $db = new Database();
        $conn = $db->connect();

        if (!$conn) {
            throw new Exception("Erreur de connexion à la base de données");
        }

        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if (!isset($user['status'])) {
                echo json_encode(["success" => false, "message" => "Statut du compte manquant."]);
                exit;
            }

            switch($user['status']) {
                case 'pending':
                    echo json_encode(["success" => false, "message" => "Votre compte est en attente de validation par l'admin."]);
                    exit;
                case 'rejected':
                    echo json_encode(["success" => false, "message" => "Votre compte a été refusé par l'admin."]);
                    exit;
                case 'approved':
                    // Statut correct, on continue.
                    break;
                default:
                    echo json_encode(["success" => false, "message" => "Compte non validé par l'admin."]);
                    exit;
            }

            if (isset($user['mot_de_passe']) && password_verify($data->mot_de_passe, $user['mot_de_passe'])) {
                // Générer un token simple (à améliorer pour production)
                $token = base64_encode($user['id'] . "|" . $user['role'] . "|" . time());

                echo json_encode([
                    "success" => true,
                    "message" => "Connexion réussie",
                    "user" => [
                        "id" => $user['id'],
                        "nom" => $user['nom'],
                        "prenom" => $user['prenom'],
                        "email" => $user['email'],
                        "role" => $user['role'],
                        "status" => $user['status']
                    ],
                    "token" => $token
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Mot de passe incorrect."]);
            }

        } else {
            echo json_encode(["success" => false, "message" => "Utilisateur introuvable."]);
        }

    } catch(Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Données manquantes."
    ]);
}
?>