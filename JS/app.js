class PerfilUsuario {
  constructor(nombre, mail, telefono, contraseña, confirmarcontraseña) {
    this.nombre = nombre;
    this.mail = mail;
    this.telefono = telefono;
    this.contraseña = contraseña;
    this.confirmarcontraseña = confirmarcontraseña;
  }
}

// Registro
const registroForm = document.getElementById("registroForm");

registroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const mail = document.getElementById("mail").value;
  const telefono = document.getElementById("telefono").value;
  const contraseña = document.getElementById("contraseña").value;
  const confirmar = document.getElementById("confirmarContraseña").value;

  if (contraseña !== confirmar) {
    Swal.fire("Error", "Las contraseñas no coinciden", "error");
    return;
  }

  const nuevoUsuario = new PerfilUsuario(nombre, mail, telefono, contraseña, confirmar);
  localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
  Swal.fire("¡Registro exitoso!", "Bienvenide a Dulce Alaska", "success");
});

// Carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const divCarrito = document.getElementById("carrito");

fetch("./DATA/productos.json")
  .then((res) => res.json())
  .then((productos) => {
    const contenedor = document.getElementById("catalogo");

    productos.forEach((producto) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio}</p>
        <button onclick="agregarAlCarrito(${producto.id})">Agregar</button>
      `;
      contenedor.appendChild(card);
    });

    window.agregarAlCarrito = function (id) {
      const seleccionado = productos.find((p) => p.id === id);
      carrito.push(seleccionado);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarCarrito();
      Swal.fire("Agregado", `${seleccionado.nombre} fue agregado al carrito`, "success");
    };

    mostrarCarrito();
  });

function mostrarCarrito() {
  divCarrito.innerHTML = "";
  carrito.forEach((producto, index) => {
    divCarrito.innerHTML += `
      <p>${producto.nombre} - $${producto.precio}
      <button onclick="eliminarProducto(${index})">Eliminar</button></p>`;
  });
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
}