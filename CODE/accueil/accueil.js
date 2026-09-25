// ==========================================================
// ACCUEIL : en-tête du joueur + menu (Recettes / Grimoire / Custom)
// RECETTES et CUSTOM : choix salé / sucré, puis une carte par recette
// (les deux utilisent les mêmes écrans, voir "sourceChoisie")
// ==========================================================

// ---------- Accueil (le menu) ----------

function afficherAccueil() {
  afficherEntete();
  // Badge NEW! sur GRIMOIRE tant qu'une nouvelle fiche n'a pas été ouverte
  document.getElementById("grimoire-badge").hidden = !grimoireANouveautes();
  // Badge NEW! sur RECETTES tant qu'une recette débloquée n'a jamais été cuisinée
  document.getElementById("recettes-badge").hidden = recettesNouvelles("jeu").length === 0;
  afficherEcran("ecran-accueil");
}

document.getElementById("menu-recettes").addEventListener("click", () => afficherCategories("jeu"));
document.getElementById("menu-custom").addEventListener("click", () => afficherCategories("perso"));
// afficherGrimoire est dans grimoire.js, chargé APRÈS ce fichier : on l'appelle
// dans une petite fonction () => …, qui ne la cherche qu'au moment du clic
document.getElementById("menu-grimoire").addEventListener("click", () => {
  document.getElementById("recherche-grimoire").value = ""; // on rouvre le Grimoire sans recherche
  afficherGrimoire();
});

// ---------- Salé ou sucré ? ----------

const CATEGORIES = {
  sale:  "Salé",
  sucre: "Sucré"
};

// D'où on vient : "jeu" (bouton RECETTES) ou "perso" (bouton CUSTOM)
let sourceChoisie = "jeu";
// La catégorie affichée dans la grille (pour y revenir avec ←)
let categorieChoisie = "sale";

// Les recettes « nouvelles » : débloquées (niveau suffisant) mais jamais cuisinées.
// source : "jeu" (RECETTES) ou "perso" (CUSTOM) ; categorie : "sale", "sucre" ou rien = toutes
function recettesNouvelles(source, categorie) {
  const niveau = calculerNiveau(joueur.xp).niveau;
  const liste = source === "perso" ? joueur.recettesPerso : recettesEcrites();
  return liste.filter(r =>
    r.niveauRequis <= niveau &&
    nombreDeFois(r.id) === 0 &&
    (!categorie || r.categorie === categorie));
}

// source : "jeu" ou "perso". Sans rien, on garde la dernière choisie.
function afficherCategories(source) {
  if (source) sourceChoisie = source;
  document.getElementById("categories-titre").textContent =
    sourceChoisie === "perso" ? "Mes recettes" : "Tes recettes";
  // Badge NEW! sur SALÉ / SUCRÉ s'il y a une recette nouvelle dans cette catégorie
  document.getElementById("badge-sale").hidden = recettesNouvelles(sourceChoisie, "sale").length === 0;
  document.getElementById("badge-sucre").hidden = recettesNouvelles(sourceChoisie, "sucre").length === 0;
  afficherEcran("ecran-categories");
}

document.getElementById("categorie-sale").addEventListener("click", () => afficherRecettes("sale"));
document.getElementById("categorie-sucre").addEventListener("click", () => afficherRecettes("sucre"));
document.getElementById("categories-retour").addEventListener("click", afficherAccueil);

// ---------- La grille d'une catégorie ----------

// Bordure selon le rang de maîtrise : ajoute "maitrise rang-or", etc. à la carte
function appliquerRang(carte, fois) {
  const rang = rangDeMaitrise(fois);
  if (rang) {
    carte.classList.add("maitrise", "rang-" + rang.nom.toLowerCase());
    carte.title = "Rang " + rang.nom;
  }
}

// categorie : "sale" ou "sucre" ; source : "jeu" ou "perso".
// Sans rien, on garde les derniers choix.
// La grille affichée juste avant (pour vider la recherche quand on en change)
let grillePrecedente = "";

