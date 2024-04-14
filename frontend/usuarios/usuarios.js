// Para el registro
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const usuario = {
        nombre: document.getElementById('nombre').value,
        correoElectronico: document.getElementById('correoElectronico').value,
        contrasena: document.getElementById('contrasena').value,
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

// Para el acceso (login)
document.getElementById('loginForm').addEventListener('submit', function(event) {
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
    .then(response => response.json())
    .then(data => {
        alert('Usuario ha iniciado sesión con éxito');
        // Aquí deberías redirigir al usuario o guardar el estado de la sesión
    })
    .catch(error => {
        alert('Error al iniciar sesión');
        console.error(error);
    });
});
