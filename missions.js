/* Arts Attack! — Missions guidées (4 étapes) et défis express */
(() => {
'use strict';
const AA = window.AA, $ = id => document.getElementById(id), el = AA.el;

const REF = {
  k: { img: 'yellow', art: 'Vassily Kandinsky', title: 'Jaune-rouge-bleu', date: '1925', museum: 'Centre Pompidou', url: 'https://www.centrepompidou.fr/fr/ressources/oeuvre/cEpEKE', idea: 'Observe comment les formes, les lignes et les couleurs construisent une composition sans représenter directement un objet.' },
  v: { img: 'starry', art: 'Vincent van Gogh', title: 'La Nuit étoilée', date: '1889', museum: 'MoMA, New York', url: 'https://www.moma.org/collection/works/79802', idea: 'Observe comment les gestes peints et les courbes rendent le ciel expressif.' },
  m: { img: 'boogie', art: 'Piet Mondrian', title: 'Broadway Boogie Woogie', date: '1942–1943', museum: 'MoMA, New York', url: 'https://www.moma.org/collection/works/78682', idea: 'Comment des lignes, des couleurs et des rythmes peuvent-ils évoquer une ville ?' },
  h: { img: 'wave', art: 'Katsushika Hokusai', title: 'Sous la vague au large de Kanagawa', date: 'vers 1830–1832', museum: 'Metropolitan Museum of Art, New York', url: 'https://www.metmuseum.org/art/collection/search/45434', idea: 'Repère le rapport d\'échelle entre la vague et le mont Fuji, les plans et l\'énergie des lignes.' }
};
const DATA = [
  { id: 'six1', grade: '6e', axis: 'Représenter', title: 'Une émotion en trois couleurs', notions: 'Couleur, forme', ref: 'k', brief: 'Compose une image non figurative pour exprimer une émotion.', steps: ['Choisis une émotion et trois couleurs qui lui correspondent.', 'Place au moins cinq formes de tailles différentes.', 'Fais deux versions, puis garde celle qui exprime le mieux ton émotion.'], tip: 'Le choix du contraste et des proportions peut rendre une composition calme ou agitée.', question: 'Quelles couleurs et quelles formes traduisent ton émotion ?', studio: 'couleur' },
  { id: 'six2', grade: '6e', axis: 'Former et transformer', title: 'Le monstre-assemblage', notions: 'Matière, forme, support', ref: 'k', brief: 'Imagine une créature à partir de formes et de matériaux récupérés.', steps: ['Dessine la silhouette de ton monstre avec trois volumes géométriques.', 'Choisis quatre matériaux (papier, carton, emballages propres, tissu).', 'Réalise une maquette ou un collage et donne un rôle à chaque matériau.'], tip: 'Un matériau peut suggérer une texture, une personnalité, un caractère.', question: 'Quel matériau transforme le plus l\'apparence de ta créature ?', studio: 'transformation' },
  { id: 'six3', grade: '6e', axis: 'Exposer, recevoir et relier', title: 'Une image, trois regards', notions: 'Espace, lumière', ref: 'h', brief: 'Montre comment le cadrage change la manière de voir.', steps: ['Choisis un objet de ton environnement.', 'Dessine-le ou photographie-le avec trois cadrages différents.', 'Présente les trois vues dans l\'ordre qui surprendra le plus le visiteur.'], tip: 'Un détail agrandi peut devenir mystérieux et changer complètement le sens.', question: 'Quel cadrage attire d\'abord le spectateur, et pourquoi ?', studio: 'dessin' },
  { id: 'cinq1', grade: '5e', axis: 'Représenter', title: 'Une ville en rythme', notions: 'Espace, couleur, temps', ref: 'm', brief: 'Invente une ville imaginaire par le rythme des lignes et des couleurs.', steps: ['Repère dans l\'œuvre les répétitions et les ruptures.', 'Crée une grille de rues en combinant différentes formes.', 'Ajoute trois contrastes visuels pour montrer une ville vivante.'], tip: 'La répétition donne du rythme ; une rupture crée une surprise.', question: 'Comment as-tu montré le mouvement sans dessiner de personnages ?', studio: 'composition' },
  { id: 'cinq2', grade: '5e', axis: 'Former et transformer', title: 'L\'objet devenu extraordinaire', notions: 'Objet, échelle, matière', ref: 'h', brief: 'Transforme un objet ordinaire en élément d\'un monde imaginaire.', steps: ['Choisis un objet très simple (bouteille vide propre, boîte, chaussure).', 'Dessine trois transformations : de taille, de matière ou de fonction.', 'Crée une affiche ou une maquette de ton détournement préféré.'], tip: 'Changer l\'échelle peut changer l\'histoire qu\'un objet raconte.', question: 'Pourquoi cet objet n\'a-t-il plus la même signification ?', studio: 'transformation' },
  { id: 'cinq3', grade: '5e', axis: 'Exposer, recevoir et relier', title: 'Ton musée miniature', notions: 'Support, espace, lumière', ref: 'v', brief: 'Conçois une exposition de trois œuvres.', steps: ['Choisis trois créations (dessins ou réalisations personnelles).', 'Décide d\'un ordre, d\'une hauteur d\'accrochage et d\'un éclairage.', 'Dessine un plan simple et invente un titre pour l\'exposition.'], tip: 'L\'ordre du parcours fait partie de l\'expérience du spectateur.', question: 'Que verra le visiteur en premier, et pourquoi ?', studio: 'dessin' },
  { id: 'quatre1', grade: '4e', axis: 'Représenter', title: 'Réalité déformée', notions: 'Geste, support, image', ref: 'v', brief: 'Déforme une scène familière pour en changer l\'atmosphère.', steps: ['Choisis une scène ordinaire et fais un premier croquis.', 'Imagine deux déformations : couleurs irréelles, lignes amplifiées ou cadrage surprenant.', 'Produis une image finale et compare son effet avec le croquis.'], tip: 'La ressemblance n\'est pas le seul moyen de communiquer une idée.', question: 'Qu\'as-tu volontairement exagéré, et dans quel but ?', studio: 'dessin' },
  { id: 'quatre2', grade: '4e', axis: 'Former et transformer', title: 'Sculpture en équilibre', notions: 'Espace, forme, matière', ref: 'k', brief: 'Conçois une sculpture où le plein et le vide comptent autant.', steps: ['Esquisse un assemblage de cinq éléments avec des vides visibles.', 'Réalise une petite maquette en papier ou carton léger.', 'Observe-la sous trois points de vue et modifie un élément.'], tip: 'Le vide peut guider le regard autant que la matière.', question: 'Comment le point de vue transforme-t-il ta sculpture ?', studio: 'transformation' },
  { id: 'quatre3', grade: '4e', axis: 'Exposer, recevoir et relier', title: 'Le spectateur décide', notions: 'Espace, temps, lumière', ref: 'h', brief: 'Imagine une œuvre dont le sens change selon la place du public.', steps: ['Dessine une installation à observer sous deux angles différents.', 'Prévois ce que le visiteur découvre de chaque côté.', 'Explique comment tu guiderais le parcours sans donner la réponse.'], tip: 'Le spectateur n\'est pas toujours passif : son déplacement peut produire du sens.', question: 'Pourquoi ton œuvre ne se découvre-t-elle pas d\'un seul regard ?', studio: 'dessin' },
  { id: 'trois1', grade: '3e', axis: 'Représenter', title: 'Une image qui prend position', notions: 'Image, couleur, composition', ref: 'm', brief: 'Crée une affiche qui exprime un message qui te tient à cœur.', steps: ['Choisis un enjeu de la vie quotidienne et définis une intention précise.', 'Essaie deux compositions opposées : minimaliste et expressive.', 'Finalise l\'affiche et rédige un court cartel pour défendre tes choix.'], tip: 'Une œuvre peut proposer un point de vue sans imposer une seule interprétation.', question: 'Quels procédés visuels rendent ton message perceptible ?', studio: 'composition' },
  { id: 'trois2', grade: '3e', axis: 'Former et transformer', title: 'L\'objet a changé de rôle', notions: 'Objet, matière, sens', ref: 'k', brief: 'Réalise un détournement qui donne un sens nouveau à un objet.', steps: ['Choisis un objet banal et décris sa fonction habituelle.', 'Imagine trois détournements qui lui donnent un autre sens.', 'Fabrique une maquette ou un photomontage, puis explique ton intention.'], tip: 'Le choix d\'un objet ou d\'un matériau peut devenir une prise de position.', question: 'Qu\'est-ce qui a changé : la forme, l\'usage ou le regard porté sur l\'objet ?', studio: 'transformation' },
  { id: 'trois3', grade: '3e', axis: 'Exposer, recevoir et relier', title: 'Commissaire d\'exposition', notions: 'Espace, lumière, temps', ref: 'v', brief: 'Conçois une exposition où les choix de présentation produisent du sens.', steps: ['Choisis trois productions et une question qui les relie.', 'Conçois un parcours : plan, zones de lumière, point de vue privilégié.', 'Écris le texte de présentation et justifie l\'ordre choisi.'], tip: 'L\'accrochage, l\'échelle et la circulation font partie de l\'œuvre exposée.', question: 'Comment ton parcours influence-t-il les interprétations du public ?', studio: 'dessin' }
];
const EXPRESS = {
  formes: { name: 'Une histoire en trois formes', axis: 'Représenter', prompt: 'Quelle intention veux-tu explorer avec une composition de trois formes ? Il n\'y a pas de bonne ou de mauvaise réponse.', choices: ['Créer une impression de mouvement', 'Évoquer le calme', 'Faire naître un mystère', 'Raconter une rencontre'], tip: 'Pense à la position, à la taille et aux contrastes de tes formes. Tu peux ensuite la réaliser dans l\'Atelier.' },
  objet: { name: 'Un objet, une autre vie', axis: 'Former et transformer', prompt: 'Tu veux détourner un objet quotidien. Quel changement veux-tu explorer ?', choices: ['Changer son échelle', 'Changer sa matière', 'Changer sa fonction', 'Le réunir avec d\'autres objets'], tip: 'Demande-toi ce que l\'objet signifie avant et après sa transformation.' },
  expo: { name: 'À toi d\'être commissaire', axis: 'Exposer, recevoir et relier', prompt: 'Où présenterais-tu une sculpture pour modifier l\'expérience du spectateur ?', choices: ['Au centre d\'une pièce', 'Dans un coin sombre', 'À hauteur des yeux', 'Suspendue au-dessus du sol'], tip: 'Le lieu, la lumière et le parcours du spectateur font partie de ton choix.' }
};
const STEP_NAMES = ['Observer', 'Expérimenter', 'Produire', 'Expliquer'];

let active = null, step = 0, notes = {};
const mstate = () => AA.state.missions;
const btn = (text, fn, cls = 'mini') => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; };

/* ---------- Grille ---------- */
function renderGrid() {
  const grade = $('gradeChoice').value, axis = $('axisChoice').value, grid = $('v3Grid'); grid.replaceChildren();
  const list = DATA.filter(m => m.grade === grade && (axis === 'all' || m.axis === axis));
  list.forEach(m => {
    const st = mstate()[m.id] || {}, card = el('article', 'v3-card' + (st.done ? ' done' : '')), r = REF[m.ref];
    const status = st.done ? '✓ Terminée' : st.draft ? `En cours · étape ${st.draft.step + 1}/4` : '';
    card.append(el('span', 'v3-tag', m.axis), el('h3', '', m.title), el('p', '', m.brief), el('p', 'v3-notions', 'Notions : ' + m.notions), el('p', 'v3-reference', `Œuvre de départ : ${r.art}, ${r.title}`));
    if (status) card.append(el('p', 'v3-status', status));
    card.append(btn(st.done ? 'Refaire la mission' : st.draft ? 'Reprendre' : 'Commencer', () => open(m)));
    grid.append(card);
  });
  const done = DATA.filter(m => m.grade === grade && mstate()[m.id]?.done).length;
  $('v3Count').textContent = `${done} / 3 missions terminées en ${grade}`;
  if (!list.length) grid.append(el('p', 'empty', 'Aucune mission pour ce filtre.'));
}
$('gradeChoice').addEventListener('change', () => { closePlayer(); renderGrid(); });
$('axisChoice').addEventListener('change', renderGrid);

/* ---------- Lecteur de mission ---------- */
function open(m) {
  active = m; const st = mstate()[m.id] || {};
  if (st.draft) { step = st.draft.step || 0; notes = Object.assign({}, st.draft.notes); } else { step = 0; notes = {}; }
  renderPlayer(); $('v3Player').hidden = false; $('v3Player').scrollIntoView({ behavior: 'smooth', block: 'start' }); updateReturn();
}
function closePlayer() { $('v3Player').hidden = true; active = null; updateReturn(); }
function persistDraft() { if (!active) return; const s = mstate(); s[active.id] = Object.assign({}, s[active.id], { draft: { step, notes: { reflection: notes.reflection || '', checks: notes.checks || {}, image: null } } }); AA.save(); }

function renderPlayer() {
  const wrap = $('v3Player'), m = active, r = REF[m.ref]; wrap.replaceChildren();
  const head = el('div', 'v3-player-head'); head.append(el('h3', '', m.title), btn('✕ Fermer', closePlayer, 'v3-close')); wrap.append(head);
  const prog = el('ol', 'stepper'); STEP_NAMES.forEach((n, i) => { const li = el('li', i < step ? 'past' : i === step ? 'now' : '', n); if (i === step) li.setAttribute('aria-current', 'step'); prog.append(li); }); wrap.append(prog);
  const body = el('div', 'v3-body');
  if (step === 0) {
    const fig = el('figure', 'v3-fig'); const img = el('img'); img.src = `assets/oeuvres/${r.img}.jpg`; img.alt = `${r.title}, ${r.art}`; img.loading = 'lazy'; img.onerror = () => img.remove();
    fig.append(img, el('figcaption', '', `${r.art}, ${r.title}, ${r.date}. ${r.museum}.`)); body.append(fig);
    body.append(el('h4', '', 'J\'observe'), el('p', '', r.idea));
    const a = el('a', 'v3-source', 'Voir la notice du musée ↗'); a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; body.append(a);
  }
  if (step === 1) {
    body.append(el('h4', '', 'Je cherche, j\'essaie'), el('p', 'big', m.steps[0]), el('p', 'v3-help', '💡 ' + m.tip));
    body.append(btn(m.studio === 'dessin' ? '🖌️ Essayer dans l\'Atelier (dessin)' : '🔺 Essayer dans l\'Atelier (formes)', goAtelier, 'v3-studio-btn'));
  }
  if (step === 2) {
    body.append(el('h4', '', 'Je réalise ma production'));
    notes.checks = notes.checks || {};
    m.steps.slice(1).forEach((s, i) => {
      const line = el('label', 'v3-checkline'), c = document.createElement('input'); c.type = 'checkbox'; c.checked = !!notes.checks[i];
      c.addEventListener('change', () => { notes.checks[i] = c.checked; persistDraft(); }); line.append(c, el('span', '', s)); body.append(line);
    });
    body.append(el('p', 'v3-help', 'Tu peux réaliser ta production sur papier, en volume, en photo ou dans l\'Atelier numérique.'), btn('Ouvrir l\'Atelier', goAtelier, 'v3-studio-btn'));
  }
  if (step === 3) {
    body.append(el('h4', '', 'Mon bilan d\'artiste'), el('p', 'big', m.question));
    const t = el('textarea', 'v3-textarea'); t.rows = 4; t.maxLength = 700; t.placeholder = 'J\'ai choisi… parce que…'; t.value = notes.reflection || ''; t.setAttribute('aria-label', 'Mon explication'); t.dataset.starters = '';
    t.addEventListener('input', () => { notes.reflection = t.value; persistDraft(); }); body.append(t);
    const att = el('div', 'attach'); body.append(att); renderAttach(att);
    body.append(el('p', 'v3-error', '')); body.lastChild.id = 'v3Error';
  }
  wrap.append(body);
  const nav = el('div', 'v3-nav');
  if (step) nav.append(btn('← Étape précédente', () => { step--; persistDraft(); renderPlayer(); }, 'v3-secondary'));
  nav.append(step < 3 ? btn('Étape suivante →', () => { step++; persistDraft(); renderPlayer(); wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 'v3-primary') : btn('✓ Enregistrer dans mon carnet', finish, 'v3-primary'));
  wrap.append(nav);
}
function renderAttach(box) {
  box.replaceChildren(el('p', 'attach-label', 'Joindre une image de ta production (facultatif)'));
  if (notes.image) {
    const im = el('img', 'attach-preview'); im.src = notes.image; im.alt = 'Image jointe'; box.append(im, btn('Retirer l\'image', () => { notes.image = null; renderAttach(box); }, 'linkish'));
    return;
  }
  const imgs = AA.atelierImage ? AA.atelierImage() : {}, row = el('div', 'attach-row');
  if (imgs.formes) row.append(btn('🔺 Ma composition de l\'Atelier', () => { notes.image = imgs.formes; renderAttach(box); }, 'chip'));
  if (imgs.dessin) row.append(btn('🖌️ Mon dessin de l\'Atelier', () => { notes.image = imgs.dessin; renderAttach(box); }, 'chip'));
  const lab = el('label', 'chip filebtn', '📷 Une photo de mon travail'), inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
  inp.addEventListener('change', () => { const f = inp.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), k = Math.min(1, 900 / Math.max(im.width, im.height)); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); notes.image = c.toDataURL('image/jpeg', .75); URL.revokeObjectURL(im.src); renderAttach(box); }; im.src = URL.createObjectURL(f); });
  lab.append(inp); row.append(lab); box.append(row);
}
function goAtelier() { persistDraft(); if (active.studio === 'dessin') AA.actions.dessin(); else AA.actions.formes(active.studio); }
function finish() {
  const reflection = (notes.reflection || '').trim();
  if (reflection.length < 15) { $('v3Error').textContent = 'Explique ton choix en une ou deux phrases avant d\'enregistrer. Les débuts de phrase peuvent t\'aider.'; return; }
  const m = active;
  if (!AA.addEntry({ type: 'mission', title: `Mission ${m.grade} — ${m.title}`, detail: m.axis + ' · ' + m.question, reflection, image: notes.image || null })) return;
  mstate()[m.id] = { done: true, reflection }; AA.save();
  closePlayer(); renderGrid();
}

