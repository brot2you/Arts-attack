/* Arts Attack! — noyau commun : stockage unique, navigation, carnet, lexique, amorces */
(() => {
'use strict';
const KEY = 'arts-attack-v6';
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

/* ---------- Stockage ---------- */
const blank = () => ({ v: 6, journal: [], missions: {}, museum: {}, techniques: {}, lab: null, prefs: { grade: '6e' }, lastBackup: null });
let memoryOnly = false;
function readRaw(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }

function migrate() {
  const s = blank();
  const j = readRaw('arts-attack-v1-journal');
  if (Array.isArray(j)) j.slice().reverse().forEach((e, i) => {
    const t = String(e.title || '');
    const type = t.startsWith('Studio') ? 'creation' : t.startsWith('Duel') ? 'musee' : 'mission';
    s.journal.unshift({ id: 'old' + i + '-' + Date.now().toString(36), type, title: t, detail: t.startsWith('Studio') ? '' : String(e.choice || ''), reflection: String(e.reflection || ''), image: null, date: String(e.date || '') });
  });
  const m = readRaw('arts-attack-v3-progress'); if (m && typeof m === 'object') for (const [id, v] of Object.entries(m)) s.missions[id] = { done: true, reflection: v.reflection || '' };
  const mu = readRaw('arts-attack-museum-v4'); if (mu && typeof mu === 'object') for (const [id, v] of Object.entries(mu)) if (v && (v.solved || v.collected)) s.museum[id] = { solved: !!v.solved, collected: true };
  const te = readRaw('arts-attack-techniques-v6'); if (te && typeof te === 'object') s.techniques = te;
  const lab = readRaw('arts-attack-lab-v7'); if (lab && lab.image) s.lab = { image: lab.image, reflection: lab.reflection || '' };
  return s;
}

let state = (() => {
  const saved = readRaw(KEY);
  if (saved && saved.v === 6) return Object.assign(blank(), saved);
  return migrate();
})();

function save() {
  if (memoryOnly) return true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) toast('Le carnet est plein sur cet appareil. Sauvegarde-le (Carnet → Sauvegarder), puis supprime d\'anciennes pages.', 7000);
    else { memoryOnly = true; toast('Cet appareil n\'autorise pas l\'enregistrement : tes travaux seront perdus à la fermeture. Télécharge tes images.', 7000); }
    return false;
  }
}

/* ---------- Utilitaires ---------- */
let toastTimer;
function toast(msg, ms = 3200, action) {
  const t = $('toast'); t.replaceChildren(el('span', '', msg));
  if (action) { const b = el('button', '', action.label); b.type = 'button'; b.onclick = () => { t.hidden = true; action.run(); }; t.append(b); }
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
function today() { return new Date().toLocaleDateString('fr-FR'); }
function thumb(canvas, maxW = 720) {
  const r = Math.min(1, maxW / canvas.width), c = document.createElement('canvas');
  c.width = Math.round(canvas.width * r); c.height = Math.round(canvas.height * r);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.75);
}
function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; document.body.append(a); a.click(); a.remove(); }
let lastImage = null;

function addEntry({ type, title, detail = '', reflection = '', image = null }) {
  const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type, title, detail, reflection: String(reflection).trim().slice(0, 800), image, date: today() };
  state.journal.unshift(entry);
  if (image) lastImage = { image, title };
  if (!save()) { state.journal.shift(); if (!memoryOnly) return null; state.journal.unshift(entry); }
  refreshCounter();
  toast('Ajouté à ton carnet ✓', 3500, { label: 'Voir', run: () => view('carnet') });
  return entry;
}

