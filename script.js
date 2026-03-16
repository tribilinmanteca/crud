// ── Estado global ──────────────────────────────────────────────────────────
let docentes = [];        // Lista de docentes cargada desde la BD
let filter   = 'all';     // Filtro activo por área
let page     = 1;         // Página actual
let sortCol  = '';        // Columna de ordenación activa
let sortDir  = 1;         // Dirección: 1 = ASC, -1 = DESC
let editId   = null;      // ID del docente en edición (null = nuevo)
let delId    = null;      // ID del docente a eliminar
const PAGE   = 10;        // Registros por página

const API = 'http://localhost/instituto/api/docentes.php';

// ── Carga inicial ───────────────────────────────────────────────────────────
async function loadDocentes() {
  const res = await fetch(API);
  docentes = await res.json();
  render();
}

// ── Guardar (crear o editar) ────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  const fields = ['tipoDoc','numDoc','nombre','apellido','fechaNac','nivel','area','asignatura','grado','eps','salario'];
  const data = Object.fromEntries(fields.map(k => [k, document.getElementById('f-'+k).value.trim()]));
  data.salario = +data.salario;

  if (editId !== null) {
    data.id = editId;
    await fetch(API, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    toast('Docente actualizado correctamente', 'ok', '✓');
  } else {
    await fetch(API, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    toast('Docente registrado exitosamente', 'ok', '✓');
  }
  closeModal();
  await loadDocentes();
}

// ── Eliminar ────────────────────────────────────────────────────────────────
async function confirmDelete() {
  await fetch(`${API}?id=${delId}`, { method: 'DELETE' });
  closeConfirm();
  toast('Registro eliminado', 'err', '🗑');
  await loadDocentes();
}

// ── Filtrado y búsqueda ─────────────────────────────────────────────────────
function getList() {
  const q = document.getElementById('search').value.toLowerCase();
  let l = docentes.filter(d => {
    if (filter !== 'all' && d.area !== filter) return false;
    return !q || `${d.nombre} ${d.apellido} ${d.numDoc} ${d.asignatura} ${d.eps}`.toLowerCase().includes(q);
  });
  if (sortCol) l.sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (sortCol === 'salario') { av = +av; bv = +bv; }
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });
  return l;
}

// ── Cambiar filtro activo ───────────────────────────────────────────────────
function setFilter(f, el) {
  filter = f; page = 1;
  document.querySelectorAll('.chip').forEach(c => c.className = 'chip');
  const cls = { all:'active-all', Matemáticas:'active-mat', Ciencias:'active-cien', Sistemas:'active-sis' };
  el.className = 'chip ' + cls[f];
  const titles = { all:'Todos los Docentes', Matemáticas:'Área de Matemáticas', Ciencias:'Área de Ciencias', Sistemas:'Área de Sistemas' };
  document.getElementById('card-title').textContent = titles[f];
  render();
}

// ── Ordenar por columna (BUG CORREGIDO) ─────────────────────────────────────
function sortBy(col) {
  // Si ya estaba ordenando por esta columna, invierte la dirección; si no, empieza ASC
  sortDir = (sortCol === col) ? -sortDir : 1;
  sortCol = col;
  render();
}

// ── Clases de color para badges ─────────────────────────────────────────────
const areaCls  = { Matemáticas:'b-mat', Ciencias:'b-cien', Sistemas:'b-sis' };
const nivelCls = { Pregrado:'b-pre', Maestría:'b-mae', Doctorado:'b-doc' };