function afficherRecettes(categorie, source) {
  if (categorie) categorieChoisie = categorie;
  if (source) sourceChoisie = source;
  const perso = sourceChoisie === "perso";

  // Nouvelle catégorie (ou RECETTES ↔ CUSTOM) : on repart d'une recherche vide.
  // En revenant d'une recette avec ←, la recherche est gardée.
  const champRecherche = document.getElementById("recherche-recettes");
  if (grillePrecedente !== sourceChoisie + categorieChoisie) champRecherche.value = "";
  grillePrecedente = sourceChoisie + categorieChoisie;
  const recherche = simplifier(champRecherche.value); // base/outils.js

  const niveauJoueur = calculerNiveau(joueur.xp).niveau;
  const grille = document.getElementById("grille-recettes");
  grille.innerHTML = ""; // on vide la grille avant de la remplir

  // Les recettes de la catégorie choisie (filter garde celles qui passent le test)
  const deLaCategorie = perso
    ? recettesPersoDe(categorieChoisie)
    : recettes.filter(recette => recette.categorie === categorieChoisie);

  // Débloquées = niveau suffisant ET écrite. Les NEW! (jamais faites) en premier :
  // sort les range, et renvoie -1 / 1 pour mettre a avant / après b.
  const liste = deLaCategorie
    .filter(r => r.niveauRequis <= niveauJoueur && !r.aVenir)
    .filter(r => simplifier(r.nom).includes(recherche)) // "" est inclus dans tout : sans recherche, tout passe
    .sort((a, b) => (nombreDeFois(a.id) === 0 ? -1 : 0) - (nombreDeFois(b.id) === 0 ? -1 : 0));

  // Les 3 prochaines verrouillées, de la plus proche à la plus lointaine (RECETTES seulement)
  // (pendant une recherche, le bandeau est caché : on ne cherche pas un nom secret)
  const aDebloquer = perso || recherche !== "" ? [] : deLaCategorie
    .filter(r => r.niveauRequis > niveauJoueur || r.aVenir)
    .sort((a, b) => a.niveauRequis - b.niveauRequis)
    .slice(0, 3); // slice(0, 3) garde les 3 premières
  afficherBandeau(aDebloquer, niveauJoueur);

  document.getElementById("recettes-titre").textContent = CATEGORIES[categorieChoisie];
  document.getElementById("recettes-ajouter").hidden = !perso; // + seulement dans CUSTOM

  const vide = document.getElementById("recettes-vide");
  vide.hidden = liste.length > 0;
  vide.textContent = recherche !== ""
    ? "Aucune recette ne correspond."
    : perso
      ? "Pas encore de recette à toi ici. Touche + pour en créer une !"
      : "Pas encore de recette ici… bientôt !";

  // Une carte par recette débloquée (les verrouillées sont dans le bandeau)
  for (const recette of liste) {
    const carte = document.createElement("button");
    carte.className = "carte-recette cadre";
    const fois = nombreDeFois(recette.id);

    appliquerRang(carte, fois);

    carte.innerHTML = `
      ${fois === 0 ? '<span class="badge-new">NEW!</span>' : ""}
      ${htmlSprite(recette.sprite, recette.initiale, recette.nom)}
      <h3>${recette.nom}</h3>
      <div class="carte-infos">
        <span class="difficulte">${"★".repeat(recette.difficulte)}</span>
        <span class="fois-faite">${fois === 0 ? "jamais" : "✓x" + fois}</span>
      </div>`;
    carte.addEventListener("click", () => ouvrirPreparation(recette));

    grille.appendChild(carte);
  }

  afficherEcran("ecran-recettes");
}

// Le bandeau « À DÉBLOQUER » : une petite tuile 🔒 par recette à venir.
// Une recette prévue dont on a déjà atteint le niveau affiche « Bientôt ».
function afficherBandeau(aDebloquer, niveauJoueur) {
  document.getElementById("bandeau-debloquer").hidden = aDebloquer.length === 0;
  const tuiles = document.getElementById("tuiles-debloquer");
  tuiles.innerHTML = "";
  for (const recette of aDebloquer) {
    const tuile = document.createElement("div");
    tuile.className = "tuile-verrouillee";
    const texte = recette.niveauRequis <= niveauJoueur ? "Bientôt" : "Niv. " + recette.niveauRequis;
    tuile.innerHTML = `<span class="tuile-cadenas">🔒</span><span>???</span><span>${texte}</span>`;
    tuiles.appendChild(tuile);
  }
}

// () => … : sinon le navigateur passerait l'événement du clic comme "source"
document.getElementById("recettes-retour").addEventListener("click", () => afficherCategories());

// + : ouvre l'assistant de création (custom/assistant.js) dans la catégorie affichée
document.getElementById("recettes-ajouter").addEventListener("click", () => ouvrirAssistant(categorieChoisie));

// La recherche filtre la grille à chaque lettre tapée
document.getElementById("recherche-recettes").addEventListener("input", () => afficherRecettes());
