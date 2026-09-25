// ==========================================================
// ASSISTANT CUSTOM : créer une recette en 5 étapes
//   1. Infos   2. Ingrédients   3. Ustensiles   4. Étapes   5. Récap
//
// On remplit "recetteEnCours" (une recette vide créée par
// nouvelleRecettePerso, dans custom.js) page après page.
// Elle n'est enregistrée qu'à la fin (page 5).
// ==========================================================

const NB_PAGES = 5;

let recetteEnCours = null; // la recette qu'on est en train de créer (ou de modifier)
let pageAssistant = 1;     // la page affichée (1 à 5)
let recetteModifiee = null; // la recette d'origine si on modifie (null = nouvelle recette)

// ---------- Ouvrir / naviguer ----------

// categorie : "sale" ou "sucre" (celle de la grille où on a touché +)
function ouvrirAssistant(categorie) {
  recetteModifiee = null;
  recetteEnCours = nouvelleRecettePerso(categorie);
  demarrerAssistant();
}

// ✏️ MODIFIER (écran de préparation) : l'assistant s'ouvre pré-rempli.
// On travaille sur une COPIE : JSON.stringify transforme la recette en texte,
// JSON.parse la recrée → un objet tout neuf, avec les mêmes valeurs. Tant qu'on
// n'a pas enregistré, la vraie recette ne change pas. Elle garde son identifiant :
// compteur, rang de maîtrise et XP restent les mêmes.
function modifierRecettePerso(recette) {
  recetteModifiee = recette;
  recetteEnCours = JSON.parse(JSON.stringify(recette));
  // Sécurité : une ligne sans nombre ni unité (recette pas créée par l'assistant)
  for (const ligne of recetteEnCours.ingredients) {
    if (!ligne.unite) { ligne.unite = "piece"; ligne.nombre = 1; }
  }
  demarrerAssistant();
}

function demarrerAssistant() {
  const modif = recetteModifiee !== null;
  document.getElementById("assistant-titre").textContent = modif ? "Modifier la recette" : "Nouvelle recette";
  document.getElementById("abandon-question").textContent = modif ? "* Annuler les modifications ?" : "* Abandonner cette recette ?";
  document.getElementById("abandon-explication").textContent = modif ? "* La recette restera comme avant." : "* Ce que tu as rempli sera perdu.";
  document.getElementById("abandon-oui").textContent = modif ? "Annuler les modifications" : "Abandonner";
  remplirPageInfos();
  afficherEcran("ecran-assistant");
  afficherPage(1);
}

function afficherPage(numero) {
  pageAssistant = numero;

  // On montre seulement la section dont data-page vaut le bon numéro.
  // dataset.page lit l'attribut HTML data-page="…"
  for (const page of document.querySelectorAll(".page-assistant")) {
    page.hidden = Number(page.dataset.page) !== numero;
  }

  document.getElementById("assistant-progression").textContent =
    "Étape " + numero + "/" + NB_PAGES + " · " + CATEGORIES[recetteEnCours.categorie];

  // Une pastille par page, comme dans l'écran de cuisine
  let pastilles = "";
  for (let i = 1; i <= NB_PAGES; i++) {
    const classe = i < numero ? "faite" : i === numero ? "en-cours" : "";
    pastilles += `<span class="${classe}"></span>`;
  }
  document.getElementById("assistant-pastilles").innerHTML = pastilles;

  // Pas de « précédent » sur la 1re page (visibility garde sa place :
  // le bouton SUIVANT reste bien à droite)
  document.getElementById("assistant-precedent").style.visibility = numero === 1 ? "hidden" : "visible";

  // Chaque page se (re)dessine quand on arrive dessus
  if (numero === 2) remplirPageIngredients();
  if (numero === 3) remplirPageUstensiles();
  if (numero === 4) remplirPageEtapes();
  if (numero === 5) remplirPageRecap();

  // Dernière page : SUIVANT devient AJOUTER
  document.getElementById("assistant-suivant").textContent = numero === NB_PAGES ? (recetteModifiee ? "ENREGISTRER ✓" : "AJOUTER ✓") : "SUIVANT ▶";

  window.scrollTo(0, 0);
}

document.getElementById("assistant-suivant").addEventListener("click", () => {
  // Chaque page vérifie ses champs avant de laisser passer
  if (pageAssistant === 1 && !validerPageInfos()) return;
  if (pageAssistant === 2 && !validerPageIngredients()) return;
  if (pageAssistant === 3 && !validerPageUstensiles()) return;
  if (pageAssistant === 4 && !validerPageEtapes()) return;
  if (pageAssistant < NB_PAGES) afficherPage(pageAssistant + 1);
  else ajouterRecetteAssistant(); // page 5 : on enregistre
});

document.getElementById("assistant-precedent").addEventListener("click", () => {
  if (pageAssistant > 1) afficherPage(pageAssistant - 1);
});

// ---------- Abandonner (✕) ----------

const fenetreAbandon = document.getElementById("confirmer-abandon");

document.getElementById("assistant-quitter").addEventListener("click", () => fenetreAbandon.showModal());
document.getElementById("abandon-non").addEventListener("click", () => fenetreAbandon.close());
document.getElementById("abandon-oui").addEventListener("click", () => {
  fenetreAbandon.close();
  // Rien n'est enregistré : on revient d'où on vient
  if (recetteModifiee) ouvrirPreparation(recetteModifiee);
  else afficherRecettes(recetteEnCours.categorie, "perso");
  recetteEnCours = null;
  recetteModifiee = null;
});

// ---------- Page 1 : infos (nom, difficulté, temps) ----------

function remplirPageInfos() {
  document.getElementById("assistant-nom").value = recetteEnCours.nom;
  document.getElementById("assistant-temps").value = recetteEnCours.temps;
  afficherDifficulte();
}

