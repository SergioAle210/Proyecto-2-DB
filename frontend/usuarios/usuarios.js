document.addEventListener('DOMContentLoaded', function() {
    // Para el registro
    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usuario = {
                nombre: document.getElementById('nombre').value,
                correoElectronico: document.getElementById('correoElectronico').value,
                contrasena: document.getElementById('contrasena').value,
                rol: document.getElementById('rol').value,
            };
            
            fetch('http://localhost:3000/api/usuarios/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usuario),
            })
            .then(response => response.json())
            .then(data => {
                alert('Usuario registrado con éxito');
                window.location.href = 'login.html';
            })
            .catch(error => {
                alert('Error al registrar usuario');
                console.error(error);
            });
        });
    }

    // Para el acceso (login)
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usuario = {
                correoElectronico: document.getElementById('loginCorreoElectronico').value,
                contrasena: document.getElementById('loginContrasena').value,
            };
            
            fetch('http://localhost:3000/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usuario),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Asumiendo que el servidor responde con un código de estado de 200 para un inicio de sesión exitoso
                if (response.status === 200) {
                    return response.text();  // o `response.json()` si el servidor responde con un JSON
                } else {
                    throw new Error('Error al iniciar sesión');
                }
            })
            .then(text => {
                // Si el servidor responde con un texto plano
                alert(text);
                // Redirigir al dashboard
                window.location.href = 'http://localhost:5500/frontend/index.html';
            })
            .catch(error => {
                alert('Error al iniciar sesión');
                console.error(error);
            });
        });
    }
});