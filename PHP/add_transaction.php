<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['type']) || !isset($data['amount']) || !isset($data['category']) || !isset($data['date'])) {
    die(json_encode(['error' => 'Missing required fields']));
}

// Sanitize input
$type = $conn->real_escape_string($data['type']);
$amount = floatval($data['amount']);
$category = $conn->real_escape_string($data['category']);
$date = $conn->real_escape_string($data['date']);
$description = isset($data['description']) ? $conn->real_escape_string($data['description']) : '';
$user_id = isset($data['user_id']) ? intval($data['user_id']) : null;

// Prepare and execute SQL statement
$sql = "INSERT INTO transactions (type, amount, category, date, description, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sdsssi", $type, $amount, $category, $date, $description, $user_id);

if ($stmt->execute()) {
    $response = [
        'success' => true,
        'message' => 'Transaction added successfully',
        'transaction_id' => $conn->insert_id
    ];
} else {
    $response = [
        'success' => false,
        'error' => 'Error adding transaction: ' . $stmt->error
    ];
}

// Close statement and connection
$stmt->close();
$conn->close();

// Send response
echo json_encode($response);
?>
