
let docentes = JSON.parse(localStorage.getItem('doc_data') || '[]');
let nextId   = +localStorage.getItem('doc_nid' ) || 1;

if (!docentes.length) {
  [
    {tipoDoc:'C.C',numDoc:'10245678',nombre:'Carlos',apellido:'Mendoza',fechaNac:'1985-03-12',nivel:'Maestría',area:'Matemáticas',asignatura:'Cálculo Diferencial',grado:'Primer Semestre',eps:'Sura',salario:4200000},
    {tipoDoc:'C.C',numDoc:'52301456',nombre:'Laura',apellido:'Rodríguez',fechaNac:'1990-07-22',nivel:'Doctorado',area:'Ciencias',asignatura:'Física General',grado:'Segundo Semestre',eps:'Sanitas',salario:5800000},
    {tipoDoc:'C.E',numDoc:'87659321',nombre:'Andrés',apellido:'García',fechaNac:'1982-11-05',nivel:'Pregrado',area:'Sistemas',asignatura:'Programación I',grado:'Primer Semestre',eps:'Nueva EPS',salario:3500000},
    {tipoDoc:'TI',numDoc:'1002345678',nombre:'María',apellido:'Jiménez',fechaNac:'1995-01-30',nivel:'Maestría',area:'Sistemas',asignatura:'Base de Datos',grado:'Tercer Semestre',eps:'Coomeva',salario:4500000},
    {tipoDoc:'C.C',numDoc:'71234567',nombre:'Diego',apellido:'Torres',fechaNac:'1978-09-14',nivel:'Doctorado',area:'Matemáticas',asignatura:'Álgebra Lineal',grado:'Segundo Semestre',eps:'Sura',salario:6200000},
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

