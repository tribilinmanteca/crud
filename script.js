
let docentes = JSON.parse(localStorage.getItem('doc_data') || '[]');
let nextId   = +localStorage.getItem('doc_nid' ) || 1;
// Si no hay docentes en el almacenamiento local, se cargan algunos datos de ejemplo para facilitar las pruebas y la demostración de la aplicación. Estos datos incluyen una variedad de docentes con diferentes áreas, niveles y asignaturas, lo que permite probar todas las funcionalidades de filtrado, ordenamiento, edición y eliminación.
if (!docentes.length) {
  [
    {tipoDoc:'C.C',numDoc:'10245678',nombre:'Chondre',apellido:'Torres',fechaNac:'1985-03-12',nivel:'Pregrado',area:'Matemáticas',asignatura:'Cálculo Diferencial',grado:'Primer Semestre',eps:'Sura',salario:4200000},
    {tipoDoc:'C.C',numDoc:'52301456',nombre:'Gabriel',apellido:'Ayazo',fechaNac:'1990-07-22',nivel:'Doctorado',area:'Ciencias',asignatura:'Física General',grado:'Segundo Semestre',eps:'Sanitas',salario:18800000},
    {tipoDoc:'C.E',numDoc:'87659321',nombre:'Steven',apellido:'Galindo',fechaNac:'1982-11-05',nivel:'Maestría',area:'Sistemas',asignatura:'Programación I',grado:'Primer Semestre',eps:'Nueva EPS',salario:4900000},
    {tipoDoc:'TI',numDoc:'1002345678',nombre:'María',apellido:'Pineda',fechaNac:'1995-09-09',nivel:'Maestría',area:'Sistemas',asignatura:'Base de Datos',grado:'Tercer Semestre',eps:'Coomeva',salario:4500000},
    {tipoDoc:'C.C',numDoc:'71234567',nombre:'Alejandra',apellido:'Gómez',fechaNac:'1978-09-14',nivel:'Doctorado',area:'Matemáticas',asignatura:'Álgebra Lineal',grado:'Segundo Semestre',eps:'Sura',salario:2200000},
  ].forEach(d => docentes.push({id:nextId++,...d}));
  save();
}

let filter='all', page=1, PAGE=8, sortCol=null, sortDir=1, delId=null, editId=null;

function save(){localStorage.setItem('doc_data',JSON.stringify(docentes));localStorage.setItem('doc_nid',nextId)}

//funcion para obtener la lista de docentes a mostrar, se llama cada vez que se cambia el filtro, la pagina, o se edita/elimina un docente
function getList(){
  const q=document.getElementById('search').value.toLowerCase();
  let l=docentes.filter(d=>{
    if(filter!=='all'&&d.area!==filter)return false;
    return !q||`${d.nombre} ${d.apellido} ${d.numDoc} ${d.asignatura} ${d.eps}`.toLowerCase().includes(q);
  });
  if(sortCol)l.sort((a,b)=>{
    let av=a[sortCol],bv=b[sortCol];
    if(sortCol==='salario'){av=+av;bv=+bv}
    return av<bv?-sortDir:av>bv?sortDir:0;
  });
  return l;
}

//funcion de renderizado de la tabla, se llama cada vez que se cambia el filtro, la pagina, o se edita/elimina un docente
function setFilter(f,el){
  filter=f;page=1;
  document.querySelectorAll('.chip').forEach(c=>c.className='chip');
  const cls={all:'active-all',Matemáticas:'active-mat',Ciencias:'active-cien',Sistemas:'active-sis'};
  el.className='chip '+cls[f];
  const titles={all:'Todos los Docentes',Matemáticas:'Área de Matemáticas',Ciencias:'Área de Ciencias',Sistemas:'Área de Sistemas'};
  document.getElementById('card-title').textContent=titles[f];
  render();
}
//funcion para ordenar por columna, se llama al hacer click en el encabezado de la tabla
function sortBy(col){
  sortCol=col===sortCol&&sortDir===1?col:col;
  sortDir=sortCol===col&&sortDir===1?-1:1;
  if(col!==sortCol)sortDir=1;sortCol=col;
  render();
}

//clases para colorear el area y el nivel, se usan en el renderizado de la tabla
const areaCls={Matemáticas:'b-mat',Ciencias:'b-cien',Sistemas:'b-sis'};
const nivelCls={Pregrado:'b-pre',Maestría:'b-mae',Doctorado:'b-doc'};

//funciones de formato para la fecha y el salario, se usan en el renderizado de la tabla
function fmtDate(iso){if(!iso)return '—';const[y,m,d]=iso.split('-');return`${d}/${m}/${y}`}
function fmtSal(n){return'$ '+Number(n).toLocaleString('es-CO')}