// ★★ + l'XP que ça rapporte (base, et ×1,5 la 1re fois)
function afficherDifficulte() {
  const d = recetteEnCours.difficulte;
  const xp = XP_PAR_DIFFICULTE[d];
  document.getElementById("assistant-difficulte").textContent = "★".repeat(d);
  document.getElementById("assistant-xp").textContent =
    "Rapporte " + xp + " XP (" + Math.round(xp * 1.5) + " la 1re fois)";
}

// ◀ ▶ : de 1 à 5 étoiles. Math.max / Math.min empêchent de sortir de 1-5.
function changerDifficulte(sens) {
  recetteEnCours.difficulte = Math.min(5, Math.max(1, recetteEnCours.difficulte + sens));
  afficherDifficulte();
}

document.getElementById("difficulte-moins").addEventListener("click", () => changerDifficulte(-1));
document.getElementById("difficulte-plus").addEventListener("click", () => changerDifficulte(+1));

// Vérifie les champs et les range dans la recette. Renvoie true si tout va bien.
function validerPageInfos() {
  const champNom = document.getElementById("assistant-nom");
  const champTemps = document.getElementById("assistant-temps");
  const nom = nettoyerNom(champNom.value); // sans < > : le nom est affiché dans du HTML
  const temps = Number(champTemps.value);

  if (nom === "") {
    faireTrembler(champNom);
    champNom.focus();
    return false;
  }
  // Number.isInteger : un nombre entier (pas 12,5 ni du texte)
  if (!Number.isInteger(temps) || temps < 1 || temps > 600) {
    faireTrembler(champTemps);
    champTemps.focus();
    return false;
  }

  recetteEnCours.nom = nom;
  recetteEnCours.temps = temps;
  return true;
}

// ---------- Page 2 : ingrédients + quantité ----------

// simplifier(texte) est dans base/outils.js (partagée avec les recherches)

// La famille ouverte dans le sous-menu (null = on voit la liste des familles)
let familleOuverte = null;

// Famille d'un ingrédient (par sécurité, Épicerie s'il n'en a pas)
function familleDe(id) {
  return ingredients[id].famille || "epicerie";
}

// La famille où ranger un ingrédient qu'on crée (choisie avec les flèches)
let familleNouvelIngredient = "legumes";

function remplirPageIngredients() {
  familleOuverte = null;
  familleNouvelIngredient = "legumes";
  document.getElementById("assistant-recherche").value = "";
  afficherIngredientsChoisis();
  afficherCatalogueIngredients();
}

// La liste du haut : un bloc par ingrédient choisi
//   [sprite] Nom                 ✕
//    ◀  250  ▶      ◀   g   ▶
// Chaque ligne garde "nombre" et "unite" (pour les flèches) en plus de
// "quantite" (le texte « 250 g », utilisé par la préparation et le Grimoire).
function afficherIngredientsChoisis() {
  const liste = document.getElementById("assistant-ingredients");
  liste.innerHTML = "";

  for (const ligne of recetteEnCours.ingredients) {
    const ingredient = ingredients[ligne.id];
    const element = document.createElement("li");
    element.className = "ligne-choisie";
    element.innerHTML = `
      <div class="ligne-haut">
        ${htmlSprite(ingredient.sprite, ingredient.nom[0], ingredient.nom)}
        <span class="ligne-nom">${ingredient.nom}</span>
        <button class="bouton-fleche petite-fleche renommer" aria-label="Renommer ${ingredient.nom}">✏️</button>
        <button class="bouton-fleche retirer" aria-label="Retirer ${ingredient.nom}">✕</button>
      </div>
      <!-- Mode « renommer » : caché tant qu'on n'a pas touché ✏️ -->
      <div class="ligne-renommer" hidden>
        <input class="champ-texte champ-renommer" type="text" maxlength="30" autocomplete="off">
        <button class="bouton-fleche valider-nom" aria-label="Valider le nom">✓</button>
      </div>
      <div class="ligne-quantite">
        <div class="choix-fleches choix-nombre">
          <button class="bouton-fleche petite-fleche" aria-label="Moins">◀</button>
          <span class="choix-valeur valeur-nombre"></span>
          <button class="bouton-fleche petite-fleche" aria-label="Plus">▶</button>
        </div>
        <div class="choix-fleches choix-unite">
          <button class="bouton-fleche petite-fleche" aria-label="Unité précédente">◀</button>
          <span class="choix-valeur valeur-unite"></span>
          <button class="bouton-fleche petite-fleche" aria-label="Unité suivante">▶</button>
        </div>
      </div>`;

    // Met à jour l'affichage de CETTE ligne et le texte rangé dans la recette
    function rafraichir() {
      const unite = trouverUnite(ligne.unite);
      element.querySelector(".valeur-nombre").textContent = formaterNombre(ligne.nombre);
      element.querySelector(".valeur-unite").textContent = unite.nom;
      element.querySelector(".choix-nombre").hidden = unite.id === "gout"; // « au goût » : pas de nombre
      ligne.quantite = formaterQuantite(ligne.nombre, ligne.unite);
    }

    // ◀ ▶ du nombre : on passe à la valeur précédente / suivante de l'unité
    const flechesNombre = element.querySelectorAll(".choix-nombre .bouton-fleche");
    flechesNombre[0].addEventListener("click", () => changerNombre(ligne, -1, rafraichir));
    flechesNombre[1].addEventListener("click", () => changerNombre(ligne, +1, rafraichir));

    // ◀ ▶ de l'unité : on change d'unité, et le nombre repart de sa valeur de départ
    const flechesUnite = element.querySelectorAll(".choix-unite .bouton-fleche");
    flechesUnite[0].addEventListener("click", () => changerUnite(ligne, -1, rafraichir));
    flechesUnite[1].addEventListener("click", () => changerUnite(ligne, +1, rafraichir));

    // ✏️ : on passe en mode « renommer » (champ prérempli avec le nom actuel)
    const zoneRenommer = element.querySelector(".ligne-renommer");
    const champNom = element.querySelector(".champ-renommer");
    const estPerso = ligne.id in joueur.ingredientsPerso;
    champNom.placeholder = estPerso ? "Nouveau nom" : "Vide = nom d'origine";
    element.querySelector(".renommer").addEventListener("click", () => {
      zoneRenommer.hidden = !zoneRenommer.hidden;
      champNom.value = ingredient.nom;
      if (!zoneRenommer.hidden) champNom.focus();
    });

    // ✓ ou Entrée : on renomme partout. Refusé (vide ou déjà pris) : le champ tremble.
    function validerNom() {
      if (!renommerIngredient(ligne.id, champNom.value)) {
        faireTrembler(champNom);
        return;
      }
      afficherIngredientsChoisis();
      afficherCatalogueIngredients();
    }
    element.querySelector(".valider-nom").addEventListener("click", validerNom);
    champNom.addEventListener("keydown", evenement => {
      if (evenement.key === "Enter") validerNom();
      if (evenement.key === "Escape") zoneRenommer.hidden = true;
    });

    // ✕ : on retire cette ligne (filter garde toutes les autres)
    element.querySelector(".retirer").addEventListener("click", () => {
      recetteEnCours.ingredients = recetteEnCours.ingredients.filter(l => l !== ligne);
      afficherIngredientsChoisis();
      afficherCatalogueIngredients();
    });

    rafraichir();
    liste.appendChild(element);
  }

  document.getElementById("assistant-ingredients-vide").hidden = recetteEnCours.ingredients.length > 0;
}

