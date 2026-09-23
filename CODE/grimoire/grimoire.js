// ==========================================================
// GRIMOIRE : le carnet des recettes déjà cuisinées
// Une ligne par recette : son nom si on l'a faite au moins une fois,
// "???" sinon. On touche un nom pour ouvrir la fiche complète.
// ==========================================================

// Le récap complet d'une recette, en HTML : ingrédients, ustensiles, étapes.
// Utilisé par la fiche du Grimoire ET par l'écran de fin (fin-recette.js).
function htmlRecap(recette) {
  const lignesIngredients = recette.ingredients
    .map(ligne => `<li><strong>${ingredients[ligne.id].nom}</strong> · ${ligne.quantite}</li>`)
    .join("");
  const lignesUstensiles = recette.ustensiles.map(nom => `<li>${nom}</li>`).join("");
  const lignesEtapes = recette.etapes.map(etape => `<li>${etape.texte}</li>`).join("");

  return `
    <h4>Ingrédients</h4>
    <ul>${lignesIngredients}</ul>
    <h4>Ustensiles</h4>
    <ul>${lignesUstensiles}</ul>
    <h4>Étapes</h4>
    <ol>${lignesEtapes}</ol>`;
}

// ---------- L'écran Grimoire ----------

// Une ligne par recette, comme la table des matières d'un livre :
// juste le nom (pas de rang ni de compteur, ça c'est pour l'écran Recettes)
function afficherGrimoire() {
  const liste = document.getElementById("liste-grimoire");
  liste.innerHTML = "";
  let decouvertes = 0;

  for (const recette of recettes) {
    const ligne = document.createElement("li");
    const bouton = document.createElement("button");
    bouton.className = "ligne-grimoire";

    if (nombreDeFois(recette.id) === 0) {
      // Jamais cuisinée : page encore vierge
      bouton.disabled = true;
      bouton.textContent = "???";
    } else {
      decouvertes++;
      bouton.textContent = recette.nom;
      bouton.addEventListener("click", () => ouvrirFiche(recette));
    }

    ligne.appendChild(bouton);
    liste.appendChild(ligne);
  }

  document.getElementById("grimoire-compte").textContent =
    decouvertes + " / " + recettes.length + " recettes découvertes";

  afficherEcran("ecran-grimoire");
}

// ---------- La fiche d'une recette ----------

let recetteDeLaFiche = null;

function ouvrirFiche(recette) {
  recetteDeLaFiche = recette;

  document.getElementById("fiche-titre").textContent = recette.nom;
  document.getElementById("fiche-sprite").innerHTML =
    htmlSprite(recette.sprite, recette.initiale, recette.nom);
  document.getElementById("fiche-infos").textContent =
    "★".repeat(recette.difficulte) + " · " + recette.temps + " min";
  document.getElementById("fiche-recap").innerHTML = htmlRecap(recette);

  afficherEcran("ecran-fiche");
}

document.getElementById("fiche-retour").addEventListener("click", afficherGrimoire);
document.getElementById("fiche-cuisiner").addEventListener("click", () => ouvrirPreparation(recetteDeLaFiche));
document.getElementById("grimoire-retour").addEventListener("click", afficherAccueil);
