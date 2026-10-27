/* Arts Attack! — Atelier : composer avec des formes + dessiner et peindre */
(() => {
'use strict';
const AA = window.AA, $ = id => document.getElementById(id), el = AA.el;

/* ================= Onglets ================= */
const tabs = [...document.querySelectorAll('[role=tab]')];
function showTab(name) {
  tabs.forEach(t => { const on = t.dataset.tab === name; t.classList.toggle('selected', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
  $('panelFormes').hidden = name !== 'formes'; $('panelDessin').hidden = name !== 'dessin';
  if (name === 'formes') drawShapes();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => showTab(t.dataset.tab));
  t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); showTab(n.dataset.tab); } });
});

/* ================= Composer avec des formes ================= */
const cv = $('artCanvas'), ctx = cv.getContext('2d'), W = 800, H = 520;
const THEMES = {
  composition: ['Composition expressive', 'Dispose des formes pour raconter une rencontre. Joue sur la place, la taille et l\'équilibre.', 'Une forme plus grande ou isolée attire souvent le regard en premier.'],
  couleur: ['Le laboratoire des contrastes', 'Change les couleurs de chaque forme. Compare une palette proche (harmonie) et des couleurs opposées (contraste).', 'Deux complémentaires côte à côte se renforcent : bleu/orange, rouge/vert, jaune/violet.'],
  transformation: ['Métamorphoses', 'Transforme une forme par l\'échelle, la rotation et la superposition pour lui donner un nouveau sens.', 'Une même forme peut devenir paysage, personnage ou objet selon son contexte.']
};
const PRESETS = {
  composition: [['circle', 190, 250, 75, '#f72585', 0], ['triangle', 400, 205, 94, '#00b9e8', .25], ['square', 600, 295, 65, '#f7c400', -.2]],
  couleur: [['circle', 230, 270, 120, '#ff207e', 0], ['circle', 400, 235, 130, '#0abde3', 0], ['circle', 570, 280, 100, '#ffdf1b', 0]],
  transformation: [['square', 300, 280, 105, '#f72585', .48], ['triangle', 475, 240, 110, '#00b9e8', -.3], ['line', 530, 390, 95, '#182033', -.7]]
};
let touchTol = 10, mode = 'composition', scenes = {}, objects = [], history = [], sel = -1, drag = null, bg = '#fdf9ed', editing = false;
const DEFAULT_COLORS = ['#f72585', '#00b9e8', '#f7c400', '#2ec27e', '#7b2ff7', '#ff7a00', '#12172a'];