// Le nombre avance dans la liste des valeurs de l'unité (sans sortir de la liste)
function changerNombre(ligne, sens, rafraichir) {
  const valeurs = trouverUnite(ligne.unite).valeurs;
  let position = valeurs.indexOf(ligne.nombre);
  if (position === -1) position = 0;
  position = Math.min(valeurs.length - 1, Math.max(0, position + sens));
  ligne.nombre = valeurs[position];
  rafraichir();
}

// L'unité tourne en boucle dans la liste UNITES (comme les réglages du chef)
function changerUnite(ligne, sens, rafraichir) {
  const position = UNITES.findIndex(u => u.id === ligne.unite);
  const nouvelle = UNITES[(position + sens + UNITES.length) % UNITES.length];
  ligne.unite = nouvelle.id;
  ligne.nombre = nouvelle.depart;
  rafraichir();
}

// Le bas de la page, qui a 3 états :
//   - on a tapé une recherche → les tuiles de TOUTES les familles qui correspondent
//   - aucune famille ouverte  → les boutons LÉGUMES, VIANDES…
//   - une famille ouverte     → « ← » + son nom, et ses tuiles
function afficherCatalogueIngredients() {
  const recherche = simplifier(document.getElementById("assistant-recherche").value);
  const dejaChoisis = recetteEnCours.ingredients.map(l => l.id);
  const enRecherche = recherche !== "";
  const voirFamilles = !enRecherche && familleOuverte === null;

  document.getElementById("assistant-familles").hidden = !voirFamilles;
  document.getElementById("assistant-famille-haut").hidden = enRecherche || familleOuverte === null;
  document.getElementById("assistant-catalogue").hidden = voirFamilles;

  if (voirFamilles) {
    afficherFamilles(dejaChoisis);
  } else {
    afficherTuiles(recherche, dejaChoisis);
  }
  afficherBoutonCreer();
}

// Les boutons de familles, avec le nombre d'ingrédients encore disponibles
function afficherFamilles(dejaChoisis) {
  const conteneur = document.getElementById("assistant-familles");
  conteneur.innerHTML = "";

  for (const famille of FAMILLES) {
    const nombre = Object.keys(ingredients)
      .filter(id => familleDe(id) === famille.id && !dejaChoisis.includes(id)).length;

    const bouton = document.createElement("button");
    bouton.className = "bouton bouton-famille";
    bouton.innerHTML = `${famille.nom} ▶ <span class="famille-nombre">(${nombre})</span>`;
    bouton.disabled = nombre === 0; // famille vide (ex. Fruits pour l'instant) : grisée
    bouton.addEventListener("click", () => {
      familleOuverte = famille.id;
      familleNouvelIngredient = famille.id; // un ingrédient créé ici ira dans cette famille
      afficherCatalogueIngredients();
    });
    conteneur.appendChild(bouton);
  }
}

// Les tuiles : celles de la recherche, ou celles de la famille ouverte
function afficherTuiles(recherche, dejaChoisis) {
  if (familleOuverte !== null) {
    document.getElementById("assistant-famille-nom").textContent =
      FAMILLES.find(f => f.id === familleOuverte).nom;
  }

  // Object.keys donne la liste des identifiants du catalogue : ["oeuf", "fromage", …]
  const ids = Object.keys(ingredients)
    .filter(id => !dejaChoisis.includes(id))
    .filter(id => recherche !== ""
      ? simplifier(ingredients[id].nom).includes(recherche) // recherche : dans toutes les familles
      : familleDe(id) === familleOuverte)                   // sinon : la famille ouverte
    .sort((a, b) => ingredients[a].nom.localeCompare(ingredients[b].nom, "fr"));

  const catalogue = document.getElementById("assistant-catalogue");
  catalogue.innerHTML = "";
  for (const id of ids) {
    const ingredient = ingredients[id];
    const tuile = document.createElement("button");
    tuile.className = "case-ingredient"; // même look que le plateau de cuisine
    tuile.innerHTML = `
      ${htmlSprite(ingredient.sprite, ingredient.nom[0], ingredient.nom)}
      <span>${ingredient.nom}</span>`;
    tuile.addEventListener("click", () => choisirIngredientAssistant(id));
    catalogue.appendChild(tuile);
  }
}

