// ==========================================================
// CUISINE : une étape à la fois
// Type "ajouter" → plateau d'ingrédients
// Type "action"  → taper plusieurs fois
// Type "cuisson" → minuteur
// ==========================================================

// L'état de la recette en cours
const cuisine = {
  recette: null,
  indexEtape: 0,
  erreurs: 0,          // erreurs sur l'étape en cours
  taps: 0,             // taps sur l'étape "action" en cours
  minuteur: null,      // l'intervalle du minuteur (pour pouvoir l'arrêter)
  secondesRestantes: 0,
  heureFin: 0          // quand la cuisson se termine (en millisecondes, voir Date.now())
};

function etapeActuelle() {
  return cuisine.recette.etapes[cuisine.indexEtape];
}

// ---------- Démarrer / quitter ----------

function demarrerCuisine(recette) {
  cuisine.recette = recette;
  cuisine.indexEtape = 0;
  document.getElementById("cuisine-contenu").innerHTML = "";
  preparerPlateau(recette);
  afficherEtape();
  afficherEcran("ecran-cuisine");
  garderEcranAllume(); // l'écran reste allumé pendant toute la recette
}

// ✕ ne quitte pas tout de suite : on demande confirmation.
// showModal() ouvre la <dialog> par-dessus l'écran ; close() la ferme.
const fenetreQuitter = document.getElementById("confirmer-quitter");

document.getElementById("cuisine-quitter").addEventListener("click", () => {
  fenetreQuitter.showModal();
});

// "Continuer" : on ferme la fenêtre, la recette reprend où elle en était
document.getElementById("quitter-non").addEventListener("click", () => {
  fenetreQuitter.close();
});

// "Quitter la recette" : on arrête tout et on revient à l'accueil
document.getElementById("quitter-oui").addEventListener("click", () => {
  fenetreQuitter.close();
  arreterMinuteur();
  laisserEcranSEteindre();
  afficherAccueil();
});

// ---------- Afficher l'étape en cours ----------

function afficherEtape() {
  arreterMinuteur();
  const etapes = cuisine.recette.etapes;
  const etape = etapeActuelle();
  cuisine.erreurs = 0;
  cuisine.taps = 0;

  // Nouvelle étape : on efface les encadrés rouges des erreurs précédentes
  for (const bouton of document.querySelectorAll(".case-ingredient.erreur")) {
    bouton.classList.remove("erreur");
  }

  // Progression : "Étape 3/10" + une pastille par étape
  document.getElementById("cuisine-progression").textContent =
    "Étape " + (cuisine.indexEtape + 1) + "/" + etapes.length;
  let pastilles = "";
  for (let i = 0; i < etapes.length; i++) {
    let classe = "";
    if (i < cuisine.indexEtape) classe = "faite";
    if (i === cuisine.indexEtape) classe = "en-cours";
    pastilles += `<span class="${classe}"></span>`;
  }
  document.getElementById("cuisine-pastilles").innerHTML = pastilles;

  // Si on change d'ustensile (bol → poêle), on vide le contenu affiché
  const precedente = etapes[cuisine.indexEtape - 1];
  if (precedente && precedente.ustensile !== etape.ustensile) {
    document.getElementById("cuisine-contenu").innerHTML = "";
  }
  const ustensile = ustensiles[etape.ustensile];
  document.getElementById("cuisine-ustensile").innerHTML =
    htmlSprite(ustensile.sprite, ustensile.nom, ustensile.nom);

  // Texte de l'étape dans la boîte de dialogue
  document.getElementById("cuisine-texte").textContent = "* " + etape.texte;
  document.getElementById("cuisine-aide").hidden = true;

  // On montre seulement la zone du bas qui correspond au type d'étape
  document.getElementById("zone-plateau").hidden = etape.type !== "ajouter";
  document.getElementById("zone-action").hidden = etape.type !== "action";
  document.getElementById("zone-cuisson").hidden = etape.type !== "cuisson";

  if (etape.type === "action") preparerAction(etape);
  if (etape.type === "cuisson") preparerCuisson(etape);
}

function etapeSuivante() {
  cuisine.indexEtape++;
  if (cuisine.indexEtape >= cuisine.recette.etapes.length) {
    laisserEcranSEteindre(); // la cuisine est finie, le téléphone peut se mettre en veille
    terminerRecette(cuisine.recette);
  } else {
    afficherEtape();
  }
}

// ---------- Type "ajouter" : le plateau ----------

// Le plateau = uniquement les ingrédients de la recette, mélangés
function preparerPlateau(recette) {
  const idsRecette = recette.ingredients.map(ligne => ligne.id);
  const plateau = document.getElementById("cuisine-plateau");
  plateau.innerHTML = "";

  for (const id of melanger(idsRecette)) {
    const ingredient = ingredients[id];
    const bouton = document.createElement("button");
    bouton.className = "case-ingredient";
    bouton.innerHTML = `
      ${htmlSprite(ingredient.sprite, ingredient.nom[0], ingredient.nom)}
      <span>${ingredient.nom}</span>`;
    bouton.addEventListener("click", () => choisirIngredient(id, bouton));
    plateau.appendChild(bouton);
  }
}

