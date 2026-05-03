<?php
header("Access-Control-Allow-Origin: *");

if (!isset($_GET["path"])) {
  http_response_code(400);
  echo "path manquant";
  exit;
}

$path = str_replace("\\", "/", trim((string)$_GET["path"])); // ex: uploads/rapports/rapport_1.pdf

// Securite: seulement uploads/rapports/ et aucun path traversal
if (strpos($path, "uploads/rapports/") !== 0 || strpos($path, "..") !== false) {
  http_response_code(403);
  echo "Acces interdit";
  exit;
}

$baseDir = realpath(__DIR__ . "/uploads/rapports");
if ($baseDir === false) {
  http_response_code(500);
  echo "Dossier rapports introuvable";
  exit;
}

$target = realpath(__DIR__ . "/" . $path);
if ($target === false || strpos($target, $baseDir) !== 0 || !is_file($target)) {
  http_response_code(404);
  echo "Fichier introuvable";
  exit;
}

header("Content-Type: application/pdf");
header("Content-Disposition: attachment; filename=\"" . basename($target) . "\"");
header("Content-Length: " . filesize($target));
readfile($target);
exit;
?>