/* ---------- Navigation ---------- */
const actions = {};
function view(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('current', v.id === id));
  document.querySelectorAll('.nav').forEach(n => { const on = n.dataset.view === id; n.classList.toggle('active', on); if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current'); });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (id === 'carnet') renderJournal();
  document.dispatchEvent(new CustomEvent('aa:view', { detail: id }));
}
document.addEventListener('click', e => {
  const v = e.target.closest('[data-view]'); if (v) { view(v.dataset.view); return; }
  const w = e.target.closest('[data-world]'); if (w && actions.world) actions.world(w.dataset.world);
  if (e.target.closest('[data-lexique]')) openLexique();
});

/* ---------- Niveau partagé ---------- */
function setGrade(g) { if (!['6e', '5e', '4e', '3e'].includes(g)) return; state.prefs.grade = g; save(); document.querySelectorAll('[data-grade-select]').forEach(s => { if (s.value !== g) { s.value = g; s.dispatchEvent(new Event('change')); } }); }
document.querySelectorAll('[data-grade-select]').forEach(s => { s.value = state.prefs.grade || '6e'; s.addEventListener('change', () => { if (s.value !== 'all' && s.value !== state.prefs.grade) setGrade(s.value); }); });

/* ---------- Compteur ---------- */
function refreshCounter() {
  const n = state.journal.length;
  $('pageCount').textContent = n; $('pageLabel').textContent = n > 1 ? 'pages' : 'page';
  $('cardCount').textContent = Object.values(state.museum).filter(v => v.collected).length;
}

/* ---------- Amorces de phrase ---------- */
const STARTERS = ['Je voulais montrer…', 'J\'ai choisi … parce que…', 'Le spectateur voit d\'abord…', 'J\'ai joué sur la notion de …', 'Cela crée une impression de…', 'Si je recommençais, je changerais…'];
function attachStarters(ta) {
  if (!ta || ta.dataset.startersReady) return; ta.dataset.startersReady = '1';
  const box = el('div', 'starters'); box.setAttribute('aria-label', 'Débuts de phrase');
  STARTERS.forEach(s => {
    const b = el('button', 'chip', s); b.type = 'button';
    b.addEventListener('click', () => {
      const pos = ta.selectionStart ?? ta.value.length, before = ta.value.slice(0, pos), after = ta.value.slice(pos);
      const sep = before && !/\s$/.test(before) ? ' ' : '', ins = s.replace('…', '').replace(' … ', ' ');
      ta.value = before + sep + ins + after; ta.focus(); const p = (before + sep + ins).length; ta.setSelectionRange(p, p); ta.dispatchEvent(new Event('input'));
    });
    box.append(b);
  });
  const lex = el('button', 'chip lexchip', '📖 Lexique'); lex.type = 'button'; lex.addEventListener('click', () => openLexique(ta)); box.append(lex);
  ta.after(box);
}
document.querySelectorAll('textarea[data-starters]').forEach(attachStarters);
new MutationObserver(() => document.querySelectorAll('textarea[data-starters]:not([data-starters-ready])').forEach(attachStarters)).observe(document.body, { childList: true, subtree: true });

/* ---------- Lexique ---------- */
const LEX = [
  ['Composition', 'Cadrage', 'Choix de ce qui entre dans l\'image et de ce qui reste hors du cadre (hors-champ).'],
  ['Composition', 'Composition', 'Organisation des éléments dans l\'image : leur place, leur taille, leurs relations.'],
  ['Composition', 'Équilibre / déséquilibre', 'Impression de stabilité ou d\'instabilité produite par la répartition des éléments.'],
  ['Composition', 'Rythme', 'Répétition d\'éléments avec des variations ; une rupture crée la surprise.'],
  ['Composition', 'Plans', 'Premier plan, second plan, arrière-plan : ils donnent la profondeur.'],
  ['Espace', 'Point de vue', 'Place d\'où l\'on regarde : face, plongée (d\'en haut), contre-plongée (d\'en bas).'],
  ['Espace', 'Perspective', 'Procédé pour représenter la profondeur sur une surface plane, par exemple avec un point de fuite.'],
  ['Espace', 'Échelle', 'Rapport de taille entre les éléments, ou entre l\'œuvre et le spectateur.'],
  ['Espace', 'Plein / vide', 'En sculpture, les vides comptent autant que la matière pour guider le regard.'],
  ['Couleur', 'Couleurs primaires', 'Rouge (magenta), bleu (cyan), jaune : on ne peut pas les obtenir par mélange.'],
  ['Couleur', 'Complémentaires', 'Couleurs opposées (bleu/orange, rouge/vert, jaune/violet) qui se renforcent côte à côte.'],
  ['Couleur', 'Couleurs chaudes / froides', 'Rouges, orangés, jaunes paraissent chauds ; bleus, verts paraissent froids.'],
  ['Couleur', 'Contraste', 'Forte différence (de couleur, de taille, de lumière) qui attire le regard.'],
  ['Couleur', 'Camaïeu', 'Image réalisée avec les nuances d\'une seule couleur.'],
  ['Couleur', 'Saturation', 'Intensité d\'une couleur : vive (saturée) ou ternie (désaturée).'],
  ['Lumière', 'Valeur', 'Degré de clair ou de foncé d\'une couleur ou d\'un gris.'],
  ['Lumière', 'Clair-obscur', 'Fort contraste entre zones éclairées et zones sombres.'],
  ['Lumière', 'Ombre propre / portée', 'L\'ombre propre est sur l\'objet ; l\'ombre portée est projetée à côté de lui.'],
  ['Geste', 'Touche', 'Trace laissée par le pinceau : visible, lisse, épaisse, rapide…'],
  ['Geste', 'Trace', 'Marque laissée par un outil, une main, un objet : elle garde la mémoire du geste.'],
  ['Matière', 'Texture', 'Aspect de la surface : lisse, rugueux, granuleux, brillant…'],
  ['Matière', 'Matériau', 'Ce qui constitue l\'œuvre : papier, argile, bois, plastique, objets…'],
  ['Matière', 'Empreinte', 'Trace obtenue en pressant un objet ou une surface sur un support.'],
  ['Forme', 'Figuratif / abstrait', 'Une œuvre figurative représente quelque chose de reconnaissable ; une œuvre abstraite non.'],
  ['Forme', 'Formes géométriques / organiques', 'Géométriques : régulières (cercle, carré). Organiques : libres, comme dans la nature.'],
  ['Objet', 'Détournement', 'Faire changer la fonction ou le sens d\'un objet ou d\'une image.'],
  ['Objet', 'Assemblage', 'Œuvre construite en réunissant des objets ou des matériaux différents.'],
  ['Objet', 'Ready-made', 'Objet manufacturé choisi par l\'artiste et présenté comme œuvre (Marcel Duchamp).'],
  ['Exposer', 'Cartel', 'Petit texte à côté de l\'œuvre : artiste, titre, date, technique, lieu de conservation.'],
  ['Exposer', 'Installation', 'Œuvre qui occupe un lieu et que le spectateur parcourt.'],
  ['Exposer', 'Scénographie', 'Façon d\'organiser une exposition : parcours, lumière, accrochage.'],
  ['Temps', 'Séquence', 'Suite d\'images qui raconte ou montre une transformation.'],
  ['Démarche', 'Intention', 'Ce que l\'artiste veut faire ressentir ou comprendre au spectateur.'],
  ['Démarche', 'Esquisse', 'Premier dessin rapide pour chercher une idée avant la réalisation.']
];
let lexTarget = null;
function renderLex(q = '') {
  const list = $('lexList'); list.replaceChildren();
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nq = norm(q); let group = null, dl = null, count = 0;
  for (const [g, term, def] of LEX) {
    if (nq && !norm(term + ' ' + def + ' ' + g).includes(nq)) continue;
    if (g !== group) { group = g; list.append(el('h3', '', g)); dl = el('dl'); list.append(dl); }
    const dt = el('dt'); const b = el('button', 'lexterm', term); b.type = 'button'; b.title = lexTarget ? 'Ajouter ce mot à ton texte' : '';
    b.addEventListener('click', () => { if (!lexTarget) return; const ta = lexTarget; ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + term.split(' /')[0].toLowerCase(); closeLex(); ta.focus(); ta.dispatchEvent(new Event('input')); });
    dt.append(b); dl.append(dt, el('dd', '', def)); count++;
  }
  if (!count) list.append(el('p', 'empty', 'Aucun mot trouvé. Essaie un autre mot, par exemple « couleur ».'));
  list.classList.toggle('insertable', !!lexTarget);
}
let lexReturn = null;
function openLexique(target) { lexTarget = target instanceof HTMLTextAreaElement ? target : null; lexReturn = document.activeElement; $('lexSearch').value = ''; renderLex(); $('lexique').hidden = false; document.body.classList.add('modal-open'); $('lexSearch').focus(); }
function closeLex() { $('lexique').hidden = true; document.body.classList.remove('modal-open'); if (lexReturn && lexReturn.focus) lexReturn.focus(); }
$('lexSearch').addEventListener('input', e => renderLex(e.target.value));
$('lexique').addEventListener('click', e => { if (e.target.id === 'lexique' || e.target.closest('[data-close]')) closeLex(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('lexique').hidden) closeLex(); });

/* ---------- Carnet ---------- */
const TYPES = { mission: '🚀 Mission', creation: '🎨 Création', technique: '🧰 Technique', musee: '🏛️ Musée' };
function renderJournal() {
  const j = $('journal'), f = $('journalFilter').value; j.replaceChildren();
  const list = state.journal.filter(e => f === 'all' || e.type === f);
  $('printDate').textContent = today();
  if (!list.length) {
    const p = el('div', 'empty-state');
    p.append(el('p', '', state.journal.length ? 'Rien dans cette catégorie pour l\'instant.' : 'Ton carnet est vide. Lance une mission ou crée dans l\'Atelier : chaque travail enregistré devient une page.'));
    const b = el('button', 'mini', 'Aller à l\'Atelier'); b.type = 'button'; b.dataset.view = 'atelier'; p.append(b); j.append(p);
  }
  for (const e of list) {
    const a = el('article', 'page');
    if (e.image) { const img = el('img'); img.src = e.image; img.alt = 'Ma création : ' + e.title; img.loading = 'lazy'; a.append(img); }
    const body = el('div', 'page-body');
    body.append(el('span', 'page-type', TYPES[e.type] || '📒'), el('h3', '', e.title));
    if (e.detail) body.append(el('p', 'page-detail', e.detail));
    if (e.reflection) { const q = el('blockquote', '', e.reflection); body.append(q); }
    body.append(el('small', '', e.date));
    const tools = el('div', 'page-tools no-print');
    if (e.image) { const d = el('button', 'linkish', '⬇ Image'); d.type = 'button'; d.onclick = () => download(e.image, 'arts-attack-' + e.date.replace(/\//g, '-') + '.jpg'); tools.append(d); }
    const del = el('button', 'linkish danger', 'Supprimer'); del.type = 'button';
    del.onclick = () => { if (!confirm('Supprimer cette page du carnet ?')) return; state.journal = state.journal.filter(x => x.id !== e.id); save(); refreshCounter(); renderJournal(); };
    tools.append(del); body.append(tools); a.append(body); j.append(a);
  }
  const hint = $('backupHint'), old = !state.lastBackup || (Date.now() - state.lastBackup) > 14 * 864e5;
  hint.hidden = !(state.journal.length >= 3 && old);
  if (!hint.hidden) hint.textContent = state.lastBackup ? 'Ta dernière sauvegarde date de plus de deux semaines. Pense à sauvegarder ton carnet.' : 'Ton carnet n\'a jamais été sauvegardé. Si le navigateur est vidé, tout disparaît : clique sur « Sauvegarder ».';
}
$('journalFilter').addEventListener('change', renderJournal);
$('printJournal').addEventListener('click', () => { renderJournal(); window.print(); });
$('exportJournal').addEventListener('click', () => {
  const data = JSON.stringify({ app: 'arts-attack', version: 6, exported: new Date().toISOString(), state }, null, 0);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  download(url, 'carnet-arts-attack-' + new Date().toISOString().slice(0, 10) + '.json'); setTimeout(() => URL.revokeObjectURL(url), 2000);
  state.lastBackup = Date.now(); save(); renderJournal(); toast('Carnet sauvegardé dans tes téléchargements ✓');
});
$('importJournal').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.app !== 'arts-attack' || !parsed.state || !Array.isArray(parsed.state.journal)) throw new Error('format');
    const inc = parsed.state, ids = new Set(state.journal.map(x => x.id));
    const added = inc.journal.filter(x => x && x.id && !ids.has(x.id));
    state.journal = state.journal.concat(added);
    for (const k of ['missions', 'museum', 'techniques']) state[k] = Object.assign({}, inc[k] || {}, state[k]);
    if (!state.lab && inc.lab) state.lab = inc.lab;
    save(); refreshCounter(); renderJournal(); document.dispatchEvent(new Event('aa:restored'));
    toast(added.length ? added.length + ' page(s) restaurée(s) ✓' : 'Ce fichier ne contenait pas de nouvelle page.');
  } catch { toast('Ce fichier n\'est pas une sauvegarde Arts Attack! valide.', 5000); }
});
$('reset').addEventListener('click', () => {
  if (!confirm('Effacer tout le carnet, les missions, les cartes et les techniques de cet appareil ? Pense à sauvegarder avant.')) return;
  const prefs = state.prefs; state = blank(); state.prefs = prefs; save(); refreshCounter(); renderJournal(); document.dispatchEvent(new Event('aa:restored'));
});

