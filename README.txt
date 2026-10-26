ARTS ATTACK — V5.3 / Import des reproductions authentiques

IMPORTANT : les huit images JPG ne sont PAS livrées dans ce ZIP. Le téléchargement réseau a échoué dans cet environnement. Le site garde ses illustrations de secours. Ne pas annoncer que le musée fonctionne entièrement hors ligne tant que les huit JPG ne sont pas présents.

Pour compléter assets/oeuvres depuis un ordinateur connecté à Internet :
  1. Décompresser ce ZIP.
  2. Installer Python 3 et Pillow : python -m pip install Pillow
  3. Dans le dossier décompressé : python telecharger_oeuvres.py
  4. Contrôler les résultats dans assets/oeuvres/ (wave.jpg, starry.jpg, boogie.jpg, yellow.jpg, self.jpg, cypresses.jpg, sunday.jpg, scream.jpg).
  5. Si une source ne fournit pas de fichier confirmé, consulter la liste des fichiers possibles affichée par le script et vérifier les droits avant de copier manuellement un JPEG dans assets/oeuvres avec le nom attendu.
  6. Mettre en ligne LE CONTENU du dossier complet sur GitHub Pages.

Sources prioritaires : The Met (CC0 Open Access), Art Institute of Chicago (œuvres du domaine public) et fichiers Commons marqués domaine public/CC0. Chaque œuvre garde son lien musée, sa notice, ses missions et sa place dans la collection.

La V5.3 désactive le chargement externe des reproductions dans le site : seule une image locale véritablement présente est affichée. Les fichiers absents sont représentés par les couvertures de secours, avec lien vers le musée.


V5.4 : les 8 reproductions du musée sont désormais présentes en local dans assets/oeuvres/*.jpg.

V5.4.1 : correction du chargement des 8 images locales (suppression du test HTTP HEAD).