function snapshot() { history.push(JSON.stringify({ objects, bg })); if (history.length > 50) history.shift(); }
function shapePath(c, o) {
  const s = o.size; c.beginPath();
  if (o.type === 'square') c.rect(-s / 2, -s / 2, s, s);
  else if (o.type === 'triangle') { c.moveTo(0, -s * .65); c.lineTo(s * .65, s * .48); c.lineTo(-s * .65, s * .48); c.closePath(); }
  else if (o.type === 'line') { c.moveTo(-s * .6, s * .5); c.lineTo(s * .6, -s * .5); }
  else if (o.type === 'arc') c.arc(0, 0, s * .5, Math.PI, Math.PI * 2);
  else c.arc(0, 0, s * .52, 0, Math.PI * 2);
}
function drawShapes(withSelection = true) {
  ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  objects.forEach((o, i) => {
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.angle); ctx.globalAlpha = o.alpha ?? 1;
    ctx.shadowColor = '#10162944'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
    shapePath(ctx, o);
    const stroked = o.type === 'line' || o.type === 'arc';
    ctx.lineCap = 'round';
    if (stroked) { ctx.strokeStyle = o.color; ctx.lineWidth = Math.max(8, o.size * .14); ctx.stroke(); }
    else { ctx.fillStyle = o.color; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#12172a'; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.restore();
    if (withSelection && i === sel) {
      ctx.save(); ctx.translate(o.x, o.y); ctx.setLineDash([7, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = bg === '#16243b' || bg === '#111111' ? '#ffe23c' : '#0a63c9';
      const r = o.size * .78 + 10; ctx.strokeRect(-r, -r, r * 2, r * 2); ctx.restore();
    }
  });
  const n = objects.length;
  $('studioStatus').textContent = n ? `${n} forme${n > 1 ? 's' : ''} sur la toile${sel >= 0 ? ' · forme sélectionnée : déplace-la ou modifie-la à gauche' : ''}` : 'Toile vide : ajoute une forme.';
}
function hit(o, p) {
  const dx = p.x - o.x, dy = p.y - o.y, c = Math.cos(-o.angle), s = Math.sin(-o.angle);
  const x = dx * c - dy * s, y = dx * s + dy * c, z = o.size, tol = touchTol;
  if (o.type === 'square') return Math.abs(x) <= z / 2 + tol && Math.abs(y) <= z / 2 + tol;
  if (o.type === 'triangle') { if (y < -z * .65 - tol || y > z * .48 + tol) return false; const half = (y + z * .65) / (1.13 * z) * z * .65; return Math.abs(x) <= half + tol; }
  if (o.type === 'line') { const ax = -z * .6, ay = z * .5, bx = z * .6, by = -z * .5, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2))); return Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) < Math.max(14, z * .1) + tol; }
  if (o.type === 'arc') { const d = Math.hypot(x, y); return Math.abs(d - z * .5) < Math.max(14, z * .1) + tol && y <= tol; }
  return Math.hypot(x, y) <= z * .52 + tol;
}
function select(i) {
  sel = i; editing = false; const fs = $('selPanel');
  if (i < 0) { fs.disabled = true; $('selLegend').textContent = 'Touche une forme pour la modifier'; drawShapes(); return; }
  const o = objects[i], names = { circle: 'cercle', square: 'carré', triangle: 'triangle', line: 'trait', arc: 'arc' };
  fs.disabled = false; $('selLegend').textContent = 'Forme sélectionnée : ' + names[o.type];
  $('selColor').value = o.color; $('selSize').value = Math.round(o.size); $('selAngle').value = Math.round(o.angle * 180 / Math.PI);
  $('selAlpha').value = Math.round((o.alpha ?? 1) * 100); drawShapes();
}
let sceneReady = false;
function storeScene() { if (!sceneReady) { sceneReady = true; return; } scenes[mode] = { objects: JSON.parse(JSON.stringify(objects)), bg }; }
function setMode(next) {
  storeScene(); mode = next;
  document.querySelectorAll('[data-studio]').forEach(b => b.classList.toggle('selected', b.dataset.studio === mode));
  [$('studioModeTitle').textContent, $('studioInstruction').textContent, $('studioTip').textContent] = THEMES[mode];
  if (scenes[mode]) { objects = scenes[mode].objects; bg = scenes[mode].bg; }
  else { objects = PRESETS[mode].map(([type, x, y, size, color, angle]) => ({ type, x, y, size, color, angle, alpha: 1 })); bg = '#fdf9ed'; }
  $('studioBackground').value = bg; history = []; select(-1);
}
document.querySelectorAll('[data-studio]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.studio)));
$('studioBackground').addEventListener('change', e => { snapshot(); bg = e.target.value; drawShapes(); });
let colorTurn = 0;
document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
  snapshot();
  objects.push({ type: b.dataset.add, x: 220 + Math.random() * 360, y: 140 + Math.random() * 240, size: 80, color: DEFAULT_COLORS[colorTurn++ % DEFAULT_COLORS.length], angle: 0, alpha: 1 });
  select(objects.length - 1);
}));
function editSel(fn) { if (sel < 0) return; if (!editing) { snapshot(); editing = true; } fn(objects[sel]); drawShapes(); }
$('selColor').addEventListener('input', e => editSel(o => o.color = e.target.value));
$('selSize').addEventListener('input', e => editSel(o => o.size = +e.target.value));
$('selAngle').addEventListener('input', e => editSel(o => o.angle = +e.target.value * Math.PI / 180));
$('selAlpha').addEventListener('input', e => editSel(o => o.alpha = +e.target.value / 100));
['selColor', 'selSize', 'selAngle', 'selAlpha'].forEach(id => $(id).addEventListener('change', () => { editing = false; }));
$('selUp').addEventListener('click', () => { if (sel < 0 || sel === objects.length - 1) return; snapshot(); const [o] = objects.splice(sel, 1); objects.push(o); select(objects.length - 1); });
$('selDown').addEventListener('click', () => { if (sel <= 0) return; snapshot(); const [o] = objects.splice(sel, 1); objects.unshift(o); select(0); });
$('selDup').addEventListener('click', () => { if (sel < 0) return; snapshot(); const c = { ...objects[sel], x: Math.min(W - 20, objects[sel].x + 30), y: Math.min(H - 20, objects[sel].y + 30) }; objects.push(c); select(objects.length - 1); });
$('selDel').addEventListener('click', () => { if (sel < 0) return; snapshot(); objects.splice(sel, 1); select(-1); });
$('undoArt').addEventListener('click', () => { if (!history.length) return; const h = JSON.parse(history.pop()); objects = h.objects; bg = h.bg; $('studioBackground').value = bg; select(-1); });
$('clearArt').addEventListener('click', () => { if (!objects.length) return; snapshot(); objects = []; select(-1); });
$('shuffleArt').addEventListener('click', () => { snapshot(); objects.forEach(o => { o.angle += (Math.random() - .5) * 1.5; o.x = Math.max(80, Math.min(720, o.x + (Math.random() - .5) * 220)); o.y = Math.max(80, Math.min(440, o.y + (Math.random() - .5) * 160)); }); drawShapes(); });

