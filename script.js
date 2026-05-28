/* ============ DATA ============ */
const PROFESIONALES = {
  david: { nombre:"Dr. David Velásquez", esp:"Odontólogo General", foto:"assets/dr-david.jpg" },
  lina:  { nombre:"Dra. Lina Olivera",   esp:"Ortodoncista",        foto:"assets/dra-lina.jpg" },
  rosa:  { nombre:"Dra. Rosa Pacheco",   esp:"Odontopediatra",      foto:"assets/dra-rosa.jpg" },
};
const SERVICIOS = [
  {id:"general",ico:"🦷",titulo:"Odontología General",desc:"Diagnóstico, limpiezas profundas, carillas y tratamientos básicos.",detalle:"Incluye revisión clínica, profilaxis dental, eliminación de caries, restauraciones con resina, fluorización y educación en higiene oral.",precio:"$90.000 COP",duracion:"45 min",prof:"david"},
  {id:"orto",ico:"⚙️",titulo:"Ortodoncia",desc:"Brackets metálicos, estéticos o alineadores invisibles.",detalle:"Evaluación con radiografía panorámica, plan de tratamiento personalizado y seguimiento mensual para todas las edades.",precio:"Desde $1.800.000 COP",duracion:"18-24 meses",prof:"lina"},
  {id:"blanq",ico:"✨",titulo:"Blanqueamiento",desc:"Tratamiento estético profesional para recuperar el blanco natural.",detalle:"Blanqueamiento en consultorio con gel activado por luz LED. Aclara hasta 8 tonos en una sesión, sin dañar el esmalte.",precio:"$380.000 COP",duracion:"60 min",prof:"david"},
  {id:"pedia",ico:"🧒",titulo:"Odontopediatría",desc:"Atención especializada para niños con paciencia y juegos.",detalle:"Consultas adaptadas desde los 3 años. Aplicación de selladores, fluor, control de hábitos y manejo emocional.",precio:"$70.000 COP",duracion:"30 min",prof:"rosa"},
  {id:"urg",ico:"⏰",titulo:"Urgencias 24h",desc:"¿Dolor, fractura o emergencia? Te atendemos rápido.",detalle:"Atención inmediata para dolor agudo, fracturas, abscesos y pérdida de coronas. WhatsApp 24/7.",precio:"$130.000 COP",duracion:"30-60 min",prof:"david"},
  {id:"rx",ico:"📷",titulo:"Radiografías Digitales",desc:"Rayos X digitales con baja radiación y diagnóstico preciso.",detalle:"Radiografías periapicales y panorámicas con tecnología digital de baja dosis. Resultados al instante.",precio:"Desde $45.000 COP",duracion:"10-20 min",prof:"david"},
];

/* ============ RENDER ============ */
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>el.querySelectorAll(s);

function renderServicios(){
  $("#serviciosGrid").innerHTML = SERVICIOS.map(s=>`
    <article class="card servicio" data-id="${s.id}">
      <div class="ico">${s.ico}</div>
      <h3>${s.titulo}</h3>
      <p>${s.desc}</p>
      <span class="more">Ver más →</span>
    </article>`).join('');
  $$('.servicio').forEach(c=>c.addEventListener('click',()=>openServicio(c.dataset.id)));

  const sel = $("#selServicio");
  sel.innerHTML = '<option value="">Selecciona…</option>' +
    SERVICIOS.map(s=>`<option value="${s.titulo}">${s.titulo}</option>`).join('');
}

function renderEquipo(){
  $("#equipoGrid").innerHTML = Object.values(PROFESIONALES).map(p=>`
    <article class="card profesional">
      <img src="${p.foto}" alt="${p.nombre}" loading="lazy"/>
      <h3>${p.nombre}</h3>
      <span>${p.esp}</span>
    </article>`).join('');
}