// Le panneau « Créer … dans : ◀ famille ▶ » : seulement si on a tapé
// quelque chose qui n'existe pas encore dans le catalogue
function afficherBoutonCreer() {
  const texte = document.getElementById("assistant-recherche").value.trim();
  const existe = Object.values(ingredients).some(i => simplifier(i.nom) === simplifier(texte));
  document.getElementById("assistant-creer").hidden = texte === "" || existe;
  document.getElementById("assistant-creer-texte").textContent = "Créer « " + texte + " » dans :";
  document.getElementById("creer-famille").textContent =
    FAMILLES.find(f => f.id === familleNouvelIngredient).nom;
}

// ◀ ▶ : la famille tourne en boucle dans la liste FAMILLES
function changerFamilleNouvelIngredient(sens) {
  const position = FAMILLES.findIndex(f => f.id === familleNouvelIngredient);
  familleNouvelIngredient = FAMILLES[(position + sens + FAMILLES.length) % FAMILLES.length].id;
  afficherBoutonCreer();
}

document.getElementById("creer-famille-moins").addEventListener("click", () => changerFamilleNouvelIngredient(-1));
document.getElementById("creer-famille-plus").addEventListener("click", () => changerFamilleNouvelIngredient(+1));

// Ajoute un ingrédient à la liste, avec une quantité de départ (ex. 1 pièce)
function choisirIngredientAssistant(id) {
  const unite = trouverUnite(uniteParDefaut(id));
  recetteEnCours.ingredients.push({
    id: id,
    nombre: unite.depart,
    unite: unite.id,
    quantite: formaterQuantite(unite.depart, unite.id)
  });
  document.getElementById("assistant-recherche").value = "";
  afficherIngredientsChoisis();
  afficherCatalogueIngredients();

  // On fait défiler jusqu'au nouvel ingrédient (le dernier de la liste)
  const lignes = document.querySelectorAll("#assistant-ingredients .ligne-choisie");
  if (lignes.length > 0) lignes[lignes.length - 1].scrollIntoView({ block: "center" });
}

// La recherche filtre les tuiles à chaque lettre tapée
document.getElementById("assistant-recherche").addEventListener("input", afficherCatalogueIngredients);

// « + Créer » : l'ingrédient rejoint le catalogue (custom.js) puis la liste
document.getElementById("assistant-creer-ingredient").addEventListener("click", () => {
  const texte = document.getElementById("assistant-recherche").value.trim();
  if (texte === "") return;
  // L'ingrédient rejoint sa famille dans le catalogue (custom.js), puis ta liste
  choisirIngredientAssistant(ajouterIngredientPerso(texte, familleNouvelIngredient));
});

// Au moins un ingrédient (les quantités sont toujours valides : choisies aux flèches)
function validerPageIngredients() {
  if (recetteEnCours.ingredients.length === 0) {
    faireTrembler(document.getElementById("assistant-ingredients-vide"));
    return false;
  }
  return true;
}

// ← dans une famille : retour à la liste des familles
document.getElementById("assistant-familles-retour").addEventListener("click", () => {
  familleOuverte = null;
  afficherCatalogueIngredients();
});

// ---------- Page 3 : ustensiles et électroménager ----------

// Le groupe ouvert dans le sous-menu (null = on voit la liste des groupes)
let groupeOuvert = null;
// Le groupe où ranger un ustensile qu'on crée (choisi avec les flèches)
let groupeNouvelUstensile = "cuisson";

// Groupe d'un ustensile (par sécurité, Petits outils s'il n'en a pas)
function groupeDe(id) {
  return ustensiles[id].groupe || "outils";
}

function remplirPageUstensiles() {
  document.getElementById("assistant-recherche-ustensile").value = "";
  groupeOuvert = null;
  groupeNouvelUstensile = "cuisson";
  afficherUstensilesChoisis();
  afficherCatalogueUstensiles();
}

// La liste du haut : [sprite] Nom   ✕
function afficherUstensilesChoisis() {
  const liste = document.getElementById("assistant-ustensiles");
  liste.innerHTML = "";

  for (const id of recetteEnCours.ustensiles) {
    const ustensile = ustensiles[id];
    const element = document.createElement("li");
    element.className = "ligne-choisie";
    element.innerHTML = `
      <div class="ligne-haut ligne-haut-simple">
        ${htmlSprite(ustensile.sprite, ustensile.nom[0], ustensile.nom)}
        <span class="ligne-nom">${ustensile.nom}</span>
        <button class="bouton-fleche retirer" aria-label="Retirer ${ustensile.nom}">✕</button>
      </div>`;
    element.querySelector(".retirer").addEventListener("click", () => {
      recetteEnCours.ustensiles = recetteEnCours.ustensiles.filter(autre => autre !== id);
      afficherUstensilesChoisis();
      afficherCatalogueUstensiles();
    });
    liste.appendChild(element);
  }

  document.getElementById("assistant-ustensiles-vide").hidden = recetteEnCours.ustensiles.length > 0;
}

// Le bas de la page, comme pour les ingrédients, a 3 états :
//   - on a tapé une recherche → les tuiles de TOUS les groupes qui correspondent
//   - aucun groupe ouvert     → les boutons Poêles & casseroles, Plats & moules…
//   - un groupe ouvert        → « ← » + son nom, et ses tuiles
function afficherCatalogueUstensiles() {
  const recherche = simplifier(document.getElementById("assistant-recherche-ustensile").value);
  const enRecherche = recherche !== "";
  const voirGroupes = !enRecherche && groupeOuvert === null;

  document.getElementById("assistant-groupes").hidden = !voirGroupes;
  document.getElementById("assistant-groupe-haut").hidden = enRecherche || groupeOuvert === null;
  document.getElementById("assistant-catalogue-ustensiles").hidden = voirGroupes;

  if (voirGroupes) {
    afficherGroupesUstensiles();
  } else {
    afficherTuilesUstensiles(recherche);
  }
  afficherPanneauCreerUstensile();
}

