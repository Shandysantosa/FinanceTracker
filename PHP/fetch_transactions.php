<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'finance_tracker';

// Create database connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Get query parameters
$type = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : null;
$category = isset($_GET['category']) ? $conn->real_escape_string($_GET['category']) : null;
$start_date = isset($_GET['start_date']) ? $conn->real_escape_string($_GET['start_date']) : null;
$end_date = isset($_GET['end_date']) ? $conn->real_escape_string($_GET['end_date']) : null;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

// Build SQL query
$sql = "SELECT * FROM transactions WHERE 1=1";
$params = [];
$types = "";

if ($type) {
    $sql .= " AND type = ?";
    $params[] = $type;
    $types .= "s";
}

if ($category) {
    $sql .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($start_date) {
    $sql .= " AND date >= ?";
    $params[] = $start_date;
    $types .= "s";
}

if ($end_date) {
    $sql .= " AND date <= ?";
    $params[] = $end_date;
    $types .= "s";
}

if ($user_id) {
    $sql .= " AND user_id = ?";
    $params[] = $user_id;
    $types .= "i";
}

$sql .= " ORDER BY date DESC";

// Prepare and execute SQL statement
$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// Fetch all transactions
$transactions = [];
while ($row = $result->fetch_assoc()) {
    $transactions[] = [
        'id' => $row['id'],
        'type' => $row['type'],
        'amount' => floatval($row['amount']),
        'category' => $row['category'],
        'date' => $row['date'],
        'description' => $row['description'],
        'user_id' => $row['user_id']
    ];
}

// Close statement and connection
$stmt->close();
$conn->close();

// Send response
echo json_encode([
    'success' => true,
    'transactions' => $transactions
]);
?>