function openServicio(id){
  const s = SERVICIOS.find(x=>x.id===id); if(!s) return;
  const p = PROFESIONALES[s.prof];
  $("#servicioModalContent").innerHTML = `
    <button class="modal-close" data-close>×</button>
    <div class="ico-lg">${s.ico}</div>
    <h3>${s.titulo}</h3>
    <p style="color:var(--muted)">${s.detalle}</p>
    <div class="meta">
      <div><strong>${s.precio}</strong>Precio</div>
      <div><strong>${s.duracion}</strong>Duración</div>
      <div><strong>${p.nombre.split(' ').slice(0,2).join(' ')}</strong>${p.esp}</div>
    </div>
    <button class="btn btn-primary btn-lg" id="goAgendar">Agendar este servicio</button>`;
  showModal('#servicioModal');
  $("#goAgendar").onclick = ()=>{
    closeModals();
    $("#selServicio").value = s.titulo;
    document.getElementById('contacto').scrollIntoView({behavior:'smooth'});
  };
}

/* ============ MODALS ============ */
function showModal(sel){ const m=$(sel); m.classList.remove('hidden'); document.body.style.overflow='hidden'; }
function closeModals(){ $$('.modal').forEach(m=>m.classList.add('hidden')); document.body.style.overflow=''; }
document.addEventListener('click',e=>{ if(e.target.matches('[data-close],.modal-backdrop')) closeModals(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModals(); });

/* ============ NAV ============ */
addEventListener('scroll',()=>{
  $("#navbar").classList.toggle('scrolled',scrollY>20);
});
$("#burger").onclick = ()=>$("#navbar").classList.toggle('menu-open');
$$('#navbar nav a').forEach(a=>a.onclick=()=>$("#navbar").classList.remove('menu-open'));

/* ============ AUTH — SEGURO (PBKDF2-SHA256) ============ */
const AUTH_KEY = 'sonrie_users_v1';
const SESSION_KEY = 'sonrie_session_v1';
const ITER = 210000;

const toHex = buf => [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const fromHex = hex => new Uint8Array(hex.match(/.{2}/g).map(b=>parseInt(b,16)));

async function hashPassword(password, salt){
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {name:'PBKDF2', salt, iterations:ITER, hash:'SHA-256'},
    keyMat, 256
  );
  return toHex(bits);
}

function getUsers(){ try{return JSON.parse(localStorage.getItem(AUTH_KEY))||{}}catch{return{}} }
function saveUsers(u){ localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function getSession(){
  try{
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if(!s || s.exp < Date.now()) return null;
    return s;
  }catch{return null}
}
function setSession(email,nombre){
  const s = {email,nombre,exp:Date.now()+1000*60*60*24*7}; // 7 days
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

function validatePassword(p){
  if(p.length<8) return 'Mínimo 8 caracteres';
  if(!/[A-Z]/.test(p)) return 'Falta una mayúscula';
  if(!/[0-9]/.test(p)) return 'Falta un número';
  return null;
}
function passwordStrength(p){
  let s=0; if(p.length>=8)s++; if(p.length>=12)s++;
  if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++;
  return s;
}

async function signup(nombre,email,password){
  const err = validatePassword(password); if(err) throw new Error(err);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Correo inválido');
  const users = getUsers();
  if(users[email]) throw new Error('Ya existe una cuenta con ese correo');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  users[email] = { nombre, salt:toHex(salt), hash, created:Date.now(), failed:0, lockedUntil:0 };
  saveUsers(users);
  setSession(email,nombre);
}

async function login(email,password){
  const users = getUsers();
  const u = users[email];
  if(!u) throw new Error('Credenciales incorrectas');
  if(u.lockedUntil > Date.now()){
    const min = Math.ceil((u.lockedUntil-Date.now())/60000);
    throw new Error(`Cuenta bloqueada. Intenta en ${min} min.`);
  }
  const hash = await hashPassword(password, fromHex(u.salt));
  if(hash !== u.hash){
    u.failed = (u.failed||0)+1;
    if(u.failed>=5){ u.lockedUntil = Date.now()+15*60000; u.failed=0; }
    saveUsers(users);
    throw new Error('Credenciales incorrectas');
  }
  u.failed = 0; saveUsers(users);
  setSession(email,u.nombre);
}

function refreshAuthUI(){
  const s = getSession();
  const badge = $("#userBadge"), btn = $("#btnAuth");
  if(s){
    badge.textContent = `👋 ${s.nombre.split(' ')[0]}`;
    badge.classList.remove('hidden');
    btn.textContent = 'Salir';
    btn.onclick = ()=>{ clearSession(); refreshAuthUI(); };
    // autofill
    const f = $("#formContacto");
    if(!f.nombre.value) f.nombre.value = s.nombre;
    if(!f.email.value)  f.email.value  = s.email;
  } else {
    badge.classList.add('hidden');
    btn.textContent = 'Ingresar';
    btn.onclick = ()=>showModal('#authModal');
  }
}

/* ============ AUTH FORMS ============ */
$$('.tab').forEach(t=>t.onclick=()=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  const isLogin = t.dataset.tab==='login';
  $("#formLogin").classList.toggle('hidden',!isLogin);
  $("#formSignup").classList.toggle('hidden',isLogin);
});

$("#formLogin").onsubmit = async e=>{
  e.preventDefault();
  const msg = $("#loginMsg"); msg.textContent='Verificando…'; msg.className='auth-msg';
  const fd = new FormData(e.target);
  try{
    await login(fd.get('email').trim().toLowerCase(), fd.get('password'));
    msg.textContent='¡Bienvenido!'; msg.className='auth-msg ok';
    setTimeout(()=>{closeModals(); refreshAuthUI();},600);
  }catch(err){ msg.textContent=err.message; msg.className='auth-msg err'; }
};

$("#formSignup").onsubmit = async e=>{
  e.preventDefault();
  const msg = $("#signupMsg"); msg.textContent='Creando cuenta…'; msg.className='auth-msg';
  const fd = new FormData(e.target);
  try{
    await signup(fd.get('nombre').trim(), fd.get('email').trim().toLowerCase(), fd.get('password'));
    msg.textContent='¡Cuenta creada!'; msg.className='auth-msg ok';
    setTimeout(()=>{closeModals(); refreshAuthUI();},600);
  }catch(err){ msg.textContent=err.message; msg.className='auth-msg err'; }
};

$("#formSignup").querySelector('input[name=password]').addEventListener('input',e=>{
  const s = passwordStrength(e.target.value);
  const bar = $("#strengthBar");
  const colors = ['#ef4444','#f97316','#eab308','#84cc16','#22c55e'];
  bar.style.width = (s*20)+'%';
  bar.style.background = colors[Math.max(0,s-1)]||'#ef4444';
});

/* ============ CONTACTO ============ */
$("#formContacto").onsubmit = async e=>{
  e.preventDefault();
  const msg = $("#formMsg"); msg.textContent='Enviando…'; msg.className='form-msg';
  const form = e.target;
  if(!form.checkValidity()){ msg.textContent='Revisa los campos.'; msg.className='form-msg err'; return; }
  try{
    const fd = new FormData(form);
    const res = await fetch('https://formsubmit.co/ajax/delahozjostin6@gmail.com',{
      method:'POST',headers:{'Accept':'application/json'},body:fd
    });
    if(!res.ok) throw new Error();
    msg.textContent='✓ ¡Solicitud enviada! Te contactaremos pronto.';
    msg.className='form-msg ok';
    form.reset(); refreshAuthUI();
  }catch{
    msg.textContent='No se pudo enviar. Escríbenos por WhatsApp.';
    msg.className='form-msg err';
  }
};

/* ============ INIT ============ */
renderServicios();
renderEquipo();
refreshAuthUI();
$("#year").textContent = new Date().getFullYear();
