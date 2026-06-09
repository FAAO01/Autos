let cars = JSON.parse(localStorage.getItem("cars")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let currentRole = "";
let isLoggedIn = false;

// Credenciales de acceso
const USUARIOS = {
  "admin": "admin123",
  "vendedor": "vend123"
};

/* --- LOGIN --- */
function mostrarLogin() {
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('loginError').style.display = 'none';
}

function cerrarLogin() {
  document.getElementById('loginModal').classList.remove('active');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('role').value = '';
  document.getElementById('loginError').style.display = 'none';
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const errorDiv = document.getElementById('loginError');

  // Validaciones
  if (!username || !password || !role) {
    errorDiv.innerText = '⚠️ Por favor completa todos los campos';
    errorDiv.style.display = 'block';
    return;
  }

  // Verificar credenciales
  if (username !== role || USUARIOS[role] !== password) {
    errorDiv.innerText = '❌ Usuario o contraseña incorrectos';
    errorDiv.style.display = 'block';
    return;
  }

  // Login exitoso
  cerrarLogin();
  isLoggedIn = true;
  currentRole = role;
  document.getElementById('welcome').innerText = `🎉 Bienvenido ${username} (${role === 'admin' ? 'Administrador' : 'Vendedor'})`;
  document.getElementById('welcome').style.display = "block";

  // Cambiar botones de header
  document.getElementById('loginBtn').style.display = "none";
  document.getElementById('logoutBtn').style.display = "flex";

  if (currentRole === "admin") {
    const btn = document.getElementById('actionBtn');
    btn.innerText = "➕ Agregar Auto";
    btn.style.display = "flex";
    document.getElementById('salesHistorySection').style.display = "block";
    mostrarVentas();
  }

  if (currentRole === "vendedor") {
    const btn = document.getElementById('actionBtn');
    btn.innerText = "📊 Registrar Venta";
    btn.style.display = "flex";
    document.getElementById('salesHistorySection').style.display = "block";
    mostrarVentas();
  }

  renderCars();
}

/* --- LOGOUT --- */
function logout() {
  isLoggedIn = false;
  currentRole = "";

  // Ocultar elementos de login
  document.getElementById('welcome').style.display = "none";
  document.getElementById('actionBtn').style.display = "none";
  document.getElementById('salesHistorySection').style.display = "none";
  document.getElementById('carForm').reset();
  document.getElementById('salesForm').reset();

  // Ocultar modales
  document.getElementById('salesFormModal').classList.remove('active');
  document.getElementById('carFormModal').classList.remove('active');

  // Cambiar botones de header
  document.getElementById('loginBtn').style.display = "flex";
  document.getElementById('logoutBtn').style.display = "none";

  // Limpiar campos de login y búsqueda
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('role').value = '';
  document.getElementById('loginError').style.display = 'none';
  
  // Limpiar el buscador del historial si existiera texto guardado
  const salesSearch = document.getElementById('salesSearchInput');
  if (salesSearch) salesSearch.value = '';

  // Mostrar autos (vista cliente)
  renderCars();
}

/* --- Mostrar formulario y hacer scroll --- */
function mostrarFormulario() {
  document.getElementById('carFormModal').classList.add('active');
}

/* --- Manejar acción según rol --- */
function manejarAccion() {
  if (currentRole === "admin") {
    mostrarFormulario();
  } else if (currentRole === "vendedor") {
    mostrarFormularioVentas();
  }
}

/* --- Inicializar página sin login --- */
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('systemSection').style.display = "block";
  document.getElementById('welcome').style.display = "none";
  document.getElementById('actionBtn').style.display = "none";
  renderCars();
});

/* --- FORMULARIO DE AUTOS --- */
const carForm = document.getElementById('carForm');
const carCards = document.getElementById('carCards');

if (carForm) {
  carForm.addEventListener('submit', e => {
    e.preventDefault();
    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const anio = document.getElementById('anio').value;
    const precio = document.getElementById('precio').value;
    const imagen = document.getElementById('imagen').value;
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value;
    const descuento = categoria === 'descuento' ? parseFloat(document.getElementById('descuento').value) || 0 : 0;

    const car = { marca, modelo, anio, precio, imagen, categoria, descripcion, descuento };
    cars.push(car);
    guardarAutos();
    renderCars();
    carForm.reset();
    document.getElementById('descuentoContainer').style.display = 'none';
    cerrarFormulario();
  });
}