// Les boutons de groupes, avec le nombre d'ustensiles encore disponibles
function afficherGroupesUstensiles() {
  const conteneur = document.getElementById("assistant-groupes");
  conteneur.innerHTML = "";

  for (const groupe of GROUPES_USTENSILES) {
    const nombre = Object.keys(ustensiles)
      .filter(id => groupeDe(id) === groupe.id && !recetteEnCours.ustensiles.includes(id)).length;
    const bouton = document.createElement("button");
    bouton.className = "bouton bouton-famille";
    bouton.innerHTML = `${groupe.nom} ▶ <span class="famille-nombre">(${nombre})</span>`;
    bouton.disabled = nombre === 0;
    bouton.addEventListener("click", () => {
      groupeOuvert = groupe.id;
      groupeNouvelUstensile = groupe.id; // un ustensile créé ici ira dans ce groupe
      afficherCatalogueUstensiles();
    });
    conteneur.appendChild(bouton);
  }
}

// Les tuiles : celles de la recherche (tous groupes), ou celles du groupe ouvert
function afficherTuilesUstensiles(recherche) {
  if (groupeOuvert !== null) {
    document.getElementById("assistant-groupe-nom").textContent =
      GROUPES_USTENSILES.find(g => g.id === groupeOuvert).nom;
  }

  const ids = Object.keys(ustensiles)
    .filter(id => !recetteEnCours.ustensiles.includes(id))
    .filter(id => recherche !== ""
      ? simplifier(ustensiles[id].nom).includes(recherche)
      : groupeDe(id) === groupeOuvert)
    .sort((a, b) => ustensiles[a].nom.localeCompare(ustensiles[b].nom, "fr"));

  const catalogue = document.getElementById("assistant-catalogue-ustensiles");
  catalogue.innerHTML = "";
  for (const id of ids) {
    const ustensile = ustensiles[id];
    const tuile = document.createElement("button");
    tuile.className = "case-ingredient"; // même look que les tuiles d'ingrédients
    tuile.innerHTML = `
      ${htmlSprite(ustensile.sprite, ustensile.nom[0], ustensile.nom)}
      <span>${ustensile.nom}</span>`;
    tuile.addEventListener("click", () => choisirUstensileAssistant(id));
    catalogue.appendChild(tuile);
  }
}

// ← dans un groupe : retour à la liste des groupes
document.getElementById("assistant-groupes-retour").addEventListener("click", () => {
  groupeOuvert = null;
  afficherCatalogueUstensiles();
});

function choisirUstensileAssistant(id) {
  recetteEnCours.ustensiles.push(id);
  document.getElementById("assistant-recherche-ustensile").value = "";
  afficherUstensilesChoisis();
  afficherCatalogueUstensiles();
}

// Le panneau « Créer … dans : ◀ groupe ▶ » : si ce qu'on tape n'existe pas encore
function afficherPanneauCreerUstensile() {
  const texte = document.getElementById("assistant-recherche-ustensile").value.trim();
  const existe = Object.values(ustensiles).some(u => simplifier(u.nom) === simplifier(texte));
  document.getElementById("assistant-creer-ustensile").hidden = texte === "" || existe;
  document.getElementById("creer-ustensile-texte").textContent = "Créer « " + texte + " » dans :";
  document.getElementById("creer-groupe").textContent =
    GROUPES_USTENSILES.find(g => g.id === groupeNouvelUstensile).nom;
}

function changerGroupeNouvelUstensile(sens) {
  const position = GROUPES_USTENSILES.findIndex(g => g.id === groupeNouvelUstensile);
  groupeNouvelUstensile = GROUPES_USTENSILES[(position + sens + GROUPES_USTENSILES.length) % GROUPES_USTENSILES.length].id;
  afficherPanneauCreerUstensile();
}

document.getElementById("assistant-recherche-ustensile").addEventListener("input", afficherCatalogueUstensiles);
document.getElementById("creer-groupe-moins").addEventListener("click", () => changerGroupeNouvelUstensile(-1));
document.getElementById("creer-groupe-plus").addEventListener("click", () => changerGroupeNouvelUstensile(+1));
document.getElementById("creer-ustensile-ok").addEventListener("click", () => {
  const texte = document.getElementById("assistant-recherche-ustensile").value.trim();
  if (texte === "") return;
  choisirUstensileAssistant(ajouterUstensilePerso(texte, groupeNouvelUstensile));
});

// Au moins un ustensile : chaque étape de la recette se passe dans l'un d'eux
function validerPageUstensiles() {
  if (recetteEnCours.ustensiles.length === 0) {
    faireTrembler(document.getElementById("assistant-ustensiles-vide"));
    return false;
  }
  return true;
}

// ---------- Page 4 : les étapes ----------

// Les 3 types d'étapes (les mêmes que les recettes du jeu, voir recettes.js)
const TYPES_ETAPE = [
  { id: "ajouter", nom: "Ajouter un ingrédient", icone: "➕" },
  { id: "action",  nom: "Action",                icone: "👆" },
  { id: "cuisson", nom: "Cuisson / minuteur",    icone: "⏱" }
];

// Toutes les actions proposées (le bouton de la cuisine affiche « REMUER ! (x3) »)
const ACTIONS = ["Remuer", "Mélanger", "Battre", "Fouetter", "Verser", "Retourner", "Couper",
  "Éplucher", "Râper", "Écraser", "Égoutter", "Pétrir", "Étaler", "Plier", "Assaisonner", "Servir",
  "Mettre", "Couvrir", "Faire chauffer", "Faire fondre", "Faire revenir",
  "Préchauffer", "Enfourner", "Sortir", "Allumer", "Éteindre", "Réchauffer", "Programmer", "Mixer", "Paner", "Dégazer", "Rouler", "Badigeonner"];

