// ==========================================================
// CUSTOM : les recettes créées par le joueur
//
// Une recette perso a EXACTEMENT le même format que celles de
// recettes.js (nom, ingredients, ustensiles, etapes…), avec en plus
// perso: true. Comme ça, les écrans de préparation, de cuisine et de
// fin de recette savent la jouer sans code spécial.
//
// Tout est rangé dans la sauvegarde du joueur :
//   joueur.recettesPerso    → la liste des recettes
//   joueur.ingredientsPerso → les ingrédients tapés à la main
//   joueur.ustensilesPerso  → les ustensiles tapés à la main
// ==========================================================

// ---------- Les catalogues ----------

// Ajoute les ingrédients et ustensiles du joueur aux catalogues du jeu
// (ingredients.js). Object.assign(cible, source) copie chaque entrée de
// "source" dans "cible". Appelée au chargement de la sauvegarde.
function brancherCataloguesPerso() {
  // Ingrédients créés avant qu’on choisisse leur famille : rangés dans Épicerie
  for (const ingredient of Object.values(joueur.ingredientsPerso)) {
    if (!FAMILLES.some(f => f.id === ingredient.famille)) ingredient.famille = "epicerie";
  }
  Object.assign(ingredients, joueur.ingredientsPerso);

  // Ingrédients du jeu renommés : on garde le nom d’origine pour pouvoir le rétablir
  for (const [id, nom] of Object.entries(joueur.nomsIngredients)) {
    if (!ingredients[id]) continue; // ingrédient qui n’existe plus : on ignore
    if (!ingredients[id].nomOrigine) ingredients[id].nomOrigine = ingredients[id].nom;
    ingredients[id].nom = nom;
  }
  // Ustensiles créés sans groupe valable : l’ancien groupe « Récipients » va dans
  // Bols & mesures, le reste dans Petits outils
  for (const ustensile of Object.values(joueur.ustensilesPerso)) {
    if (ustensile.groupe === "recipients") ustensile.groupe = "bols";
    if (!GROUPES_USTENSILES.some(g => g.id === ustensile.groupe)) ustensile.groupe = "outils";
  }
  Object.assign(ustensiles, joueur.ustensilesPerso);
}

// Fabrique un identifiant à partir d'un nom : "Crème fraîche" → "perso-creme-fraiche"
function identifiantPerso(nom) {
  const simple = nom
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents (é → e)
    .replace(/[^a-z0-9]+/g, "-")                      // tout le reste devient un tiret
    .replace(/^-+|-+$/g, "");                         // pas de tiret au début ni à la fin
  return "perso-" + simple;
}

// Un nom tapé à la main : sans espaces autour, et sans < > (ils casseraient
// l'affichage, car les noms sont insérés dans du HTML)
function nettoyerNom(nom) {
  return nom.replace(/[<>]/g, "").trim();
}

// Ajoute un ingrédient tapé à la main (s'il n'existe pas déjà), rangé dans
// la famille choisie ("legumes", "viandes"…), et renvoie son identifiant
function ajouterIngredientPerso(nom, famille) {
  nom = nettoyerNom(nom);
  const id = identifiantPerso(nom);
  if (!ingredients[id]) {
    const nouveau = { nom: nom, famille: famille, sprite: null }; // pas de dessin : sprite temporaire
    joueur.ingredientsPerso[id] = nouveau;
    ingredients[id] = nouveau;
    sauvegarder();
  }
  return id;
}

// Pareil pour un ustensile, rangé dans le groupe choisi ("recipients", "outils"…)
function ajouterUstensilePerso(nom, groupe) {
  nom = nettoyerNom(nom);
  const id = identifiantPerso(nom);
  if (!ustensiles[id]) {
    const nouveau = { nom: nom, groupe: groupe, sprite: null };
    joueur.ustensilesPerso[id] = nouveau;
    ustensiles[id] = nouveau;
    sauvegarder();
  }
  return id;
}

// ---------- Les recettes ----------

