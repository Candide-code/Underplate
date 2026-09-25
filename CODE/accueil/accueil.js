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
  afficherEcran("ecran-accueil");
}

document.getElementById("menu-recettes").addEventListener("click", () => afficherCategories("jeu"));
document.getElementById("menu-custom").addEventListener("click", () => afficherCategories("perso"));
// afficherGrimoire est dans grimoire.js, chargé APRÈS ce fichier : on l'appelle
// dans une petite fonction () => …, qui ne la cherche qu'au moment du clic
document.getElementById("menu-grimoire").addEventListener("click", () => afficherGrimoire());

// ---------- Salé ou sucré ? ----------

const CATEGORIES = {
  sale:  "Salé",
  sucre: "Sucré"
};

// D'où on vient : "jeu" (bouton RECETTES) ou "perso" (bouton CUSTOM)
let sourceChoisie = "jeu";
// La catégorie affichée dans la grille (pour y revenir avec ←)
let categorieChoisie = "sale";

// source : "jeu" ou "perso". Sans rien, on garde la dernière choisie.
function afficherCategories(source) {
  if (source) sourceChoisie = source;
  document.getElementById("categories-titre").textContent =
    sourceChoisie === "perso" ? "Mes recettes" : "Tes recettes";
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
function afficherRecettes(categorie, source) {
  if (categorie) categorieChoisie = categorie;
  if (source) sourceChoisie = source;
  const perso = sourceChoisie === "perso";

  const niveauJoueur = calculerNiveau(joueur.xp).niveau;
  const grille = document.getElementById("grille-recettes");
  grille.innerHTML = ""; // on vide la grille avant de la remplir

  // Les recettes du jeu ou les recettes perso, de la catégorie choisie
  // (filter garde seulement celles qui passent le test)
  const liste = perso
    ? recettesPersoDe(categorieChoisie)
    : recettes.filter(recette => recette.categorie === categorieChoisie);

  document.getElementById("recettes-titre").textContent = CATEGORIES[categorieChoisie];
  document.getElementById("recettes-ajouter").hidden = !perso; // + seulement dans CUSTOM

  const vide = document.getElementById("recettes-vide");
  vide.hidden = liste.length > 0;
  vide.textContent = perso
    ? "Pas encore de recette à toi ici. Touche + pour en créer une !"
    : "Pas encore de recette ici… bientôt !";

  for (const recette of liste) {
    const carte = document.createElement("button");
    carte.className = "carte-recette cadre";

    if (recette.niveauRequis > niveauJoueur) {
      // Recette verrouillée : on cache tout sauf le niveau requis
      carte.classList.add("verrouillee");
      carte.disabled = true;
      carte.innerHTML = `
        <span class="sprite sprite-temp">?</span>
        <h3>???</h3>
        <div class="carte-infos"><span>🔒</span><span>Niv. ${recette.niveauRequis}</span></div>`;
    } else {
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
    }

    grille.appendChild(carte);
  }

  afficherEcran("ecran-recettes");
}

// () => … : sinon le navigateur passerait l'événement du clic comme "source"
document.getElementById("recettes-retour").addEventListener("click", () => afficherCategories());

// + : ouvre l'assistant de création (custom/assistant.js) dans la catégorie affichée
document.getElementById("recettes-ajouter").addEventListener("click", () => ouvrirAssistant(categorieChoisie));