/* ---------- Défi du jour (le même pour toute la journée) ---------- */
const DAILY = [
  ['Transforme trois formes simples en une image qui raconte une rencontre.', 'formes', 'composition'],
  ['Crée une image expressive avec deux couleurs complémentaires et trois épaisseurs de trait.', 'dessin'],
  ['Fais apparaître un premier plan, un arrière-plan et un point de fuite.', 'dessin'],
  ['Imagine une nouvelle vie pour un objet du quotidien.', 'express', 'objet'],
  ['Évoque une matière rugueuse et une matière lisse sur la même toile.', 'dessin'],
  ['Compose une image calme avec des formes, puis une version agitée.', 'formes', 'couleur'],
  ['Crée un paysage imaginaire sans aucun contour noir.', 'dessin'],
  ['Choisis où exposer une sculpture pour surprendre le spectateur.', 'express', 'expo'],
  ['Donne un nouveau sens à une forme en changeant son échelle et son orientation.', 'formes', 'transformation']
];
const d = new Date(), dayIndex = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5) % DAILY.length;
const daily = DAILY[dayIndex];
$('dailyText').textContent = daily[0];
$('dailyGo').addEventListener('click', () => { const fn = actions[daily[1]]; if (fn) fn(daily[2] || daily[0]); });

/* ---------- API partagée ---------- */
window.AA = { get state() { return state; }, save, toast, view, addEntry, thumb, download, attachStarters, openLexique, refreshCounter, actions, get lastImage() { return lastImage; }, setLastImage: (img, title) => { lastImage = { image: img, title }; }, el };
refreshCounter();
if (!readRaw(KEY)) save();
})();