// Les actions qui vont avec chaque groupe d'ustensiles : proposées en premier
const ACTIONS_PAR_GROUPE = {
  electromenager: ["Préchauffer", "Allumer", "Mettre", "Enfourner", "Sortir", "Réchauffer", "Programmer", "Mixer", "Éteindre"],
  cuisson:        ["Faire chauffer", "Faire fondre", "Faire revenir", "Remuer", "Mélanger", "Retourner", "Verser", "Couvrir", "Égoutter", "Mettre", "Servir"],
  plats:          ["Mettre", "Étaler", "Verser", "Enfourner", "Sortir", "Couvrir", "Servir"],
  bols:           ["Mélanger", "Battre", "Fouetter", "Verser", "Mettre", "Écraser", "Pétrir", "Dégazer", "Assaisonner", "Paner"],
  outils:         ["Couper", "Éplucher", "Râper", "Écraser", "Étaler", "Rouler", "Badigeonner", "Égoutter", "Fouetter", "Mélanger"]
};

// Quelques appareils ont leurs propres actions (passent avant celles de leur groupe)
const ACTIONS_PAR_USTENSILE = {
  four:               ["Préchauffer", "Enfourner", "Sortir", "Allumer", "Éteindre"],
  microondes:         ["Mettre", "Réchauffer", "Programmer", "Couvrir", "Sortir", "Remuer"],
  "plaque-cuisson":   ["Allumer", "Faire chauffer", "Éteindre"],
  airfryer:           ["Préchauffer", "Mettre", "Programmer", "Retourner", "Sortir"],
  cookeo:             ["Mettre", "Programmer", "Faire revenir", "Remuer", "Servir"],
  "cuiseur-riz":      ["Mettre", "Verser", "Programmer", "Servir"],
  mixeur:             ["Mettre", "Mixer", "Verser"],
  blender:            ["Mettre", "Verser", "Mixer"],
  "mixeur-plongeant": ["Mixer"],
  batteur:            ["Battre", "Fouetter", "Mélanger"],
  robot:              ["Mettre", "Pétrir", "Battre", "Fouetter", "Mélanger"],
  bouilloire:         ["Allumer", "Verser"],
  "grille-pain":      ["Mettre", "Allumer", "Sortir"],
  gaufrier:           ["Préchauffer", "Verser", "Sortir"],
  raclette:           ["Allumer", "Mettre", "Servir"],
  congelateur:        ["Mettre", "Sortir"],
  refrigerateur:      ["Mettre", "Sortir"]
};

// Les actions dans l'ordre pour un ustensile : celles de l'appareil, puis de son
// groupe, puis toutes les autres. new Set(...) enlève les doublons.
function actionsPour(idUstensile) {
  const siennes = ACTIONS_PAR_USTENSILE[idUstensile] || [];
  const deSonGroupe = ACTIONS_PAR_GROUPE[ustensiles[idUstensile].groupe] || [];
  return [...new Set([...siennes, ...deSonGroupe, ...ACTIONS])];
}

// Valeurs des flèches : taps de 1 à 20, minutes de plus en plus espacées, secondes par 15
const VALEURS_FOIS = valeursDe(1, 20, 1);
const VALEURS_MINUTES = [...valeursDe(0, 10, 1), 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 105, 120, 150, 180];
const VALEURS_SECONDES = [0, 15, 30, 45];

// L'étape en cours d'édition (une copie : rien ne change tant qu'on n'a pas enregistré)
let etapeEditee = null;
let positionEditee = -1;    // sa place dans la liste (-1 = nouvelle étape)
let texteAuto = "";         // le dernier texte pré-rempli (pour savoir si on l'a modifié)

function remplirPageEtapes() {
  fermerEditeur();
  afficherEtapesAssistant();
}

// 2 min 30 → "2 min 30", 45 s → "45 s", 3 min → "3 min"
function formaterDuree(secondes) {
  const min = Math.floor(secondes / 60), sec = secondes % 60;
  if (min === 0) return sec + " s";
  return sec === 0 ? min + " min" : min + " min " + sec;
}

// Le résumé d'une étape : « Ajouter · Œufs (2) · Bol »
function resumeEtape(etape) {
  const type = TYPES_ETAPE.find(t => t.id === etape.type);
  let detail = "";
  if (etape.type === "ajouter") {
    const ligne = recetteEnCours.ingredients.find(l => l.id === etape.ingredient);
    detail = ingredients[etape.ingredient].nom + (ligne ? " (" + ligne.quantite + ")" : "");
  }
  if (etape.type === "action")  detail = etape.action + " ×" + etape.fois;
  if (etape.type === "cuisson") detail = formaterDuree(etape.duree);
  return type.icone + " " + detail + " · " + ustensiles[etape.ustensile].nom;
}

// ---------- La liste des étapes ----------

