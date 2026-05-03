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
  $data = json_decode(file_get_contents("php://input"));

  if (!$data || empty($data->id) || empty($data->status)) {
    fail("Champs requis manquants (id, status)");
  }

  $id = (int)$data->id;
  $status = trim((string)$data->status);
  $commentaire = isset($data->commentaire) ? trim((string)$data->commentaire) : null;

  $allowed = ["submitted", "reviewing", "validated", "refused"];
  if (!in_array($status, $allowed, true)) {
    fail("Statut invalide. Valeurs: " . implode(", ", $allowed));
  }

  if ($commentaire === "") {
    $commentaire = null;
  }

  $db = new Database();
  $conn = $db->connect();
  if (!$conn) {
    fail("Erreur de connexion à la base de données", 500);
  }

  // Vérifier existence
  $check = $conn->prepare("SELECT id FROM rapports WHERE id = :id");
  $check->bindParam(":id", $id, PDO::PARAM_INT);
  $check->execute();
  if (!$check->fetch(PDO::FETCH_ASSOC)) {
    fail("Rapport introuvable", 404);
  }

  // Update status (+ commentaire si envoyé)
  if ($commentaire !== null) {
    $sql = "UPDATE rapports SET status = :status, commentaire = :commentaire WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":commentaire", $commentaire);
  } else {
    $sql = "UPDATE rapports SET status = :status WHERE id = :id";
    $stmt = $conn->prepare($sql);
  }

  $stmt->bindParam(":status", $status);
  $stmt->bindParam(":id", $id, PDO::PARAM_INT);
  $stmt->execute();

  echo json_encode([
    "success" => true,
    "message" => "Statut du rapport mis à jour",
    "id" => $id,
    "status" => $status
  ]);
} catch (Exception $e) {
  fail($e->getMessage(), 500);
}