function pt(e, canvas, w, h) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; }
cv.addEventListener('pointerdown', e => {
  touchTol = e.pointerType === 'touch' ? 30 : 10;
  const p = pt(e, cv, W, H);
  for (let i = objects.length - 1; i >= 0; i--) if (hit(objects[i], p)) {
    snapshot(); select(i); drag = { dx: objects[i].x - p.x, dy: objects[i].y - p.y, moved: false };
    cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; return;
  }
  select(-1);
});
cv.addEventListener('pointermove', e => {
  const p = pt(e, cv, W, H);
  if (!drag) { cv.style.cursor = objects.some(o => hit(o, p)) ? 'grab' : 'default'; return; }
  const o = objects[sel]; o.x = Math.max(10, Math.min(W - 10, p.x + drag.dx)); o.y = Math.max(10, Math.min(H - 10, p.y + drag.dy)); drag.moved = true; drawShapes();
});
const endDrag = () => { if (drag && !drag.moved) history.pop(); drag = null; cv.style.cursor = 'grab'; };
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
cv.addEventListener('keydown', e => {
  if (!objects.length) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select((sel + 1) % objects.length); return; }
  if (sel < 0) return;
  const step = e.shiftKey ? 30 : 8, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (mv) { e.preventDefault(); editSel(o => { o.x = Math.max(10, Math.min(W - 10, o.x + mv[0])); o.y = Math.max(10, Math.min(H - 10, o.y + mv[1])); }); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); snapshot(); objects.splice(sel, 1); select(-1); }
  else if (e.key === 'Escape') select(-1);
});
cv.addEventListener('keyup', e => { if (e.key.startsWith('Arrow')) editing = false; });