//funcion de renderizado de la tabla, se llama cada vez que se cambia el filtro, la pagina, o se edita/elimina un docente
function render(){
  const list=getList();const tot=list.length;
  const pages=Math.ceil(tot/PAGE)||1;
  if(page>pages)page=pages;
  const s=(page-1)*PAGE;
  const slice=list.slice(s,s+PAGE);
  document.getElementById('stat-total-side').textContent=docentes.length;
  document.getElementById('count-badge').textContent=`${tot} registro${tot!==1?'s':''}`;
  const tbody=document.getElementById('tbody');
  if(!slice.length){
    tbody.innerHTML=`<tr><td colspan="10"><div class="empty"><div class="empty-icon">📋</div><h3>Sin resultados</h3><p>No se encontraron docentes con los filtros actuales.</p></div></td></tr>`;
  } else {
    tbody.innerHTML=slice.map((d,i)=>`
      <tr style="animation-delay:${i*0.04}s">
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
        <td><span class="badge ${nivelCls[d.nivel]||''}">${d.nivel}</span></td>
        <td><span class="badge ${areaCls[d.area]||''}">${d.area}</span></td>
        <td style="font-weight:500">${d.asignatura}</td>
        <td><span class="sem">${d.grado.replace(' Semestre','')}</span></td>
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

  //renderizado de la paginacion
    document.getElementById('page-info').textContent=`Mostrando ${Math.min(s+1,tot)}–${Math.min(s+slice.length,tot)} de ${tot}`;
  const pb=document.getElementById('page-btns');pb.innerHTML='';
  const prev=mkPbtn('←',page===1,()=>{page--;render()});pb.appendChild(prev);
  for(let i=1;i<=pages;i++){const b=mkPbtn(i,false,()=>{page=i;render()});if(i===page)b.classList.add('active');pb.appendChild(b);}
  const nxt=mkPbtn('→',page===pages,()=>{page++;render()});pb.appendChild(nxt);
}

//funcion para crear un boton de paginacion, se usa en el renderizado de la tabla
function mkPbtn(label,dis,fn){const b=document.createElement('button');b.className='pbtn';b.textContent=label;b.disabled=dis;b.onclick=fn;return b}

const avatarColors=['#2d4fa1','#e8523a','#1e9e6b','#9b59b6','#e67e22','#16a085','#c0392b','#2980b9'];
function avatarBg(name){return avatarColors[name.charCodeAt(0)%avatarColors.length]}

document.getElementById('search').addEventListener('input',()=>{page=1;render()});

//funcion para abrir el modal de registro/edicion, se llama al hacer click en el boton de editar o en el boton de agregar docente
function openModal(id=null){
  editId=id;
  document.getElementById('form').reset();
  if(id!==null){
    const d=docentes.find(x=>x.id===id);if(!d)return;
    ['tipoDoc','numDoc','nombre','apellido','fechaNac','nivel','area','asignatura','grado','eps','salario'].forEach(k=>document.getElementById('f-'+k).value=d[k]);
    document.getElementById('modal-title').innerHTML='Editar <em>Docente</em>';
    document.getElementById('submit-btn').innerHTML='💾 Actualizar';
  } else {
    document.getElementById('modal-title').innerHTML='Registrar <em>Docente</em>';
    document.getElementById('submit-btn').innerHTML='💾 Guardar Docente';
  }
  document.getElementById('modal-ov').classList.add('open');
}

//funcion para cerrar el modal de registro/edicion, se llama al hacer click en el boton de cancelar o al presionar la tecla Escape
function closeModal(){document.getElementById('modal-ov').classList.remove('open');editId=null}

function handleSubmit(e){
  e.preventDefault();
  const fields=['tipoDoc','numDoc','nombre','apellido','fechaNac','nivel','area','asignatura','grado','eps','salario'];
  const data=Object.fromEntries(fields.map(k=>[k,document.getElementById('f-'+k).value.trim()]));
  data.salario=+data.salario;
  if(editId!==null){
    const idx=docentes.findIndex(d=>d.id===editId);
    docentes[idx]={id:editId,...data};
    toast('Docente actualizado correctamente','ok','✓');
  } else {
    docentes.push({id:nextId++,...data});
    toast('Docente registrado exitosamente','ok','✓');
  }
  save();closeModal();render();
}

//funcion para abrir el overlay de confirmacion de eliminacion, se llama al hacer click en el boton de eliminar de un docente
function askDel(id){
  delId=id;
  const d=docentes.find(x=>x.id===id);
  document.getElementById('confirm-msg').textContent=`Se eliminará permanentemente el registro de ${d.nombre} ${d.apellido}.`;
  document.getElementById('confirm-ov').classList.add('open');
}

//funcion para cerrar el overlay de confirmacion de eliminacion, se llama al hacer click en el boton de cancelar o al presionar la tecla Escape
function closeConfirm(){document.getElementById('confirm-ov').classList.remove('open');delId=null}

//funcion para eliminar el docente, se llama al hacer click en el boton de confirmar eliminacion
function confirmDelete(){
  docentes=docentes.filter(d=>d.id!==delId);
  save();closeConfirm();render();
  toast('Registro eliminado','err','🗑');
}

//funcion para mostrar un mensaje de toast, se llama al actualizar/crear un docente o al eliminarlo
function toast(msg,type,icon){
  const w=document.getElementById('toasts');
  const t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<div class="toast-icon ${type}">${icon}</div><div class="toast-msg">${msg}</div>`;
  w.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(40px)';t.style.transition='all .3s';setTimeout(()=>t.remove(),300)},2800);
}

//listener global para cerrar modales al presionar Escape
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeConfirm()}});

render();