/* --- Mostrar/Ocultar campo descuento --- */
function mostrarCampoDescuento() {
  const categoria = document.getElementById('categoria').value;
  const container = document.getElementById('descuentoContainer');
  if (categoria === 'descuento') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
    document.getElementById('descuento').value = '';
  }
}

function cerrarFormulario() {
  document.getElementById('carFormModal').classList.remove('active');
  if (carForm) {
    carForm.reset();
  }
}

/* --- RENDERIZAR TARJETAS (CON MENSAJE DE PRÓXIMAMENTE) --- */
function renderCars(filteredCars = cars) {
  carCards.innerHTML = '';

  // VALIDACIÓN: Si no hay autos disponibles en el filtro o búsqueda actual
  if (filteredCars.length === 0) {
    carCards.innerHTML = `
      <div class="car-card coming-soon-card" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fff; border-radius: var(--border-radius); border: 2px dashed #1a73e8; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="font-size: 50px; margin-bottom: 15px;">🚗✨</div>
        <h3 style="color: var(--primary); font-size: 22px; margin-bottom: 8px;">Vehículos Próximamente</h3>
        <p style="color: #5f6368; font-size: 15px; max-width: 450px; margin: 0 auto;">
          Estamos actualizando nuestro inventario para ofrecerte las mejores opciones. Muy pronto encontrarás nuevos vehículos disponibles en esta sección.
        </p>
      </div>
    `;
    return;
  }

  // Renderizado normal de las tarjetas si existen elementos
  filteredCars.forEach((car, index) => {
    let acciones = "";
    if (currentRole === "admin") {
      // Buscar índice real en el localStorage para evitar desfases al borrar/editar estando filtrado
      const realIndex = cars.findIndex(c => c === car);
      acciones = `
        <span class="edit" onclick="editCar(${realIndex})"> Editar</span>
        <span class="delete" onclick="deleteCar(${realIndex})"> Eliminar</span>
      `;
    }
    
    let precioHTML = '';
    if (car.categoria === 'descuento' && car.descuento > 0) {
      const precioOriginal = parseFloat(car.precio);
      const precioFinal = precioOriginal - (precioOriginal * car.descuento / 100);
      precioHTML = `
        <div class="discount-badge">-${car.descuento}% Descuento</div>
        <p class="price-original">Antes: $${precioOriginal.toLocaleString()}</p>
        <p class="price-discounted">Ahora: $${precioFinal.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
      `;
    } else {
      precioHTML = `<p class="price-tag"> $${Number(car.precio).toLocaleString()}</p>`;
    }

    carCards.innerHTML += `
      <div class="car-card">
        <img src="${car.imagen}" alt="${car.marca} ${car.modelo}">
        <div>
          <div class="category-badge">${getCategoryEmoji(car.categoria)} ${getCategoryName(car.categoria)}</div>
          <h3>${car.marca} ${car.modelo}</h3>
          <p><strong> Año:</strong> ${car.anio}</p>
          ${precioHTML}
          <p>${car.descripcion}</p>
          <div class="actions">${acciones}</div>
        </div>
      </div>
    `;
  });
}

function getCategoryEmoji(categoria) {
  const emojis = {
    'nuevos': '✨',
    'semi': '🔄',
    'descuento': '💰',
    'subasta': '🔨'
  };
  return emojis[categoria] || '🚗';
}

function getCategoryName(categoria) {
  const nombres = {
    'nuevos': 'Nuevo',
    'semi': 'Semi nuevo',
    'descuento': 'Descuento',
    'subasta': 'Subasta'
  };
  return nombres[categoria] || categoria;
}

/* --- CRUD AUTOS --- */
function deleteCar(index) {
  cars.splice(index, 1);
  guardarAutos();
  renderCars();
}

function editCar(index) {
  const car = cars[index];
  document.getElementById('marca').value = car.marca;
  document.getElementById('modelo').value = car.modelo;
  document.getElementById('anio').value = car.anio;
  document.getElementById('precio').value = car.precio;
  document.getElementById('imagen').value = car.imagen;
  document.getElementById('categoria').value = car.categoria;
  mostrarCampoDescuento();
  if(car.categoria === 'descuento') {
    document.getElementById('descuento').value = car.descuento;
  }
  document.getElementById('descripcion').value = car.descripcion;
  mostrarFormulario();
  deleteCar(index);
}

