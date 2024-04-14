function cerrarSesion() {
    // Cambia la ubicación del navegador a la página de inicio de sesión
    window.location.href = "./usuarios/login.html";
}
  
document.getElementById("logout").addEventListener("click", cerrarSesion);