/* Bouton « retour à ma mission » visible dans l'Atelier */
const back = el('button', 'return-mission', ''); back.type = 'button'; back.hidden = true;
back.addEventListener('click', () => { AA.view('missions'); if (active) setTimeout(() => $('v3Player').scrollIntoView({ behavior: 'smooth' }), 50); });
$('atelier').prepend(back);
function updateReturn(v) { const cur = v || document.querySelector('.view.current')?.id; back.hidden = !(active && cur === 'atelier'); if (active) back.textContent = '← Retour à ma mission : ' + active.title; }
document.addEventListener('aa:view', e => updateReturn(e.detail));

/* ---------- Défis express ---------- */
const eg = $('expressGrid');
for (const [id, m] of Object.entries(EXPRESS)) {
  const c = el('article', 'express-card'); c.append(el('span', 'v3-tag', m.axis), el('h3', '', m.name), btn('Relever le défi', () => openExpress(id))); eg.append(c);
}
let exp = null, chosen = '', lastFocus = null; const dialog = $('dialog');
function openExpress(id) {
  exp = id; chosen = ''; const m = EXPRESS[id]; lastFocus = document.activeElement;
  $('dialogTitle').textContent = m.name; $('dialogPrompt').textContent = m.prompt; $('reflection').value = ''; $('feedback').textContent = '';
  const cs = $('choices'); cs.replaceChildren();
  m.choices.forEach(ch => { const b = el('button', 'choice', ch); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.onclick = () => { chosen = ch; cs.querySelectorAll('button').forEach(x => { x.classList.toggle('chosen', x === b); x.setAttribute('aria-pressed', x === b); }); $('feedback').textContent = m.tip; }; cs.append(b); });
  dialog.hidden = false; document.body.classList.add('modal-open'); $('closeDialog').focus();
}
function closeExpress() { dialog.hidden = true; document.body.classList.remove('modal-open'); exp = null; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
$('closeDialog').addEventListener('click', closeExpress);
dialog.addEventListener('click', e => { if (e.target === dialog) closeExpress(); });
document.addEventListener('keydown', e => {
  if (dialog.hidden) return;
  if (e.key === 'Escape') closeExpress();
  if (e.key === 'Tab') { const f = [...dialog.querySelectorAll('button,textarea')].filter(x => !x.disabled && x.offsetParent); const first = f[0], lastEl = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); } }
});
$('saveMission').addEventListener('click', () => {
  if (!chosen) { $('feedback').textContent = 'Choisis d\'abord une piste.'; return; }
  const m = EXPRESS[exp];
  if (AA.addEntry({ type: 'mission', title: 'Défi express — ' + m.name, detail: 'Ma piste : ' + chosen, reflection: $('reflection').value })) closeExpress();
});

/* ---------- Actions partagées ---------- */
AA.actions.express = openExpress;
AA.actions.world = axis => { AA.view('missions'); $('axisChoice').value = axis; renderGrid(); };
document.addEventListener('aa:restored', renderGrid);
renderGrid();
})();