// Une recette vide, prête à être remplie par l'assistant.
// Date.now() (le nombre de millisecondes depuis 1970) donne un
// identifiant différent à chaque recette.
function nouvelleRecettePerso(categorie) {
  return {
    id: "perso-recette-" + Date.now(),
    perso: true,
    nom: "",
    categorie: categorie, // "sale" ou "sucre"
    sprite: null,
    initiale: "?",
    difficulte: 1,
    niveauRequis: 1,      // toujours débloquée
    temps: 10,
    ingredients: [],      // { id, quantite }
    ustensiles: [],       // identifiants du catalogue
    etapes: []            // { type, ustensile, texte, + ingredient / action et fois / duree }
  };
}

// Les recettes perso d'une catégorie
function recettesPersoDe(categorie) {
  return joueur.recettesPerso.filter(recette => recette.categorie === categorie);
}

// Enregistre une recette : la remplace si elle existe déjà (modification),
// sinon l'ajoute à la fin de la liste
function enregistrerRecettePerso(recette) {
  recette.initiale = recette.nom.trim().charAt(0).toUpperCase() || "?";
  const position = joueur.recettesPerso.findIndex(r => r.id === recette.id);
  if (position === -1) {
    joueur.recettesPerso.push(recette);
  } else {
    joueur.recettesPerso[position] = recette;
  }
  sauvegarder();
}

// Supprime une recette perso (et son compteur de fois faite)
function supprimerRecettePerso(id) {
  joueur.recettesPerso = joueur.recettesPerso.filter(r => r.id !== id);
  delete joueur.recettesFaites[id];
  joueur.grimoireLu = joueur.grimoireLu.filter(idLu => idLu !== id);
  sauvegarder();
}

// ---------- Les quantités (nombre + unité, choisis avec des flèches) ----------

// Fabrique une liste de valeurs : de "debut" à "fin", de "pas" en "pas"
function valeursDe(debut, fin, pas) {
  const liste = [];
  for (let v = debut; v <= fin + 0.001; v += pas) liste.push(Math.round(v * 100) / 100);
  return liste;
}

// Chaque unité : son nom, s'il prend un "s" au pluriel, sa valeur de départ,
// et les valeurs possibles (les flèches passent de l'une à la suivante).
// Le pas grandit avec la quantité : 5 g, 10 g… puis 50 g, pour ne pas taper 100 fois.
const UNITES = [
  { id: "piece",    nom: "pièce",      pluriel: false, depart: 1,   valeurs: [0.5, ...valeursDe(1, 24, 1)] },
  { id: "g",        nom: "g",          pluriel: false, depart: 100, valeurs: [...valeursDe(5, 50, 5), ...valeursDe(60, 200, 10), ...valeursDe(225, 500, 25), ...valeursDe(550, 1000, 50)] },
  { id: "kg",       nom: "kg",         pluriel: false, depart: 1,   valeurs: valeursDe(0.25, 5, 0.25) },
  { id: "ml",       nom: "ml",         pluriel: false, depart: 100, valeurs: [...valeursDe(10, 100, 10), ...valeursDe(125, 500, 25), ...valeursDe(550, 1000, 50)] },
  { id: "cl",       nom: "cl",         pluriel: false, depart: 10,  valeurs: [...valeursDe(1, 10, 1), ...valeursDe(15, 100, 5)] },
  { id: "l",        nom: "L",          pluriel: false, depart: 1,   valeurs: valeursDe(0.25, 5, 0.25) },
  { id: "soupe",    nom: "c. à soupe", pluriel: false, depart: 1,   valeurs: valeursDe(0.5, 10, 0.5) },
  { id: "cafe",     nom: "c. à café",  pluriel: false, depart: 1,   valeurs: valeursDe(0.5, 10, 0.5) },
  { id: "pincee",   nom: "pincée",     pluriel: true,  depart: 1,   valeurs: valeursDe(1, 10, 1) },
  { id: "gousse",   nom: "gousse",     pluriel: true,  depart: 1,   valeurs: valeursDe(1, 10, 1) },
  { id: "tranche",  nom: "tranche",    pluriel: true,  depart: 1,   valeurs: valeursDe(1, 20, 1) },
  { id: "noisette", nom: "noisette",   pluriel: true,  depart: 1,   valeurs: valeursDe(1, 10, 1) },
  { id: "sachet",   nom: "sachet",     pluriel: true,  depart: 1,   valeurs: valeursDe(0.5, 10, 0.5) },
  { id: "boite",    nom: "boîte",      pluriel: true,  depart: 1,   valeurs: valeursDe(0.5, 5, 0.5) },
  { id: "gout",     nom: "au goût",    pluriel: false, depart: 0,   valeurs: [] } // pas de nombre
];