// ── Formato fecha y salario ──────────────────────────────────────────────────
function fmtDate(iso) { if (!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }
function fmtSal(n)    { return '$ ' + Number(n).toLocaleString('es-CO'); }

// ── Renderizado principal ────────────────────────────────────────────────────
function render() {
  const list = getList(); const tot = list.length;
  const pages = Math.ceil(tot / PAGE) || 1;
  if (page > pages) page = pages;
  const s = (page - 1) * PAGE;
  const slice = list.slice(s, s + PAGE);

  document.getElementById('stat-total-side').textContent = docentes.length;
  document.getElementById('count-badge').textContent = `${tot} registro${tot !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('tbody');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty"><div class="empty-icon">📋</div><h3>Sin resultados</h3><p>No se encontraron docentes con los filtros actuales.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = slice.map((d, i) => `
      <tr style="animation-delay:${i * 0.04}s">
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:${avatarBg(d.nombre)};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;font-family:var(--font-serif)">${d.nombre[0]}${d.apellido[0]}</div>
            <div>
              <div class="td-name">${d.nombre} ${d.apellido}</div>
              <div style="font-size:11px;color:var(--gray-400)">${d.eps}</div>
            </div>
          </div>
        </td>
        <td><span class="td-doc-type">${d.tipoDoc}</span><span class="td-doc">${d.numDoc}</span></td>
        <td style="font-size:12px;color:var(--gray-600)">${fmtDate(d.fechaNac)}</td>
        <td><span class="badge ${nivelCls[d.nivel] || ''}">${d.nivel}</span></td>
        <td><span class="badge ${areaCls[d.area] || ''}">${d.area}</span></td>
        <td style="font-weight:500">${d.asignatura}</td>
        <td><span class="sem">${d.grado.replace(' Semestre', '')}</span></td>
        <td style="font-size:12px;color:var(--gray-600)">${d.eps}</td>
        <td class="salary">${fmtSal(d.salario)}</td>
        <td>
          <div style="display:flex;gap:6px;justify-content:center">
            <button class="btn btn-edit" onclick="openModal(${d.id})">✎ Editar</button>
            <button class="btn btn-del" onclick="askDel(${d.id})">✕</button>
          </div>
        </td>
      </tr>`).join('');
  }

  // Paginación
  document.getElementById('page-info').textContent = `Mostrando ${Math.min(s + 1, tot)}–${Math.min(s + slice.length, tot)} de ${tot}`;
  const pb = document.getElementById('page-btns'); pb.innerHTML = '';
  pb.appendChild(mkPbtn('←', page === 1, () => { page--; render(); }));
  for (let i = 1; i <= pages; i++) {
    const b = mkPbtn(i, false, () => { page = i; render(); });
    if (i === page) b.classList.add('active');
    pb.appendChild(b);
  }
  pb.appendChild(mkPbtn('→', page === pages, () => { page++; render(); }));
}

// ── Botón de paginación ──────────────────────────────────────────────────────
function mkPbtn(label, dis, fn) {
  const b = document.createElement('button');
  b.className = 'pbtn'; b.textContent = label; b.disabled = dis; b.onclick = fn;
  return b;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const avatarColors = ['#2d4fa1','#e8523a','#1e9e6b','#9b59b6','#e67e22','#16a085','#c0392b','#2980b9'];
function avatarBg(name) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }

// ── Búsqueda en tiempo real ──────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', () => { page = 1; render(); });

// ── Modal de registro / edición ──────────────────────────────────────────────
function openModal(id = null) {
  editId = id;
  document.getElementById('form').reset();
  if (id !== null) {
    const d = docentes.find(x => x.id === id); if (!d) return;
    ['tipoDoc','numDoc','nombre','apellido','fechaNac','nivel','area','asignatura','grado','eps','salario']
      .forEach(k => document.getElementById('f-' + k).value = d[k]);
    document.getElementById('modal-title').innerHTML = 'Editar <em>Docente</em>';
    document.getElementById('submit-btn').innerHTML  = '💾 Actualizar';
  } else {
    document.getElementById('modal-title').innerHTML = 'Registrar <em>Docente</em>';
    document.getElementById('submit-btn').innerHTML  = '💾 Guardar Docente';
  }
  document.getElementById('modal-ov').classList.add('open');
}

function closeModal() { document.getElementById('modal-ov').classList.remove('open'); editId = null; }

// ── Confirmación de eliminación ──────────────────────────────────────────────
function askDel(id) {
  delId = id;
  const d = docentes.find(x => x.id === id);
  document.getElementById('confirm-msg').textContent = `Se eliminará permanentemente el registro de ${d.nombre} ${d.apellido}.`;
  document.getElementById('confirm-ov').classList.add('open');
}

function closeConfirm() { document.getElementById('confirm-ov').classList.remove('open'); delId = null; }

// ── Toasts ────────────────────────────────────────────────────────────────────
function toast(msg, type, icon) {
  const w = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-icon ${type}">${icon}</div><div class="toast-msg">${msg}</div>`;
  w.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; t.style.transition = 'all .3s';
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ── Cerrar con Escape ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeConfirm(); } });

// ── Arranque ──────────────────────────────────────────────────────────────────
loadDocentes();