/* --- BUSCADOR AUTOS --- */
function buscarAuto() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filteredCars = cars.filter(car =>
    car.marca.toLowerCase().includes(query) ||
    car.modelo.toLowerCase().includes(query)
  );
  renderCars(filteredCars);
}

/* --- FILTRO POR CATEGORÍA --- */
function filtrarCategoria(categoria) {
  const filteredCars = cars.filter(car => car.categoria === categoria);
  renderCars(filteredCars);
}

/* --- MOSTRAR TODOS LOS AUTOS --- */
function mostrarTodos() {
  renderCars(cars);
}

/* --- VENTAS --- */
const salesForm = document.getElementById('salesForm');

if (salesForm) {
  salesForm.addEventListener('submit', e => {
    e.preventDefault();
    const auto = document.getElementById('ventaAuto').value;
    const cliente = document.getElementById('clienteVenta').value;
    const email = document.getElementById('clienteEmail').value;
    const telefono = document.getElementById('clienteTelefono').value;
    const metodoPago = document.getElementById('metodoPago').value;
    const notas = document.getElementById('notasVenta').value;

    const editIndex = salesForm.dataset.editIndex;
    if (editIndex !== undefined) {
      ventas[editIndex] = { auto, cliente, email, telefono, metodoPago, notas, fecha: ventas[editIndex].fecha };
      delete salesForm.dataset.editIndex;
    } else {
      ventas.push({ auto, cliente, email, telefono, metodoPago, notas, fecha: new Date().toLocaleDateString() });
    }
    guardarVentas();
    mostrarVentas();
    salesForm.reset();
    cerrarFormularioVentas();
  });
}

function mostrarFormularioVentas() {
  document.getElementById('salesFormModal').classList.add('active');
}

function cerrarFormularioVentas() {
  document.getElementById('salesFormModal').classList.remove('active');
  if (salesForm) {
    salesForm.reset();
    delete salesForm.dataset.editIndex;
  }
}

/* --- MOSTRAR Y FILTRAR VENTAS --- */
function mostrarVentas(filteredSales = ventas) {
  const lista = document.getElementById('ventasList');
  lista.innerHTML = '';
  
  filteredSales.forEach((v) => {
    const originalIndex = ventas.findIndex(originalVenta => originalVenta === v);
    
    let acciones = "";
    if (currentRole === "admin") {
      acciones = `
        <div class="venta-actions">
          <span class="edit" onclick="editarVenta(${originalIndex})"> Editar</span>
          <span class="delete" onclick="eliminarVenta(${originalIndex})"> Eliminar</span>
        </div>
      `;
    }
    
    lista.innerHTML += `
      <li>
        <strong>${v.auto}</strong> - ${v.cliente} 
        <br><small> 📧 ${v.email} | 📞 ${v.telefono} | 💳 ${v.metodoPago}</small>
        <br><small> 📅 ${v.fecha}</small>
        ${acciones}
      </li>
    `;
  });
}

/* --- MOTOR DE BÚSQUEDA DEL HISTORIAL --- */
function buscarVenta() {
  const query = document.getElementById('salesSearchInput').value.toLowerCase();
  const filteredSales = ventas.filter(v =>
    v.auto.toLowerCase().includes(query) ||
    v.cliente.toLowerCase().includes(query)
  );
  mostrarVentas(filteredSales);
}

function eliminarVenta(index) {
  if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
    ventas.splice(index, 1);
    guardarVentas();
    buscarVenta();
  }
}

function editarVenta(index) {
  const venta = ventas[index];
  document.getElementById('ventaAuto').value = venta.auto;
  document.getElementById('clienteVenta').value = venta.cliente;
  document.getElementById('clienteEmail').value = venta.email;
  document.getElementById('clienteTelefono').value = venta.telefono;
  document.getElementById('metodoPago').value = venta.metodoPago;
  document.getElementById('notasVenta').value = venta.notas || '';
  
  document.getElementById('salesForm').dataset.editIndex = index;
  mostrarFormularioVentas();
}

/* --- LOCALSTORAGE --- */
function guardarAutos() {
  localStorage.setItem("cars", JSON.stringify(cars));
}

function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));
}