function afficherEtapesAssistant() {
  const liste = document.getElementById("assistant-etapes");
  liste.innerHTML = "";
  const etapes = recetteEnCours.etapes;

  etapes.forEach((etape, position) => {
    const element = document.createElement("li");
    element.className = "ligne-etape";
    element.innerHTML = `
      <p class="etape-resume"></p>
      <p class="etape-texte"></p>
      <div class="etape-boutons">
        <button class="bouton-fleche petite-fleche monter" aria-label="Monter">↑</button>
        <button class="bouton-fleche petite-fleche descendre" aria-label="Descendre">↓</button>
        <button class="bouton-fleche petite-fleche modifier" aria-label="Modifier">✏️</button>
        <button class="bouton-fleche petite-fleche supprimer" aria-label="Supprimer">✕</button>
      </div>`;
    // textContent (et pas innerHTML) : le texte tapé s'affiche tel quel, sans risque
    element.querySelector(".etape-resume").textContent = (position + 1) + ". " + resumeEtape(etape);
    element.querySelector(".etape-texte").textContent = "« " + etape.texte + " »";

    const monter = element.querySelector(".monter");
    const descendre = element.querySelector(".descendre");
    monter.disabled = position === 0;
    descendre.disabled = position === etapes.length - 1;

    // ↑ ↓ : on échange l'étape avec sa voisine
    monter.addEventListener("click", () => echangerEtapes(position, position - 1));
    descendre.addEventListener("click", () => echangerEtapes(position, position + 1));
    element.querySelector(".modifier").addEventListener("click", () => ouvrirEditeur(position));
    element.querySelector(".supprimer").addEventListener("click", () => {
      etapes.splice(position, 1); // splice retire 1 élément à cette position
      fermerEditeur();
      afficherEtapesAssistant();
    });

    liste.appendChild(element);
  });

  document.getElementById("assistant-etapes-vide").hidden = etapes.length > 0;
}

function echangerEtapes(a, b) {
  const etapes = recetteEnCours.etapes;
  [etapes[a], etapes[b]] = [etapes[b], etapes[a]];
  fermerEditeur();
  afficherEtapesAssistant();
}

// ---------- L'éditeur d'une étape ----------

// position : l'étape à modifier, ou -1 pour une nouvelle étape
function ouvrirEditeur(position) {
  positionEditee = position;
  if (position === -1) {
    // Nouvelle étape : on part de « Ajouter » avec le 1er ingrédient et le 1er ustensile
    etapeEditee = {
      type: "ajouter",
      ustensile: recetteEnCours.ustensiles[0],
      ingredient: recetteEnCours.ingredients[0].id,
      action: actionsPour(recetteEnCours.ustensiles[0])[0], fois: 3, duree: 120,
      texte: ""
    };
  } else {
    // Modification : une copie de l'étape, avec des valeurs par défaut pour les autres types
    etapeEditee = { action: ACTIONS[0], fois: 3, duree: 120, ingredient: recetteEnCours.ingredients[0].id,
      ...recetteEnCours.etapes[position] };
  }

  document.getElementById("editeur-titre").textContent =
    position === -1 ? "Nouvelle étape" : "Modifier l'étape " + (position + 1);
  document.getElementById("editeur-texte").value = etapeEditee.texte;
  texteAuto = position === -1 ? "" : null; // une étape existante garde son texte
  document.getElementById("editeur-etape").hidden = false;
  document.getElementById("etape-nouvelle").hidden = true;
  afficherReglagesEditeur();
  document.getElementById("editeur-etape").scrollIntoView({ block: "start" });
}

function fermerEditeur() {
  etapeEditee = null;
  document.getElementById("editeur-etape").hidden = true;
  document.getElementById("etape-nouvelle").hidden = false;
}

// Les lignes ◀ valeur ▶ de l'éditeur, selon le type d'étape
function afficherReglagesEditeur() {
  const e = etapeEditee;
  const reglages = [
    { nom: "Type",      liste: TYPES_ETAPE.map(t => t.id), valeur: e.type,
      texte: id => TYPES_ETAPE.find(t => t.id === id).icone + " " + TYPES_ETAPE.find(t => t.id === id).nom,
      changer: v => { e.type = v; } },
    { nom: "Ustensile", liste: recetteEnCours.ustensiles, valeur: e.ustensile,
      texte: id => ustensiles[id].nom,
      changer: v => { e.ustensile = v; e.action = actionsPour(v)[0]; } }
  ];
  if (e.type === "ajouter") {
    reglages.push({ nom: "Ingrédient", liste: recetteEnCours.ingredients.map(l => l.id), valeur: e.ingredient,
      texte: id => ingredients[id].nom, changer: v => { e.ingredient = v; } });
  }
  if (e.type === "action") {
    reglages.push({ nom: "Action", liste: actionsPour(e.ustensile), valeur: e.action, texte: a => a, changer: v => { e.action = v; } });
    reglages.push({ nom: "Taps", liste: VALEURS_FOIS, valeur: e.fois, texte: n => "×" + n,
      changer: v => { e.fois = v; }, sansBoucle: true });
  }
  if (e.type === "cuisson") {
    reglages.push({ nom: "Minutes", liste: VALEURS_MINUTES, valeur: Math.floor(e.duree / 60), texte: n => n + " min",
      changer: v => { e.duree = v * 60 + (e.duree % 60); }, sansBoucle: true });
    reglages.push({ nom: "Secondes", liste: VALEURS_SECONDES, valeur: e.duree % 60, texte: n => n + " s",
      changer: v => { e.duree = Math.floor(e.duree / 60) * 60 + v; } });
  }

  const conteneur = document.getElementById("editeur-reglages");
  conteneur.innerHTML = "";
  for (const r of reglages) {
    // Nom du réglage au-dessus, puis ◀ valeur ▶ sur toute la largeur
    const ligne = document.createElement("div");
    ligne.className = "champ";
    ligne.innerHTML = `
      <span class="champ-nom">${r.nom}</span>
      <div class="choix-fleches">
        <button class="bouton-fleche" aria-label="${r.nom} précédent">◀</button>
        <span class="choix-valeur valeur-famille valeur-editeur"></span>
        <button class="bouton-fleche" aria-label="${r.nom} suivant">▶</button>
      </div>`;
    ligne.querySelector(".valeur-editeur").textContent = r.texte(r.valeur);

    const fleches = ligne.querySelectorAll(".bouton-fleche");
    fleches[0].addEventListener("click", () => changerReglage(r, -1));
    fleches[1].addEventListener("click", () => changerReglage(r, +1));
    conteneur.appendChild(ligne);
  }

  preremplirTexte();
}