function choisirIngredient(id, bouton) {
  const etape = etapeActuelle();

  if (id === etape.ingredient) {
    // Bon ingrédient : il apparaît dans l'ustensile, et on passe à la suite
    const ingredient = ingredients[id];
    document.getElementById("cuisine-contenu").innerHTML +=
      htmlSprite(ingredient.sprite, ingredient.nom[0], ingredient.nom);
    etapeSuivante();
    return;
  }

  // Mauvais ingrédient : pas de pénalité, juste un petit signal
  cuisine.erreurs++;
  bouton.classList.add("erreur"); // encadré rouge jusqu'à la fin de l'étape
  faireTrembler(bouton);
  faireTrembler(document.getElementById("ecran-cuisine"));
  vibrer(150);

  if (cuisine.erreurs >= 3) {
    const aide = document.getElementById("cuisine-aide");
    aide.textContent = "* Psst… prends : " + ingredients[etape.ingredient].nom + ".";
    aide.hidden = false;
  }
}

// ---------- Type "action" : taper plusieurs fois ----------

function preparerAction(etape) {
  document.getElementById("action-bouton").textContent = etape.action.toUpperCase() + " ! (x" + etape.fois + ")";
  document.getElementById("action-jauge").style.width = "0%";
}

document.getElementById("action-bouton").addEventListener("click", () => {
  const etape = etapeActuelle();
  if (cuisine.taps >= etape.fois) return; // jauge déjà pleine : on ignore les taps en trop
  cuisine.taps++;
  document.getElementById("action-jauge").style.width = (cuisine.taps / etape.fois) * 100 + "%";
  faireTrembler(document.getElementById("cuisine-scene"));

  if (cuisine.taps >= etape.fois) {
    setTimeout(etapeSuivante, 300); // petite pause pour voir la jauge pleine
  }
});

// ---------- Type "cuisson" : le minuteur ----------

function preparerCuisson(etape) {
  cuisine.secondesRestantes = etape.duree;
  afficherMinuteur();
  document.getElementById("minuteur-lancer").hidden = false;
  document.getElementById("minuteur-suivant").hidden = true;
  document.getElementById("minuteur-passer").hidden = false;
}

// Affiche les secondes au format 01:30
function afficherMinuteur() {
  const minutes = Math.floor(cuisine.secondesRestantes / 60);
  const secondes = cuisine.secondesRestantes % 60;
  document.getElementById("minuteur-affichage").textContent =
    String(minutes).padStart(2, "0") + ":" + String(secondes).padStart(2, "0");
}

function arreterMinuteur() {
  clearInterval(cuisine.minuteur);
  cuisine.minuteur = null;
}

document.getElementById("minuteur-lancer").addEventListener("click", () => {
  document.getElementById("minuteur-lancer").hidden = true;
  preparerSon(); // on profite du clic pour autoriser le bip de fin

  // On ne compte pas les secondes une par une : on retient l'heure de fin.
  // Date.now() = l'heure actuelle en millisecondes (1 s = 1000 ms).
  cuisine.heureFin = Date.now() + cuisine.secondesRestantes * 1000;

  // setInterval exécute la fonction toutes les 250 ms (4 fois par seconde,
  // pour que l'affichage change pile au bon moment)
  cuisine.minuteur = setInterval(mettreAJourMinuteur, 250);
});

// Temps restant = heure de fin − heure actuelle.
// Même si le navigateur a sauté des "tics" (appli en arrière-plan),
// le calcul reste juste car l'horloge du téléphone, elle, ne s'arrête jamais.
function mettreAJourMinuteur() {
  const millisecondesRestantes = cuisine.heureFin - Date.now();
  cuisine.secondesRestantes = Math.max(0, Math.ceil(millisecondesRestantes / 1000));
  afficherMinuteur();

  if (cuisine.secondesRestantes <= 0) {
    arreterMinuteur();
    jouerBip();
    vibrer([200, 100, 200]);
    document.getElementById("cuisine-texte").textContent = "* C'est prêt !";
    document.getElementById("minuteur-suivant").hidden = false;
    document.getElementById("minuteur-passer").hidden = true;
  }
}

// Quand on revient sur la page, on met le minuteur à jour tout de suite
// (sans attendre le prochain "tic")
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && cuisine.minuteur) {
    mettreAJourMinuteur();
  }
});

document.getElementById("minuteur-suivant").addEventListener("click", etapeSuivante);
document.getElementById("minuteur-passer").addEventListener("click", etapeSuivante);