function shapesImage() { drawShapes(false); const img = AA.thumb(cv); drawShapes(); return img; }
$('downloadArt').addEventListener('click', () => { drawShapes(false); AA.download(cv.toDataURL('image/png'), `arts-attack-${mode}.png`); drawShapes(); });
$('saveArt').addEventListener('click', () => {
  if (!objects.length) { AA.toast('Ta toile est vide : ajoute au moins une forme.'); return; }
  const r = $('artIntention').value.trim();
  if (AA.addEntry({ type: 'creation', title: 'Composition — ' + THEMES[mode][0], detail: `${objects.length} forme${objects.length > 1 ? 's' : ''}`, reflection: r, image: shapesImage() })) $('artIntention').value = '';
});

/* ================= Dessiner et peindre ================= */
const LW = 960, LH = 620;
const paperC = $('labPaperCanvas'), drawC = $('labCanvas'), guideC = $('labGuides');
const pctx = paperC.getContext('2d'), dctx = drawC.getContext('2d', { willReadFrequently: true }), gctx = guideC.getContext('2d');
const DESC = {
  brush: 'Pinceau : trace continue. Compare un geste rapide et un geste lent, une trace fine et une trace épaisse.',
  pencil: 'Crayon : trait fin et précis. Superpose les traits pour foncer une zone.',
  spray: 'Aérographe : nuage de points. Repasse plusieurs fois pour densifier la couleur.',
  dots: 'Pointillisme : juxtapose des points de couleurs pures. Recule : ils se mélangent dans ton œil (Seurat).',
  hatch: 'Hachures : lignes parallèles serrées ou espacées pour créer des valeurs, des ombres, du volume.',
  grain: 'Matière granuleuse : évoque une surface rugueuse (sable, pierre, crépi).',
  wash: 'Lavis : couche très transparente. Superpose plusieurs passages : la couleur se transforme.',
  eraser: 'Gomme : retire tes traces et laisse réapparaître le support.',
  line: 'Ligne : touche un point puis glisse. Des lignes qui convergent vers un point créent la profondeur.',
  rectangle: 'Rectangle : touche un coin puis glisse pour organiser la surface.',
  ellipse: 'Ellipse : superpose des ellipses de tailles différentes pour créer des plans.'
};
const CHALLENGES = ['Crée une image expressive avec deux couleurs complémentaires et trois épaisseurs de trait.', 'Fais apparaître un premier plan, un arrière-plan et un point de fuite.', 'Évoque une matière rugueuse et une matière lisse sur la même toile.', 'Compose une image dynamique avec des lignes diagonales et des formes répétées.', 'Produis un dégradé en superposant des lavis transparents.', 'Crée un paysage imaginaire sans dessiner aucun contour noir.', 'Dessine un objet en n\'utilisant que des hachures : au moins quatre valeurs du clair au foncé.', 'Représente le bruit d\'une ville avec seulement des points et des traits.'];
let chIndex = 0, lhist = [], drawing = false, last = null, start = null, base = null, grid = false, persp = false, recent = [];
const tool = () => $('labTool').value, color = () => $('labColor').value, size = () => +$('labSize').value, opac = () => +$('labOpacity').value / 100;