function trouverUnite(id) {
  return UNITES.find(u => u.id === id);
}

// 0.5 → "½", 1.5 → "1 ½", 0.25 → "¼", 2 → "2", 1.2 → "1,2"
function formaterNombre(nombre) {
  const entier = Math.floor(nombre);
  const reste = Math.round((nombre - entier) * 100) / 100;
  const fractions = { 0.25: "¼", 0.5: "½", 0.75: "¾" };
  if (reste === 0) return String(entier);
  if (fractions[reste]) return (entier > 0 ? entier + " " : "") + fractions[reste];
  return String(nombre).replace(".", ","); // virgule à la française
}

// Le texte rangé dans la recette : "250 g", "2 pincées", "½", "au goût"
// (une pièce n'affiche que le nombre : "2" œufs)
function formaterQuantite(nombre, uniteId) {
  const unite = trouverUnite(uniteId);
  if (unite.id === "gout") return "au goût";
  const texteNombre = formaterNombre(nombre);
  if (unite.id === "piece") return texteNombre;
  const nom = unite.pluriel && nombre >= 2 ? unite.nom + "s" : unite.nom;
  return texteNombre + " " + nom;
}

// L'unité proposée par défaut pour un nouvel ingrédient
function uniteParDefaut(idIngredient) {
  if (idIngredient === "sel" || idIngredient === "poivre") return "pincee";
  if (idIngredient === "ail") return "gousse";
  return "piece";
}

// ---------- Renommer un ingrédient ----------

// Renomme un ingrédient partout (catalogue, recettes). Renvoie false si le nom
// est refusé (vide pour un ingrédient créé, ou déjà pris par un autre).
//  - ingrédient créé par le joueur : son nom est simplement remplacé ;
//  - ingrédient du jeu : le nouveau nom est rangé dans joueur.nomsIngredients,
//    et un nom vide rétablit le nom d'origine.
function renommerIngredient(id, nouveauNom) {
  const nom = nettoyerNom(nouveauNom);
  const ingredient = ingredients[id];
  const estPerso = id in joueur.ingredientsPerso;

  if (nom === "") {
    if (estPerso) return false;                        // pas de nom d'origine à rétablir
    if (ingredient.nomOrigine) ingredient.nom = ingredient.nomOrigine;
    delete joueur.nomsIngredients[id];
    sauvegarder();
    return true;
  }

  // Un autre ingrédient porte déjà ce nom ? (sans tenir compte des accents)
  const pris = Object.keys(ingredients).some(autre =>
    autre !== id && identifiantPerso(ingredients[autre].nom) === identifiantPerso(nom));
  if (pris) return false;

  if (estPerso) {
    joueur.ingredientsPerso[id].nom = nom;
  } else {
    if (!ingredient.nomOrigine) ingredient.nomOrigine = ingredient.nom;
    joueur.nomsIngredients[id] = nom;
  }
  ingredient.nom = nom;
  sauvegarder();
  return true;
}

// ---------- Toutes les recettes ----------

// Les recettes du jeu, puis celles du joueur (pour le Grimoire).
// concat colle deux listes l'une après l'autre, sans modifier les originales.
function toutesLesRecettes() {
  return recettesEcrites().concat(joueur.recettesPerso); // sans les recettes prévues
}
