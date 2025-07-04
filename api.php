<?php
// === KONFIGURASI DATABASE ===
define('DB_HOST', '-');
define('DB_USER', '-');
define('DB_PASS', '-');
define('DB_NAME', '-');

// === CORS ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// === KONEKSI DATABASE ===
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
} else {
    // Tambahkan baris ini untuk uji koneksi
    if (isset($_GET['testdb'])) {
        echo "Koneksi database berhasil!";
        exit;
    }
}
// === HELPER ===
function jsonOut($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
function getSegments() {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = str_replace('/api.php', '', $path);
    $segments = array_values(array_filter(explode('/', $path)));
    return $segments;
}
function getInput() {
    if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true);
    }
    return $_POST;
}
function getImageWebp($fileTmp) {
    if (!extension_loaded('imagick')) return null;
    $im = new Imagick();
    $im->readImage($fileTmp);
    $im->setImageFormat('webp');
    $webp = $im->getImagesBlob();
    $im->clear();
    $im->destroy();
    return $webp;
}
function getImageFromDb($bin) {
    header('Content-Type: image/webp');
    echo $bin;
    exit;
}
function getBaseUrl() {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    return $scheme . '://' . $_SERVER['HTTP_HOST'];
}

// === ROUTING ===
$segments = getSegments();
$method = $_SERVER['REQUEST_METHOD'];
$allowedTypes = ['onpro', 'teact', 'project'];

if (count($segments) === 0) jsonOut(['error' => 'No endpoint specified'], 404);
$type = $segments[0];
if (!in_array($type, $allowedTypes)) jsonOut(['error' => 'Invalid type specified'], 400);

// === /api/project/menu/{menu} ===
if ($type === 'project' && isset($segments[1]) && $segments[1] === 'menu' && isset($segments[2])) {
    $menu = $conn->real_escape_string($segments[2]);
    $sql = "SELECT id, title, menu, description FROM project WHERE menu = '$menu'";
    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $row['image_url'] = getBaseUrl().'/api.php/'.$type.'/'.$row['id'];
        $rows[] = $row;
    }
    if (empty($rows)) jsonOut(['error' => 'No projects found for the specified menu'], 404);
    jsonOut($rows);
}

// === /api/{type}/{id}/detail ===
if (isset($segments[1]) && is_numeric($segments[1]) && isset($segments[2]) && $segments[2] === 'detail') {
    $id = intval($segments[1]);
    $columns = $type === 'project' ? 'id, title, menu, description' : 'id, title, description';
    $sql = "SELECT $columns FROM $type WHERE id = $id";
    $result = $conn->query($sql);
    if ($row = $result->fetch_assoc()) {
        $row['image_url'] = getBaseUrl().'/api.php/'.$type.'/'.$row['id'];
        jsonOut($row);
    } else {
        jsonOut(['error' => 'Data not found'], 404);
    }
}

// === /api/{type}/{id} ===
if (isset($segments[1]) && is_numeric($segments[1])) {
    $id = intval($segments[1]);
    if ($method === 'GET') {
        $sql = "SELECT image FROM $type WHERE id = $id";
        $result = $conn->query($sql);
        if ($row = $result->fetch_assoc()) {
            getImageFromDb($row['image']);
        } else {
            jsonOut(['error' => 'Image not found'], 404);
        }
    }
    elseif ($method === 'PUT') {
        // PUT update data (tanpa gambar)
        parse_str(file_get_contents("php://input"), $put_vars);
        $title = $put_vars['title'] ?? null;
        $description = $put_vars['description'] ?? null;
        $menu = $put_vars['menu'] ?? null;
        $fields = [];
        if ($type === 'project' && $menu) $fields[] = "menu='". $conn->real_escape_string($menu) ."'";
        if ($title) $fields[] = "title='". $conn->real_escape_string($title) ."'";
        if ($description) $fields[] = "description='". $conn->real_escape_string($description) ."'";
        if (empty($fields)) jsonOut(['error' => 'No fields to update'], 400);
        $sql = "UPDATE $type SET ".implode(',', $fields)." WHERE id = $id";
        $conn->query($sql);
        if ($conn->affected_rows > 0) {
            jsonOut([
                'message' => 'Data updated successfully',
                'image_url' => getBaseUrl().'/api.php/'.$type.'/'.$id,
                'format' => 'webp'
            ]);
        } else {
            jsonOut(['error' => 'Data not found or nothing changed'], 404);
        }
    }
    elseif ($method === 'DELETE') {
        $sql = "DELETE FROM $type WHERE id = $id";
        $conn->query($sql);
        if ($conn->affected_rows > 0) {
            jsonOut(['message' => 'Data deleted successfully']);
        } else {
            jsonOut(['error' => 'Data not found'], 404);
        }
    }
}

// === /api/{type} ===
if (count($segments) === 1) {
    if ($method === 'GET') {
        $columns = $type === 'project' ? 'id, title, menu, description' : 'id, title, description';
        $sql = "SELECT $columns FROM $type";
        $result = $conn->query($sql);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['image_url'] = getBaseUrl().'/api.php/'.$type.'/'.$row['id'];
            $rows[] = $row;
        }
        jsonOut($rows);
    }
    elseif ($method === 'POST') {
        // POST create data (dengan gambar)
        $title = $_POST['title'] ?? null;
        $description = $_POST['description'] ?? null;
        $menu = $_POST['menu'] ?? null;
        if ($type === 'project' && !$menu) jsonOut(['error' => 'Menu is required for project'], 400);
        if (!$title || !$description || !isset($_FILES['image'])) jsonOut(['error' => 'Title, description, and image are required'], 400);

        // Convert image to webp
        $webp = getImageWebp($_FILES['image']['tmp_name']);
        if (!$webp) jsonOut(['error' => 'Image conversion to webp failed or imagick not enabled'], 500);

        if ($type === 'project') {
            $stmt = $conn->prepare("INSERT INTO project (menu, title, description, image) VALUES (?, ?, ?, ?)");
            $stmt->bind_param('ssss', $menu, $title, $description, $webp);
        } else {
            $stmt = $conn->prepare("INSERT INTO $type (title, description, image) VALUES (?, ?, ?)");
            $stmt->bind_param('sss', $title, $description, $webp);
        }
        $stmt->send_long_data($type === 'project' ? 3 : 2, $webp);
        $stmt->execute();
        $id = $stmt->insert_id;
        $stmt->close();
        jsonOut([
            'message' => 'Data created successfully',
            'id' => $id,
            'image_url' => getBaseUrl().'/api.php/'.$type.'/'.$id,
            'format' => 'webp'
        ], 201);
    }
}

jsonOut(['error' => 'Endpoint not found'], 404);
?>