function paintPaper() { pctx.fillStyle = $('labPaper').value; pctx.fillRect(0, 0, LW, LH); }
function paintGuides() {
  gctx.clearRect(0, 0, LW, LH); gctx.save(); gctx.strokeStyle = $('labPaper').value === '#1b2540' ? 'rgba(255,230,80,.55)' : 'rgba(32,66,155,.45)'; gctx.lineWidth = 1.5; gctx.setLineDash([8, 8]);
  if (grid) { for (let x = 0; x <= LW; x += 80) { gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, LH); gctx.stroke(); } for (let y = 0; y <= LH; y += 80) { gctx.beginPath(); gctx.moveTo(0, y); gctx.lineTo(LW, y); gctx.stroke(); } }
  if (persp) { const p = { x: LW / 2, y: LH * .42 }; gctx.beginPath(); gctx.moveTo(0, p.y); gctx.lineTo(LW, p.y); gctx.stroke(); for (const q of [[0, 0], [LW, 0], [0, LH], [LW, LH], [LW * .3, LH], [LW * .7, LH]]) { gctx.beginPath(); gctx.moveTo(p.x, p.y); gctx.lineTo(q[0], q[1]); gctx.stroke(); } gctx.setLineDash([]); gctx.beginPath(); gctx.arc(p.x, p.y, 7, 0, Math.PI * 2); gctx.stroke(); }
  gctx.restore();
}
function lsnap() { try { lhist.push(dctx.getImageData(0, 0, LW, LH)); if (lhist.length > 20) lhist.shift(); } catch { } }
function width(e) { let w = size(); if (e && e.pointerType === 'pen' && e.pressure > 0) w *= .3 + e.pressure * 1.4; return w; }
function stroke(a, b, e) {
  const t = tool(), s = width(e), o = opac(), dx = b.x - a.x, dy = b.y - a.y, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
  dctx.save(); dctx.lineCap = 'round'; dctx.lineJoin = 'round'; dctx.strokeStyle = dctx.fillStyle = color();
  if (t === 'eraser') { dctx.globalCompositeOperation = 'destination-out'; dctx.lineWidth = s * 1.4; dctx.beginPath(); dctx.moveTo(a.x, a.y); dctx.lineTo(b.x + .01, b.y + .01); dctx.stroke(); }
  else if (t === 'brush' || t === 'pencil' || t === 'wash') {
    dctx.lineWidth = t === 'pencil' ? Math.max(1, s * .3) : t === 'wash' ? s * 2 : s;
    dctx.globalAlpha = t === 'pencil' ? o * .8 : t === 'wash' ? o * .12 : o;
    dctx.beginPath(); dctx.moveTo(a.x, a.y); dctx.lineTo(b.x + .01, b.y + .01); dctx.stroke();
  } else {
    dctx.globalAlpha = o;
    for (let i = 0; i <= n; i++) {
      const x = a.x + dx * i / n, y = a.y + dy * i / n;
      if (t === 'spray' || t === 'grain') { const k = t === 'spray' ? 6 : 12; for (let j = 0; j < k; j++) { const ang = Math.random() * Math.PI * 2, rad = Math.random() * s * (t === 'spray' ? 1.8 : 1), d = t === 'grain' ? Math.random() * 3 + 1 : 1.5; dctx.fillRect(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, d, d); } }
      else if (t === 'dots' && i % 3 === 0) { dctx.beginPath(); dctx.arc(x + (Math.random() - .5) * s, y + (Math.random() - .5) * s, Math.max(1.5, s * .18), 0, Math.PI * 2); dctx.fill(); }
      else if (t === 'hatch' && i % 2 === 0) { dctx.lineWidth = Math.max(1, s * .08); dctx.beginPath(); dctx.moveTo(x - s * .35, y + s * .35); dctx.lineTo(x + s * .35, y - s * .35); dctx.stroke(); }
    }
  }
  dctx.restore();
}
function shape(a, b) {
  dctx.save(); dctx.globalAlpha = opac(); dctx.strokeStyle = color(); dctx.lineWidth = Math.max(1, size() / 3); dctx.lineCap = 'round'; dctx.beginPath();
  if (tool() === 'line') { dctx.moveTo(a.x, a.y); dctx.lineTo(b.x, b.y); }
  else if (tool() === 'rectangle') dctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
  else dctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.max(1, Math.abs(b.x - a.x) / 2), Math.max(1, Math.abs(b.y - a.y) / 2), 0, 0, Math.PI * 2);
  dctx.stroke(); dctx.restore();
}
const isShape = () => ['line', 'rectangle', 'ellipse'].includes(tool());
drawC.addEventListener('pointerdown', e => {
  e.preventDefault(); lsnap(); drawC.setPointerCapture(e.pointerId); drawing = true;
  start = last = pt(e, drawC, LW, LH); base = isShape() ? dctx.getImageData(0, 0, LW, LH) : null;
  if (!isShape()) stroke(last, last, e); rememberColor();
});
drawC.addEventListener('pointermove', e => {
  if (!drawing) return; e.preventDefault();
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of evs.length ? evs : [e]) { const p = pt(ev, drawC, LW, LH); if (isShape()) { dctx.putImageData(base, 0, 0); shape(start, p); } else stroke(last, p, ev); last = p; }
});
function stopDraw() { if (!drawing) return; drawing = false; base = null; scheduleDraft(); }
drawC.addEventListener('pointerup', stopDraw); drawC.addEventListener('pointercancel', stopDraw);

