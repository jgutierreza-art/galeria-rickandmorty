const API = "https://rickandmortyapi.com/api";
let pagina = 1;
let totalPaginas = 42;
const personajes = {}; // guarda los personajes de la página actual por id

const galeria = document.getElementById("galeria");
const mensaje = document.getElementById("mensaje");
const btnAnterior = document.getElementById("anterior");
const btnSiguiente = document.getElementById("siguiente");
const modal = new bootstrap.Modal(document.getElementById("modalDetalle"));

// Escapa texto para no insertar HTML de la API directamente
function esc(texto) {
  const d = document.createElement("div");
  d.textContent = texto ?? "";
  return d.innerHTML;
}

// Clase del punto de color según el estado
function claseEstado(status) {
  const s = (status || "").toLowerCase();
  return s === "alive" ? "alive" : s === "dead" ? "dead" : "unknown";
}

// 2017-11-04T18:48:46.250Z -> 04/11/2017
function formatoFecha(iso) {
  const f = new Date(iso);
  const dd = String(f.getUTCDate()).padStart(2, "0");
  const mm = String(f.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${f.getUTCFullYear()}`;
}

function mostrarError(texto) {
  mensaje.innerHTML = `<div class="alert alert-danger" role="alert">${esc(texto)}</div>`;
  galeria.innerHTML = "";
}

async function cargarPagina(n) {
  mensaje.innerHTML = "";
  galeria.innerHTML = '<p class="text-center text-secondary">Cargando personajes…</p>';
  try {
    const respuesta = await fetch(`${API}/character?page=${n}`);
    // fetch no lanza error con 404: hay que revisar el estado
    if (!respuesta.ok) {
      throw new Error(`La API respondió con el código ${respuesta.status}.`);
    }
    const datos = await respuesta.json();
    pagina = n;
    totalPaginas = datos.info.pages;
    dibujarTarjetas(datos.results);
    actualizarPaginacion();
  } catch (error) {
    mostrarError("No se pudieron cargar los personajes. " + error.message + " Revisa tu conexión e inténtalo de nuevo.");
  }
}

function dibujarTarjetas(lista) {
  galeria.innerHTML = "";
  lista.forEach(p => {
    personajes[p.id] = p;
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3"; // 1 celular, 2 tableta, 4 pantalla grande
    col.innerHTML = `
      <div class="card h-100">
        <img src="${esc(p.image)}" class="card-img-top" alt="${esc(p.name)}">
        <div class="card-body d-flex flex-column">
          <h2 class="card-title">${esc(p.name)}</h2>
          <p class="estado mb-2"><span class="punto ${claseEstado(p.status)}"></span>${esc(p.status)} - ${esc(p.species)}</p>
          <p class="etiqueta">Última ubicación:</p>
          <p class="small mb-3">${esc(p.location.name)}</p>
          <button class="btn btn-primary btn-sm w-100 mt-auto" data-id="${p.id}">Detalle</button>
        </div>
      </div>`;
    galeria.appendChild(col);
  });
}

function actualizarPaginacion() {
  document.getElementById("paginaTexto").textContent = `Página ${pagina} de ${totalPaginas}`;
  btnAnterior.disabled = pagina <= 1;
  btnSiguiente.disabled = pagina >= totalPaginas;
}

// Botón Detalle (delegación de eventos)
galeria.addEventListener("click", e => {
  const boton = e.target.closest("button[data-id]");
  if (!boton) return;
  abrirDetalle(personajes[boton.dataset.id]);
});

function abrirDetalle(p) {
  document.getElementById("modalTitulo").textContent = p.name;
  const img = document.getElementById("modalImg");
  img.src = p.image;
  img.alt = p.name;

  const filas = [
    ["ID", esc(p.id)],
    ["Estado", `<span class="punto ${claseEstado(p.status)}"></span>${esc(p.status)}`],
    ["Especie", esc(p.species)],
    ["Género", esc(p.gender)],
    ["Tipo", esc(p.type || "Sin tipo")],
    ["Origen", esc(p.origin.name)],
    ["Última ubicación", esc(p.location.name)],
    ["Episodios", p.episode.length],
    ["Creado", formatoFecha(p.created)]
  ];
  document.getElementById("modalDatos").innerHTML = filas
    .map(([k, v]) => `<div class="row"><dt class="col-5">${k}</dt><dd class="col-7 mb-0">${v}</dd></div>`)
    .join("");
  modal.show();
}

btnAnterior.addEventListener("click", () => { if (pagina > 1) cargarPagina(pagina - 1); });
btnSiguiente.addEventListener("click", () => { if (pagina < totalPaginas) cargarPagina(pagina + 1); });

cargarPagina(1);
