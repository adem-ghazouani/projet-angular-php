<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

include_once "database.php";

function fail($msg, $code = 400) {
  http_response_code($code);
  echo json_encode(["success" => false, "message" => $msg]);
  exit;
}

try {
  // Champs envoyés par FormData (Angular)
  $user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
  $demande_id = isset($_POST['demande_id']) ? (int)$_POST['demande_id'] : 0;
  $titre = isset($_POST['titre']) ? trim($_POST['titre']) : '';
  $commentaire = isset($_POST['commentaire']) ? trim($_POST['commentaire']) : null;

  if ($user_id <= 0 || $demande_id <= 0 || $titre === '') {
    fail("Champs requis manquants (user_id, demande_id, titre)");
  }

  $fichier = null;
  // Fichier optionnel (nullable en base)
  if (isset($_FILES['fichier']) && $_FILES['fichier']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['fichier']['error'] !== UPLOAD_ERR_OK) {
      fail("Erreur upload fichier: " . $_FILES['fichier']['error']);
    }

    $originalName = $_FILES['fichier']['name'] ?? '';
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
      fail("Le fichier doit etre un PDF");
    }

    // Dossier upload (cree-le si besoin)
    $uploadDir = __DIR__ . "/uploads/rapports";
    if (!is_dir($uploadDir)) {
      @mkdir($uploadDir, 0777, true);
    }
    if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
      fail("Dossier upload introuvable ou non accessible: uploads/rapports", 500);
    }

    $safeName = "rapport_" . $user_id . "_" . time() . ".pdf";
    $destPath = $uploadDir . "/" . $safeName;

    if (!move_uploaded_file($_FILES['fichier']['tmp_name'], $destPath)) {
      fail("Impossible d'enregistrer le fichier", 500);
    }

    // Chemin relatif stocke en base
    $fichier = "uploads/rapports/" . $safeName;
  }
  if ($commentaire === '') $commentaire = null;

  $db = new Database();
  $conn = $db->connect();
  if (!$conn) {
    fail("Erreur de connexion à la base de données", 500);
  }

  $sql = "INSERT INTO rapports (user_id, demande_id, titre, fichier, commentaire, status)
          VALUES (:user_id, :demande_id, :titre, :fichier, :commentaire, 'submitted')";
  $stmt = $conn->prepare($sql);
  $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
  $stmt->bindParam(":demande_id", $demande_id, PDO::PARAM_INT);
  $stmt->bindParam(":titre", $titre);
  $stmt->bindParam(":fichier", $fichier);
  $stmt->bindParam(":commentaire", $commentaire);
  $stmt->execute();

  echo json_encode([
    "success" => true,
    "message" => "Rapport envoye",
    "fichier" => $fichier
  ]);
} catch (Exception $e) {
  fail($e->getMessage(), 500);
}