function rememberColor() { const c = color(); if (tool() === 'eraser') return; recent = [c, ...recent.filter(x => x !== c)].slice(0, 8); renderSwatches(); }
function renderSwatches() {
  const box = $('labSwatches'); box.replaceChildren();
  recent.forEach(c => { const b = el('button', 'swatch'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Reprendre la couleur ' + c); b.onclick = () => { $('labColor').value = c; }; box.append(b); });
}
$('labTool').addEventListener('change', () => { $('labExplain').textContent = DESC[tool()]; drawC.style.cursor = tool() === 'eraser' ? 'cell' : 'crosshair'; });
$('labSize').addEventListener('input', () => { $('labSizeValue').textContent = $('labSize').value; });
$('labOpacity').addEventListener('input', () => { $('labOpacityValue').textContent = $('labOpacity').value + ' %'; });
$('labPaper').addEventListener('change', () => { paintPaper(); paintGuides(); scheduleDraft(); });
$('labUndo').addEventListener('click', () => { const h = lhist.pop(); if (h) { dctx.putImageData(h, 0, 0); scheduleDraft(); } });
$('labClear').addEventListener('click', () => { if (!confirm('Effacer tout le dessin ?')) return; lsnap(); dctx.clearRect(0, 0, LW, LH); scheduleDraft(); });
$('labGrid').addEventListener('click', e => { grid = !grid; e.currentTarget.setAttribute('aria-pressed', grid); paintGuides(); });
$('labPerspective').addEventListener('click', e => { persp = !persp; e.currentTarget.setAttribute('aria-pressed', persp); paintGuides(); });
$('labNewChallenge').addEventListener('click', () => { chIndex = (chIndex + 1) % CHALLENGES.length; $('labChallenge').textContent = CHALLENGES[chIndex]; });

function composite() { const c = document.createElement('canvas'); c.width = LW; c.height = LH; const x = c.getContext('2d'); x.drawImage(paperC, 0, 0); x.drawImage(drawC, 0, 0); return c; }
function isBlank() { const d = dctx.getImageData(0, 0, LW, LH).data; for (let i = 3; i < d.length; i += 64) if (d[i]) return false; return true; }
$('labExport').addEventListener('click', () => AA.download(composite().toDataURL('image/png'), 'arts-attack-dessin.png'));
$('labSave').addEventListener('click', () => {
  if (isBlank()) { AA.toast('Ta toile est vide : dessine quelque chose d\'abord.'); return; }
  const e = AA.addEntry({ type: 'creation', title: 'Dessin — ' + $('labChallenge').textContent.slice(0, 70), reflection: $('labReflection').value, image: AA.thumb(composite()) });
  if (e) $('labReflection').value = '';
});

/* Brouillon : le dessin en cours est conservé automatiquement */
let draftTimer;
function scheduleDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    try { const img = drawC.toDataURL('image/png'); AA.state.lab = img.length < 1.6e6 ? { image: img, paper: $('labPaper').value, reflection: $('labReflection').value } : null; AA.save(); } catch { }
  }, 900);
}
$('labReflection').addEventListener('input', scheduleDraft);
function restoreDraft() {
  dctx.clearRect(0, 0, LW, LH); const d = AA.state.lab;
  if (d && d.paper) $('labPaper').value = d.paper;
  paintPaper();
  if (!d || !d.image) return;
  $('labReflection').value = d.reflection || '';
  const im = new Image(); im.onload = () => dctx.drawImage(im, 0, 0, LW, LH); im.src = d.image;
}

