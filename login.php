<?php
session_start();

// Örnek kullanıcı adı ve şifre (gerçek uygulamalarda veritabanından kontrol edilir)
$valid_username = "admin";
$valid_password = "1234";

if ($_POST['username'] === $valid_username && $_POST['password'] === $valid_password) {
    $_SESSION['logged_in'] = true;
    header("Location: index.php"); // index.html değil, index.php olacak!
    exit;
} else {
    echo "Kullanıcı adı veya şifre yanlış. <a href='login.html'>Tekrar dene</a>";
}
?>
