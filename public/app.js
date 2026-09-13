(() => {
  const KEY = 'laluca-traffic-v1';
  const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const STATUSES = ['Urgente','En curso','En espera/Pausa','En revisión','Completado','Pendiente'];
  let view = 'traffic';
  let filters = { q:'', status:'', person:'', kpi:'' };
  let timer = null;

  const demo = () => ({
    settings:{rate:70},
    people:[
      {id:'p1',name:'Marta',capacity:37.5,color:0},{id:'p2',name:'Leo',capacity:37.5,color:1},
      {id:'p3',name:'Nora',capacity:37.5,color:2},{id:'p4',name:'Bruno',capacity:37.5,color:3},
      {id:'p5',name:'Ane',capacity:37.5,color:4},{id:'p6',name:'Dani',capacity:37.5,color:5}
    ],
    projects:[
      proj('a1','Nube Norte','Carpeta corporativa','Adaptación de carpeta comercial','2026-09-15','En curso','p1',2,1,'Esperando fotografías.'),
      proj('a2','Lumen Foods','Campaña otoño','Creatividades RRSS y mupis','2026-09-18','Urgente','p2',14,9,'Entrega el jueves.'),
      proj('a3','Kora Studio','Web corporativa','Revisión responsive y SEO','2026-09-25','En revisión','p3',20,19,'Cliente revisando textos.'),
      proj('a4','Bidea Labs','Evento anual','Producción y coordinación','2026-10-09','En curso','p4',40,20,'Coordinación proveedores.'),
      proj('a5','Aroa Clínica','Anuncio Instagram','Pieza + copies','2026-09-14','Completado','p5',4,4,''),
      proj('a6','Atelier 28','Identidad mini','Logo secundario y aplicaciones','2026-09-22','En espera/Pausa','p1',10,3,'Pendiente de feedback.'),
      proj('a7','Mar Azul','Email marketing','Newsletter lanzamiento','2026-09-16','En curso','p6',5,2,''),
      proj('a8','Orbe Hotels','Migración Brevo','Migrar listas y automatizaciones','2026-09-30','En curso','p3',16,5,''),
      proj('a9','Senda Tech','Power BI','Ajustes dashboard comercial','2026-09-28','Pendiente','p4',18,0,''),
      proj('a10','Vera Home','Catálogo 2027','Diseño y maquetación','2026-10-15','En curso','p2',32,10,''),
      proj('a11','Ibaia Coop','Podcast mensual','Editar episodio y cortes','2026-09-20','En curso','p6',6,2,''),
      proj('a12','Muga Gastro','Pantallas local','3 piezas animadas','2026-09-17','Urgente','p5',8,5,''),
      proj('a13','Lurra Legal','Web cambios','Cambios de textos y equipo','2026-09-23','En espera/Pausa','p1',7,1.5,'Pendiente accesos.'),
      proj('a14','Delta Kultur','Propuesta evento','Concepto y estimación','2026-09-19','En revisión','p2',12,8,''),
      proj('a15','Odei Media','Plan RRSS','Plan orgánico trimestre','2026-09-27','Pendiente','p5',15,0,'')
    ],
    blocks:[
      block('b1','a2','p2','Lunes',2),block('b2','a2','p2','Martes',2),block('b3','a4','p4','Miércoles',4),
      block('b4','a8','p3','Jueves',3),block('b5','a10','p2','Viernes',4),block('b6','a12','p5','Lunes',2),block('b7','a1','p1','Lunes',1)
    ]
  });
  function proj(id,client,name,desc,due,status,responsible,budgetHours,loggedHours,comments){return {id,client,name,desc,due,status,responsible,budgetHours,loggedHours,comments,rate:70,holdedUrl:''};}
  function block(id,projectId,personId,day,hours){return {id,projectId,personId,day,hours};}
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||demo();}catch{return demo();}}
  let state = load();
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const uid=p=>p+'_'+Math.random().toString(36).slice(2,9);
  const byId=(arr,id)=>arr.find(x=>x.id===id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const h=n=>(Math.round(Number(n||0)*100)/100).toString().replace('.',',')+' h';
  const eur=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));
  const person=id=>byId(state.people,id);
  function metrics(p){
    const reserved=state.blocks.filter(b=>b.projectId===p.id).reduce((s,b)=>s+Number(b.hours||0),0);
    const remaining=Number(p.budgetHours||0)-Number(p.loggedHours||0);
    const unplanned=Math.max(remaining-reserved,0);
    const over=Math.max(reserved-remaining,0);
    const pct=Number(p.budgetHours)>0 ? Number(p.loggedHours)/Number(p.budgetHours)*100 : null;
    return {reserved,remaining,unplanned,over,pct,budget:Math.max(0,Number(p.budgetHours||0))*Number(p.rate||state.settings.rate),consumed:Number(p.loggedHours||0)*Number(p.rate||state.settings.rate)};
  }
  function pm(personObj){
    const reserved=state.blocks.filter(b=>b.personId===personObj.id).reduce((s,b)=>s+Number(b.hours||0),0);
    const logged=state.projects.filter(p=>p.responsible===personObj.id).reduce((s,p)=>s+Number(p.loggedHours||0),0);
    return {reserved,logged,load:personObj.capacity?reserved/personObj.capacity*100:0};
  }
  const statusClass=s=>({'Urgente':'status-urgent','En curso':'status-progress','En espera/Pausa':'status-wait','En revisión':'status-review','Completado':'status-done','Pendiente':'status-pending'}[s]||'status-pending');
  const progressClass=p=>p>=100?'red':p>=90?'orange':p>=70?'yellow':'';
  const personChip=id=>{const p=person(id);return p?`<span class="person-chip p${p.color}">${esc(p.name)}</span>`:'—';};

  function sidebar(){
    const items=[['traffic','Tráfico'],['planning','Planificación'],['mywork','Mi trabajo'],['projects','Proyectos'],['team','Equipo'],['integrations','Integraciones']];
    return `<aside class="sidebar"><div class="brand"><div class="brand-title">TRÁFICO</div><div class="brand-sub">Panel único de agencia<br>horas · carga · rentabilidad</div></div><nav class="nav">${items.map(i=>`<button class="nav-btn ${view===i[0]?'active':''}" data-view="${i[0]}"><span class="nav-dot"></span><span class="label">${i[1]}</span></button>`).join('')}</nav><div class="sidebar-foot">MVP local · Laluca</div></aside>`;
  }
  function topbar(){
    const names={traffic:'Tráfico',planning:'Planificación semanal',mywork:'Mi trabajo',projects:'Proyectos / rentabilidad',team:'Equipo / capacidad',integrations:'Integraciones'};
    return `<header class="topbar"><div class="top-title">${names[view]}</div><div class="top-right"><span class="small muted desktop-only">Tarifa base</span><input id="global-rate" class="input desktop-only" style="width:82px" type="number" value="${state.settings.rate}"><span class="small muted desktop-only">€/h</span><button id="reset-demo" class="btn btn-small desktop-only">Restaurar demo</button></div></header>`;
  }
  function render(){
    document.getElementById('app').innerHTML=`<div class="app-shell">${sidebar()}<main class="main">${topbar()}<section class="page">${page()}</section></main></div><div id="modal-root"></div>`;
    document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
    const rate=document.getElementById('global-rate'); if(rate) rate.onchange=()=>{state.settings.rate=Number(rate.value)||70;save();render();};
    const reset=document.getElementById('reset-demo'); if(reset) reset.onclick=()=>{if(confirm('¿Restaurar datos demo?')){state=demo();save();render();}};
    if(view==='traffic') bindTraffic(); if(view==='planning') bindPlanning(); if(view==='mywork') bindMyWork(); if(view==='team') bindTeam(); if(view==='integrations') bindIntegrations();
  }
  function page(){if(view==='traffic')return traffic();if(view==='planning')return planning();if(view==='mywork')return mywork();if(view==='projects')return projects();if(view==='team')return team();return integrations();}

  function traffic(){
    const urgent=state.projects.filter(p=>p.status==='Urgente').length;
    const unplanned=state.projects.reduce((s,p)=>s+metrics(p).unplanned,0);
    const over90=state.projects.filter(p=>(metrics(p).pct||0)>=90).length;
    const overloaded=state.people.filter(x=>pm(x).load>100).length;
    let rows=[...state.projects]; const q=filters.q.toLowerCase().trim();
    if(q)rows=rows.filter(p=>[p.client,p.name,p.desc,p.comments].join(' ').toLowerCase().includes(q));
    if(filters.status)rows=rows.filter(p=>p.status===filters.status); if(filters.person)rows=rows.filter(p=>p.responsible===filters.person);
    if(filters.kpi==='urgent')rows=rows.filter(p=>p.status==='Urgente');
    if(filters.kpi==='unplanned')rows=rows.filter(p=>metrics(p).unplanned>0);
    if(filters.kpi==='over90')rows=rows.filter(p=>(metrics(p).pct||0)>=90);
    if(filters.kpi==='overload'){const ids=new Set(state.people.filter(x=>pm(x).load>100).map(x=>x.id));rows=rows.filter(p=>ids.has(p.responsible));}
    return `<div class="page-head"><div><h1 class="page-title">Tráfico</h1><div class="page-sub">Vista de todos los encargos cruzada con horas y planificación.</div></div><div style="display:flex;gap:8px"><button id="import-csv" class="btn">Importar CSV</button><button id="new-project" class="btn btn-primary">+ Nuevo encargo</button></div></div>
      <div class="kpis">${kpi('urgent','Urgentes',urgent,'Necesitan decisión')}${kpi('unplanned','Horas sin planificar',h(unplanned),'Todavía no están en agenda')}${kpi('over90','>90% presupuesto',over90,'Al límite')}${kpi('overload','Sobrecarga equipo',overloaded,'Personas >100%')}${kpi('all','Encargos activos',state.projects.filter(p=>p.status!=='Completado').length,'En circulación')}</div>
      <div class="toolbar"><input id="search" class="input search" placeholder="Buscar cliente, proyecto…" value="${esc(filters.q)}"><select id="status-filter" class="select" style="width:190px"><option value="">Todos los estados</option>${STATUSES.map(s=>`<option ${filters.status===s?'selected':''}>${s}</option>`).join('')}</select><select id="person-filter" class="select" style="width:170px"><option value="">Todo el equipo</option>${state.people.map(p=>`<option value="${p.id}" ${filters.person===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select><button id="clear-filters" class="btn btn-small">Limpiar</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>EJECUTA</th><th>CLIENTE</th><th>PROYECTO</th><th>DESCRIPCIÓN</th><th>ENTREGA</th><th>ESTADO</th><th>COMENTARIOS</th><th>H. PRESUP.</th><th>H. HECHAS</th><th>H. RESERV.</th><th>H. RESTANTES</th><th>H. SIN PLANIF.</th><th>RESPONSABLE</th><th>DETALLE</th></tr></thead><tbody>${rows.map(row).join('')||'<tr><td colspan="14" class="empty">Sin resultados</td></tr>'}</tbody></table></div>`;
  }
  function kpi(key,label,value,foot){return `<div class="kpi" data-kpi="${key}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-foot">${foot}</div></div>`;}
  function row(p){const m=metrics(p);return `<tr><td>${personChip(p.responsible)}</td><td class="client col-client" contenteditable="true" data-edit="${p.id}:client">${esc(p.client)}</td><td class="col-project" contenteditable="true" data-edit="${p.id}:name">${esc(p.name)}</td><td class="col-desc" contenteditable="true" data-edit="${p.id}:desc">${esc(p.desc)}</td><td><input class="input" data-date="${p.id}" type="date" value="${p.due}"></td><td><select class="select" data-status="${p.id}">${STATUSES.map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td class="col-comments" contenteditable="true" data-edit="${p.id}:comments">${esc(p.comments)}</td><td><input class="input" style="width:70px" data-num="${p.id}:budgetHours" type="number" step=".5" value="${p.budgetHours}"></td><td><input class="input" style="width:70px" data-num="${p.id}:loggedHours" type="number" step=".25" value="${p.loggedHours}"></td><td>${h(m.reserved)}</td><td class="${m.remaining<0?'hours-bad':''}">${h(m.remaining)}</td><td class="${m.unplanned>0?'hours-warn':'hours-good'}">${h(m.unplanned)}${m.over>0?`<div class="small hours-bad">+${h(m.over)} sobre</div>`:''}</td><td><select class="select" data-person="${p.id}">${state.people.map(x=>`<option value="${x.id}" ${x.id===p.responsible?'selected':''}>${esc(x.name)}</option>`).join('')}</select></td><td><button class="btn btn-small" data-open="${p.id}">Abrir</button></td></tr>`;}
  function bindTraffic(){
    document.querySelectorAll('[data-kpi]').forEach(x=>x.onclick=()=>{filters.kpi=x.dataset.kpi==='all'?'':x.dataset.kpi;render();});
    document.getElementById('search').oninput=e=>{filters.q=e.target.value;render();};
    document.getElementById('status-filter').onchange=e=>{filters.status=e.target.value;render();};
    document.getElementById('person-filter').onchange=e=>{filters.person=e.target.value;render();};
    document.getElementById('clear-filters').onclick=()=>{filters={q:'',status:'',person:'',kpi:''};render();};
    document.querySelectorAll('[data-edit]').forEach(el=>el.onblur=()=>{const [id,k]=el.dataset.edit.split(':');byId(state.projects,id)[k]=el.innerText.trim();save();});
    document.querySelectorAll('[data-date]').forEach(el=>el.onchange=()=>{byId(state.projects,el.dataset.date).due=el.value;save();});
    document.querySelectorAll('[data-status]').forEach(el=>el.onchange=()=>{byId(state.projects,el.dataset.status).status=el.value;save();render();});
    document.querySelectorAll('[data-person]').forEach(el=>el.onchange=()=>{byId(state.projects,el.dataset.person).responsible=el.value;save();render();});
    document.querySelectorAll('[data-num]').forEach(el=>el.onchange=()=>{const [id,k]=el.dataset.num.split(':');byId(state.projects,id)[k]=Number(el.value)||0;save();render();});
    document.querySelectorAll('[data-open]').forEach(el=>el.onclick=()=>projectModal(el.dataset.open));
    document.getElementById('new-project').onclick=()=>projectModal(); document.getElementById('import-csv').onclick=csvModal;
  }

  function planning(){
    const backlog=state.projects.filter(p=>p.status!=='Completado'&&metrics(p).unplanned>0);
    return `<div class="page-head"><div><h1 class="page-title">Planificación semanal</h1><div class="page-sub">Arrastra trabajo pendiente a una persona y un día.</div></div><button id="manual-block" class="btn">+ Bloque manual</button></div><div class="planning-layout"><aside class="backlog"><div class="card-title">Por planificar</div><div class="small muted" style="margin-bottom:10px">Arrastra una tarjeta. Se reservarán 2 h por defecto.</div>${backlog.map(p=>{const m=metrics(p);return `<div class="backlog-card" draggable="true" data-drag="${p.id}"><strong>${esc(p.client)} · ${esc(p.name)}</strong><div class="meta">Quedan ${h(m.remaining)} · sin planificar ${h(m.unplanned)}</div></div>`;}).join('')||'<div class="empty">Todo planificado</div>'}</aside><div class="plan-board"><div class="plan-grid"><div class="plan-cell plan-head person-cell">Equipo</div>${DAYS.map(d=>`<div class="plan-cell plan-head">${d}</div>`).join('')}${state.people.map(pe=>`<div class="plan-cell person-cell"><strong>${esc(pe.name)}</strong><div class="small muted">${h(pm(pe).reserved)} / ${h(pe.capacity)}</div></div>${DAYS.map(day=>planCell(pe,day)).join('')}`).join('')}</div></div></div>`;
  }
  function planCell(pe,day){return `<div class="plan-cell dropzone" data-person-drop="${pe.id}" data-day="${day}">${state.blocks.filter(b=>b.personId===pe.id&&b.day===day).map(b=>{const p=byId(state.projects,b.projectId);return p?`<div class="plan-block"><div class="block-top"><span>${esc(p.client)}</span><span>${h(b.hours)}</span></div><div>${esc(p.name)}</div><div class="block-actions"><button data-minus="${b.id}">−0,5h</button><button data-plus="${b.id}">+0,5h</button><button data-del="${b.id}">Quitar</button></div></div>`:'';}).join('')}</div>`;}
  function bindPlanning(){
    document.querySelectorAll('[data-drag]').forEach(el=>el.ondragstart=e=>e.dataTransfer.setData('text/plain',el.dataset.drag));
    document.querySelectorAll('.dropzone').forEach(z=>{z.ondragover=e=>{e.preventDefault();z.classList.add('drag-over')};z.ondragleave=()=>z.classList.remove('drag-over');z.ondrop=e=>{e.preventDefault();z.classList.remove('drag-over');const id=e.dataTransfer.getData('text/plain');const p=byId(state.projects,id);if(!p)return;state.blocks.push(block(uid('b'),id,z.dataset.personDrop,z.dataset.day,Math.min(2,Math.max(.5,metrics(p).unplanned))));save();render();};});
    document.querySelectorAll('[data-plus]').forEach(el=>el.onclick=()=>adjust(el.dataset.plus,.5));document.querySelectorAll('[data-minus]').forEach(el=>el.onclick=()=>adjust(el.dataset.minus,-.5));document.querySelectorAll('[data-del]').forEach(el=>el.onclick=()=>{state.blocks=state.blocks.filter(b=>b.id!==el.dataset.del);save();render();});
    document.getElementById('manual-block').onclick=blockModal;
  }
  function adjust(id,d){const b=byId(state.blocks,id);if(b){b.hours=Math.max(.5,b.hours+d);save();render();}}

  function mywork(){const pid=localStorage.getItem('laluca-person')||state.people[0].id;const pe=person(pid)||state.people[0];const bs=state.blocks.filter(b=>b.personId===pe.id);return `<div class="page-head"><div><h1 class="page-title">Mi trabajo</h1><div class="page-sub">El técnico ve su límite antes de empezar.</div></div><select id="my-person" class="select" style="width:180px">${state.people.map(p=>`<option value="${p.id}" ${p.id===pe.id?'selected':''}>${p.name}</option>`).join('')}</select></div><div class="work-list">${bs.map(b=>workCard(b,pe)).join('')||`<div class="card empty">Sin bloques para ${pe.name}</div>`}</div>`;}
  function workCard(b,pe){const p=byId(state.projects,b.projectId),m=metrics(p),bad=(m.pct||0)>=100;return `<div class="work-card ${bad?'exhausted':''}"><div class="small muted">${b.day} · bloque ${h(b.hours)}</div><div class="work-title">${esc(p.client)} · ${esc(p.name)}</div>${(m.pct||0)>=90?`<div class="notice ${bad?'danger':'warn'}">${bad?'Presupuesto agotado — consulta antes de continuar.':'Atención: '+Math.round(m.pct)+'% consumido.'}</div>`:''}<div class="work-kpis"><div class="mini-kpi"><strong>${h(p.budgetHours)}</strong><span>Presup.</span></div><div class="mini-kpi"><strong>${h(p.loggedHours)}</strong><span>Hechas</span></div><div class="mini-kpi"><strong>${h(m.remaining)}</strong><span>Quedan</span></div><div class="mini-kpi"><strong>${h(b.hours)}</strong><span>Bloque</span></div></div><div class="timer-row"><span class="timer" id="clock-${p.id}">${timer&&timer.projectId===p.id?clockText():'00:00:00'}</span><button class="btn btn-primary btn-small" data-start="${p.id}" data-pid="${pe.id}">Iniciar</button><button class="btn btn-small" data-stop="${p.id}">Parar</button><button class="btn btn-small" data-manual="${p.id}">Registrar tiempo</button></div></div>`;}
  function bindMyWork(){document.getElementById('my-person').onchange=e=>{localStorage.setItem('laluca-person',e.target.value);render();};document.querySelectorAll('[data-start]').forEach(el=>el.onclick=()=>startTimer(el.dataset.start,el.dataset.pid));document.querySelectorAll('[data-stop]').forEach(el=>el.onclick=()=>stopTimer(el.dataset.stop));document.querySelectorAll('[data-manual]').forEach(el=>el.onclick=()=>{const v=prompt('Horas a registrar (ej. 1,5)','1');if(v===null)return;const n=Number(v.replace(',','.'));if(n>0)addTime(el.dataset.manual,n);});}
  function startTimer(projectId,personId){if(timer)return alert('Ya hay un temporizador en marcha.');timer={projectId,personId,start:Date.now()};timer.interval=setInterval(()=>{const el=document.getElementById('clock-'+projectId);if(el)el.textContent=clockText();},1000);render();}
  function clockText(){if(!timer)return'00:00:00';const s=Math.floor((Date.now()-timer.start)/1000);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':');}
  function stopTimer(projectId){if(!timer||timer.projectId!==projectId)return;clearInterval(timer.interval);const hrs=(Date.now()-timer.start)/3600000;timer=null;addTime(projectId,hrs);}
  function addTime(projectId,hrs){const p=byId(state.projects,projectId);p.loggedHours=Math.round((Number(p.loggedHours)+Number(hrs))*100)/100;save();render();}

  function projects(){return `<div class="page-head"><div><h1 class="page-title">Proyectos / rentabilidad</h1><div class="page-sub">Presupuesto de horas frente al consumo real.</div></div></div><div class="table-wrap" style="max-height:none"><table class="data-table"><thead><tr><th>CLIENTE</th><th>PROYECTO</th><th>PRESUPUESTO €</th><th>H. PRESUP.</th><th>H. HECHAS</th><th>H. RESTANTES</th><th>% CONSUMIDO</th><th>VALOR CONSUMIDO</th><th>ESTADO</th></tr></thead><tbody>${state.projects.map(p=>{const m=metrics(p);return `<tr><td class="client">${esc(p.client)}</td><td>${esc(p.name)}</td><td>${eur(m.budget)}</td><td>${h(p.budgetHours)}</td><td>${h(p.loggedHours)}</td><td class="${m.remaining<0?'hours-bad':''}">${h(m.remaining)}</td><td><div style="display:flex;gap:8px;align-items:center"><div class="progress ${progressClass(m.pct||0)}"><span style="width:${Math.min(m.pct||0,100)}%"></span></div><strong>${m.pct==null?'—':Math.round(m.pct)+'%'}</strong></div></td><td>${eur(m.consumed)}</td><td><span class="chip ${statusClass(p.status)}">${p.status}</span></td></tr>`;}).join('')}</tbody></table></div>`;}
  function team(){return `<div class="page-head"><div><h1 class="page-title">Equipo / capacidad</h1><div class="page-sub">Carga reservada frente a capacidad semanal.</div></div></div><div class="team-grid">${state.people.map(pe=>{const m=pm(pe),pct=Math.round(m.load);return `<div class="team-card"><div class="team-head"><div>${personChip(pe.id)}<div class="small muted" style="margin-top:5px">Capacidad semanal</div></div><input class="input" data-cap="${pe.id}" type="number" step=".5" value="${pe.capacity}" style="width:85px"></div><div class="capacity-bar ${pct>100?'over':''}"><span style="width:${Math.min(pct,100)}%"></span></div><div class="metric-line"><span>Reservadas</span><strong>${h(m.reserved)}</strong></div><div class="metric-line"><span>Registradas*</span><strong>${h(m.logged)}</strong></div><div class="metric-line"><span>Carga</span><strong class="${pct>100?'hours-bad':pct>85?'hours-warn':'hours-good'}">${pct}%</strong></div></div>`;}).join('')}</div>`;}
  function bindTeam(){document.querySelectorAll('[data-cap]').forEach(el=>el.onchange=()=>{person(el.dataset.cap).capacity=Number(el.value)||37.5;save();render();});}
  function integrations(){return `<div class="page-head"><div><h1 class="page-title">Integraciones</h1><div class="page-sub">Holded conserva la parte económica; Calendar mostrará la agenda.</div></div></div><div class="integrations"><div class="integration-card"><div class="integration-head"><div class="integration-logo">H</div><div><div class="card-title" style="margin:0">Holded</div><span class="badge-off">No conectado</span></div></div><p class="small muted">La API key debe guardarse en servidor. El panel está preparado para leer proyectos/tareas y registrar dedicaciones.</p><button id="holded-btn" class="btn">Cómo conectarlo</button></div><div class="integration-card"><div class="integration-head"><div class="integration-logo">G</div><div><div class="card-title" style="margin:0">Google Calendar</div><span class="badge-off">No conectado</span></div></div><p class="small muted">Cada bloque del planning podrá convertirse en un evento y mantener su googleEventId.</p><button id="calendar-btn" class="btn">Cómo conectarlo</button></div></div>`;}
  function bindIntegrations(){document.getElementById('holded-btn').onclick=()=>alert('Siguiente fase: Worker/backend seguro para Holded. Nunca guardar la API key en el navegador.');document.getElementById('calendar-btn').onclick=()=>alert('Siguiente fase: OAuth de Google Calendar y un calendario por técnico.');}

  function projectModal(id){const old=id?byId(state.projects,id):null;const p=old?{...old}:proj(uid('a'),'','','','', 'Pendiente',state.people[0].id,2,0,'');modal(`<div class="modal-head"><div class="card-title">${old?'Editar encargo':'Nuevo encargo'}</div><button class="btn btn-small" data-close>✕</button></div><div class="form-grid">${field('Cliente',`<input id="m-client" class="input" value="${esc(p.client)}">`)}${field('Proyecto',`<input id="m-name" class="input" value="${esc(p.name)}">`)}${field('Descripción',`<textarea id="m-desc" class="textarea">${esc(p.desc)}</textarea>`,'full')}${field('Entrega',`<input id="m-due" class="input" type="date" value="${p.due}">`)}${field('Estado',`<select id="m-status" class="select">${STATUSES.map(s=>`<option ${s===p.status?'selected':''}>${s}</option>`).join('')}</select>`)}${field('Responsable',`<select id="m-person" class="select">${state.people.map(x=>`<option value="${x.id}" ${x.id===p.responsible?'selected':''}>${x.name}</option>`).join('')}</select>`)}${field('Horas presupuestadas',`<input id="m-budget" class="input" type="number" step=".5" value="${p.budgetHours}">`)}${field('Horas hechas',`<input id="m-logged" class="input" type="number" step=".25" value="${p.loggedHours}">`)}${field('Comentarios',`<textarea id="m-comments" class="textarea">${esc(p.comments)}</textarea>`,'full')}</div><div style="display:flex;justify-content:${old?'space-between':'flex-end'};gap:8px;margin-top:14px">${old?'<button id="delete-project" class="btn btn-danger">Eliminar</button>':''}<div style="display:flex;gap:8px"><button class="btn" data-close>Cancelar</button><button id="save-project" class="btn btn-primary">Guardar</button></div></div>`);document.getElementById('save-project').onclick=()=>{Object.assign(p,{client:val('m-client'),name:val('m-name'),desc:val('m-desc'),due:val('m-due'),status:val('m-status'),responsible:val('m-person'),budgetHours:Number(val('m-budget'))||0,loggedHours:Number(val('m-logged'))||0,comments:val('m-comments'),rate:p.rate||state.settings.rate});if(!p.client||!p.name)return alert('Cliente y proyecto son obligatorios.');if(old)Object.assign(old,p);else state.projects.push(p);save();closeModal();render();};if(old)document.getElementById('delete-project').onclick=()=>{if(confirm('¿Eliminar encargo?')){state.projects=state.projects.filter(x=>x.id!==old.id);state.blocks=state.blocks.filter(x=>x.projectId!==old.id);save();closeModal();render();}};}
  function blockModal(){modal(`<div class="modal-head"><div class="card-title">Crear bloque</div><button class="btn btn-small" data-close>✕</button></div><div class="form-grid">${field('Proyecto',`<select id="b-pr" class="select">${state.projects.filter(p=>p.status!=='Completado').map(p=>`<option value="${p.id}">${esc(p.client)} · ${esc(p.name)}</option>`).join('')}</select>`,'full')}${field('Persona',`<select id="b-pe" class="select">${state.people.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>`)}${field('Día',`<select id="b-day" class="select">${DAYS.map(d=>`<option>${d}</option>`).join('')}</select>`)}${field('Horas',`<input id="b-hours" class="input" type="number" step=".5" value="2">`)}</div><div style="text-align:right;margin-top:14px"><button id="save-block" class="btn btn-primary">Crear</button></div>`);document.getElementById('save-block').onclick=()=>{state.blocks.push(block(uid('b'),val('b-pr'),val('b-pe'),val('b-day'),Number(val('b-hours'))||2));save();closeModal();render();};}
  function field(label,html,cls=''){return `<label class="field ${cls}"><span>${label}</span>${html}</label>`;}
  function val(id){return document.getElementById(id).value.trim();}
  function modal(html){document.getElementById('modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal">${html}</div></div>`;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);document.querySelector('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();};}
  function closeModal(){document.getElementById('modal-root').innerHTML='';}

  function csvModal(){modal(`<div class="modal-head"><div><div class="card-title">Importar CSV</div><div class="small muted">El archivo se procesa solo en tu navegador.</div></div><button class="btn btn-small" data-close>✕</button></div><input id="csv-file" class="input" type="file" accept=".csv,text/csv"><div id="csv-body" class="notice good" style="margin-top:12px">Exporta vuestro Excel/Sheets como CSV y selecciónalo aquí.</div>`);document.getElementById('csv-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>previewCsv(String(r.result||''));r.readAsText(f);};}
  function previewCsv(text){const sep=(text.split(/\r?\n/)[0]||'').includes(';')?';':',';const lines=text.split(/\r?\n/).filter(Boolean);const parse=l=>{let a=[],c='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(ch==='"')q=!q;else if(ch===sep&&!q){a.push(c.trim());c='';}else c+=ch;}a.push(c.trim());return a;};const rows=lines.map(parse),heads=rows.shift()||[];const options='<option value="">—</option>'+heads.map((h,i)=>`<option value="${i}">${esc(h)}</option>`).join('');document.getElementById('csv-body').outerHTML=`<div id="csv-body"><div class="csv-map">${[['client','Cliente'],['name','Proyecto'],['desc','Descripción'],['due','Entrega'],['status','Estado'],['budgetHours','H. presup.'],['responsible','Responsable'],['comments','Comentarios']].map(([k,l])=>`<label class="field">${l}<select class="select csvsel" data-key="${k}">${options}</select></label>`).join('')}</div><div style="overflow:auto"><table class="preview-table"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,5).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div style="text-align:right;margin-top:10px"><button id="csv-import" class="btn btn-primary">Importar filas</button></div></div>`;const aliases={client:['cliente'],name:['proyecto'],desc:['descrip'],due:['entrega','fecha'],status:['estado'],budgetHours:['horas','presup'],responsible:['responsable','ejecuta'],comments:['coment']};document.querySelectorAll('.csvsel').forEach(s=>{const idx=heads.findIndex(h=>aliases[s.dataset.key]?.some(a=>h.toLowerCase().includes(a)));if(idx>=0)s.value=idx;});document.getElementById('csv-import').onclick=()=>{const map={};document.querySelectorAll('.csvsel').forEach(s=>map[s.dataset.key]=s.value===''?null:Number(s.value));if(map.client==null||map.name==null)return alert('Mapea Cliente y Proyecto.');rows.forEach(r=>{if(!r[map.client]&&!r[map.name])return;const found=state.people.find(p=>map.responsible!=null&&p.name.toLowerCase()===String(r[map.responsible]||'').toLowerCase());let st=map.status!=null?r[map.status]:'Pendiente';if(!STATUSES.includes(st))st='Pendiente';const np=proj(uid('a'),r[map.client]||'',r[map.name]||'',map.desc!=null?r[map.desc]||'':'',map.due!=null?dateFix(r[map.due]):'',st,(found||state.people[0]).id,map.budgetHours!=null?Number(String(r[map.budgetHours]||'0').replace(',','.'))||0:0,0,map.comments!=null?r[map.comments]||'':'');state.projects.push(np);});save();closeModal();render();};}
  function dateFix(s){s=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);return m?`${m[3].length===2?'20'+m[3]:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:'';}

  render();
})();