/* ================= Les 9 notions ================= */
const NOTIONS = [
  ['Couleur', 'couleur', 'Change une seule couleur dans une composition : l\'ambiance change-t-elle ?', 'formes', 'couleur'],
  ['Espace', 'espace', 'Choisis un cadrage ou un point de vue pour transformer la perception d\'une scène. Essaie le point de fuite.', 'dessin', 'Fais apparaître un premier plan, un arrière-plan et un point de fuite.'],
  ['Forme', 'forme', 'Associe formes géométriques et formes organiques pour créer une figure inattendue.', 'formes', 'composition'],
  ['Geste', 'geste', 'Compare une trace rapide et une trace lente, légère et appuyée, avec le même outil.', 'dessin', 'Fais quatre traces avec le pinceau : rapide, lente, légère, appuyée. Laquelle exprime la colère ?'],
  ['Lumière', 'lumiere', 'Observe comment les ombres modifient l\'apparence d\'un objet. Sur fond sombre, la couleur claire devient lumière.', 'dessin', 'Sur le fond sombre, fais surgir une source de lumière avec des lavis clairs.'],
  ['Matière', 'matiere', 'Associe des surfaces lisses, rugueuses, opaques ou transparentes.', 'dessin', 'Évoque une matière rugueuse et une matière lisse sur la même toile.'],
  ['Outil', 'outil', 'Un outil inhabituel produit une trace nouvelle : une fourchette, une éponge, un bouchon…', 'dessin', 'Dessine un objet en n\'utilisant que des hachures : au moins quatre valeurs du clair au foncé.'],
  ['Support', 'support', 'La même image sur papier kraft, sur un mur ou sur du tissu ne produit pas le même effet.', 'dessin', 'Change de support (kraft, sombre, rose) : ton dessin dit-il la même chose ?'],
  ['Temps', 'temps', 'Une œuvre peut montrer une transformation : fais trois versions successives et enregistre chacune.', 'formes', 'transformation']
];
const cg = $('concepts');
NOTIONS.forEach(([name, file, desc, tab, arg]) => {
  const b = el('button', 'concept'); b.type = 'button';
  const img = el('img'); img.src = `assets/notions/${file}.webp`; img.alt = ''; img.loading = 'lazy';
  b.append(img, el('span', 'concept-name', name));
  b.addEventListener('click', () => {
    document.querySelectorAll('.concept').forEach(x => x.classList.remove('selected')); b.classList.add('selected');
    const det = $('concept-detail'); det.replaceChildren(el('strong', '', name + ' — '), document.createTextNode(desc + ' '));
    const go = el('button', 'mini', tab === 'formes' ? 'Essayer avec les formes' : 'Essayer en dessinant'); go.type = 'button';
    go.onclick = () => AA.actions[tab](arg); det.append(go);
  });
  cg.append(b);
});

/* ================= Actions partagées ================= */
AA.actions.formes = m => { AA.view('atelier'); showTab('formes'); if (THEMES[m]) setMode(m); $('panelFormes').scrollIntoView({ behavior: 'smooth' }); };
AA.actions.dessin = text => { AA.view('atelier'); showTab('dessin'); if (text && typeof text === 'string') { const i = CHALLENGES.indexOf(text); if (i >= 0) chIndex = i; $('labChallenge').textContent = text; } $('panelDessin').scrollIntoView({ behavior: 'smooth' }); };
AA.atelierImage = () => {
  const formes = objects.length ? shapesImage() : null, dessin = isBlank() ? null : AA.thumb(composite());
  return { formes, dessin };
};
document.addEventListener('aa:restored', restoreDraft);

/* Init */
$('labTool').dispatchEvent(new Event('change'));
$('labChallenge').textContent = CHALLENGES[0];
restoreDraft(); paintGuides(); setMode('composition');
})();