// ◀ ▶ : valeur précédente / suivante. Les listes « sansBoucle » (taps, minutes)
// s'arrêtent aux bouts ; les autres tournent en boucle.
function changerReglage(reglage, sens) {
  const n = reglage.liste.length;
  let position = reglage.liste.indexOf(reglage.valeur);
  if (position === -1) position = 0;
  position = reglage.sansBoucle
    ? Math.min(n - 1, Math.max(0, position + sens))
    : (position + sens + n) % n;
  reglage.changer(reglage.liste[position]);
  afficherReglagesEditeur();
}

// Un texte proposé pour la consigne, que l'on peut ensuite modifier
function texteSuggere(e) {
  if (e.type === "ajouter") {
    const ligne = recetteEnCours.ingredients.find(l => l.id === e.ingredient);
    return "Ajoute : " + ingredients[e.ingredient].nom + (ligne ? " (" + ligne.quantite + ")" : "") + ".";
  }
  if (e.type === "action") return e.action + " (" + ustensiles[e.ustensile].nom.toLowerCase() + ").";
  return "Laisse cuire " + formaterDuree(e.duree) + ".";
}

// On met à jour la consigne proposée… seulement si on ne l'a pas déjà réécrite soi-même
function preremplirTexte() {
  const champ = document.getElementById("editeur-texte");
  if (texteAuto !== null && (champ.value === "" || champ.value === texteAuto)) {
    texteAuto = texteSuggere(etapeEditee);
    champ.value = texteAuto;
  }
}

document.getElementById("etape-nouvelle").addEventListener("click", () => ouvrirEditeur(-1));
document.getElementById("editeur-annuler").addEventListener("click", fermerEditeur);

// ✓ : on range l'étape dans la recette (seulement les champs utiles à son type)
document.getElementById("editeur-enregistrer").addEventListener("click", () => {
  const champ = document.getElementById("editeur-texte");
  const texte = nettoyerNom(champ.value); // sans < > : la consigne est affichée dans du HTML
  const e = etapeEditee;
  if (texte === "") { faireTrembler(champ); champ.focus(); return; }
  if (e.type === "cuisson" && e.duree === 0) { faireTrembler(document.getElementById("editeur-reglages")); return; }

  const etape = { type: e.type, ustensile: e.ustensile, texte: texte };
  if (e.type === "ajouter") etape.ingredient = e.ingredient;
  if (e.type === "action")  { etape.action = e.action; etape.fois = e.fois; }
  if (e.type === "cuisson") etape.duree = e.duree;

  if (positionEditee === -1) recetteEnCours.etapes.push(etape);
  else recetteEnCours.etapes[positionEditee] = etape;

  fermerEditeur();
  afficherEtapesAssistant();
});

// Au moins une étape ; et on vérifie que chaque étape utilise encore un ingrédient
// et un ustensile de la recette (on a pu en retirer en revenant en arrière)
function validerPageEtapes() {
  const etapes = recetteEnCours.etapes;
  if (etapes.length === 0) {
    faireTrembler(document.getElementById("assistant-etapes-vide"));
    return false;
  }
  const idsIngredients = recetteEnCours.ingredients.map(l => l.id);
  const cassee = etapes.findIndex(e => !recetteEnCours.ustensiles.includes(e.ustensile) ||
    (e.type === "ajouter" && !idsIngredients.includes(e.ingredient)));
  if (cassee !== -1) {
    alert("L'étape " + (cassee + 1) + " utilise un ingrédient ou un ustensile que tu as retiré. Modifie-la avec ✏️.");
    return false;
  }
  return true;
}

// ---------- Page 5 : récap et enregistrement ----------

// Le récap : la recette présentée comme sa fiche du Grimoire
function remplirPageRecap() {
  const r = recetteEnCours;
  const xp = XP_PAR_DIFFICULTE[r.difficulte];
  document.getElementById("assistant-recap-sprite").innerHTML =
    htmlSprite(r.sprite, r.nom.charAt(0).toUpperCase(), r.nom);
  document.getElementById("assistant-recap-nom").textContent = r.nom;
  document.getElementById("assistant-recap-infos").textContent =
    "★".repeat(r.difficulte) + " · " + r.temps + " min · +" + Math.round(xp * 1.5) + " XP la 1re fois";
  document.getElementById("assistant-recap").innerHTML = htmlRecap(r); // même HTML que le Grimoire (grimoire.js)
}

// AJOUTER ✓ / ENREGISTRER ✓ : la recette rejoint CUSTOM (custom.js).
// enregistrerRecettePerso remplace l'ancienne version si l'identifiant existe déjà.
function ajouterRecetteAssistant() {
  const recette = recetteEnCours;
  const etaitUneModif = recetteModifiee !== null;
  enregistrerRecettePerso(recette);
  recetteEnCours = null;
  recetteModifiee = null;
  if (etaitUneModif) {
    ouvrirPreparation(recette);                 // on voit tout de suite le résultat
  } else {
    afficherRecettes(recette.categorie, "perso"); // elle y apparaît avec son badge NEW!
  }
}

// ---------- Boutons de l'écran de préparation (recette perso) ----------

// recetteChoisie : la recette ouverte dans la préparation (preparation.js)
document.getElementById("prepa-modifier").addEventListener("click", () => modifierRecettePerso(recetteChoisie));

const fenetreSuppression = document.getElementById("confirmer-suppression");
document.getElementById("prepa-supprimer").addEventListener("click", () => fenetreSuppression.showModal());
document.getElementById("suppression-non").addEventListener("click", () => fenetreSuppression.close());
document.getElementById("suppression-oui").addEventListener("click", () => {
  fenetreSuppression.close();
  const categorie = recetteChoisie.categorie;
  supprimerRecettePerso(recetteChoisie.id);
  afficherRecettes(categorie, "perso");
});
