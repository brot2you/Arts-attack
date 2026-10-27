# Arts Attack! — version 6 (refonte consolidée)

## Mise en ligne
1. Dépose le contenu de ce dossier à la racine de la branche `main` (remplace `index.html` et `style.css`).
2. Supprime du dépôt les fichiers devenus inutiles (plus aucun n'est appelé par `index.html`) :
   - `app.js`, `v3.js`, `v4.js`, `laboratoire.js`, `laboratoire.css`, `icones-notions.css`
   - `README.txt`, `README-MAJ.txt`, `README-CORRECTIF.txt`, `README-fond-accueil.txt`, `LIRE-MOI.txt`
   - `ARTS-ATTACK-logo-transparent.png`, `ARTS-ATTACK-personnage-transparent.png`
   - le dossier en double `assets/œuvres/` (copie exacte de `assets/oeuvres/`)
   - dans `assets/` : `home-bg-desktop.png`, `home-bg-mobile.png`, `arts-attack-logo.png`, `arts-attack-personnage.png`, `hero-pop-academy.webp`, `mascotte-popart.jpg`, `comic-banner.webp`, `technique-illustration.webp`, `classe-1..4.webp`, `monde-*.svg`, `univers-*.svg`, `icon-*.svg`, `pop-burst.svg`, `arts-attack-logo.svg`
   - `telecharger_oeuvres.py` (à garder seulement si tu veux ajouter des œuvres plus tard)
   Le dépôt passe d'environ 40 Mo à moins de 7 Mo.

## Progression des élèves
Au premier chargement, les anciennes données (carnet, missions, cartes, techniques, dessin) sont reprises automatiquement dans une clé unique `arts-attack-v6`. Les anciennes clés ne sont pas effacées.

## Fichiers
- `core.js` : stockage, navigation, carnet (images, impression PDF, sauvegarde/restauration), lexique, débuts de phrase, défi du jour
- `atelier.js` : composer avec des formes + dessiner et peindre (calques), 9 notions
- `missions.js` : 12 missions guidées en 4 étapes + 3 défis express
- `techniques.js` : 13 techniques
- `musee.js` : 16 œuvres, 3 défis d'observation par œuvre, analyse en trois temps, duel

## Musée : images à ajouter
Cinq œuvres attendent leur image dans `assets/oeuvres/` (le site affiche une couverture « Image à ajouter » tant qu'elles manquent) :
- `fang.jpg` : Brooklyn Museum, image sous licence CC BY : https://brooklynmuseum.org/opencollection/objects/169093
- `muybridge.jpg` : domaine public, Library of Congress : https://www.loc.gov/item/97502309/
- `morisot.jpg` : Le Berceau (domaine public), par exemple Wikimedia Commons « Berthe Morisot 008.jpg »
- `batllo.jpg` : photo libre de la façade (Wikimedia Commons), noter auteur et licence
- `claudel.jpg` : photo libre de La Valse (Wikimedia Commons), noter auteur et licence
Format conseillé : JPEG, environ 1400 px de large. Les crédits sont à compléter dans `manifest.json`.

Trois œuvres restent volontairement sans image car elles sont protégées par le droit d'auteur : Pollock (jusqu'au 31 décembre 2026), Christo et Jeanne-Claude, Kusama. Les élèves les observent via le lien vers le musée.
