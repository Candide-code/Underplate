// ==========================================================
// PRÉPARATION : vérifier qu'on a tout avant de cuisiner
// ==========================================================

let recetteChoisie = null;

function ouvrirPreparation(recette) {
  recetteChoisie = recette;

  const niveauJoueur = calculerNiveau(joueur.xp).niveau;
  const dejaFaite = nombreDeFois(recette.id) > 0;
  const xp = calculerXpGagnee(recette, niveauJoueur, dejaFaite);

  document.getElementById("prepa-titre").textContent = recette.nom;
  document.getElementById("prepa-sprite").innerHTML =
    htmlSprite(recette.sprite, recette.initiale, recette.nom);
  document.getElementById("prepa-infos").textContent =
    "★".repeat(recette.difficulte) + " · " + recette.temps + " min · +" + xp + " XP";

  // Ingrédients : une case à cocher par ingrédient, avec sa quantité
  const listeIngredients = document.getElementById("prepa-ingredients");
  listeIngredients.innerHTML = "";
  for (const ligne of recette.ingredients) {
    const ingredient = ingredients[ligne.id];
    listeIngredients.innerHTML += `
      <li><label>
        <input type="checkbox">
        ${htmlSprite(ingredient.sprite, ingredient.nom[0], ingredient.nom)}
        <span><strong>${ingredient.nom}</strong> · ${ligne.quantite}</span>
      </label></li>`;
  }

  // Ustensiles
  const listeUstensiles = document.getElementById("prepa-ustensiles");
  listeUstensiles.innerHTML = "";
  for (const nom of recette.ustensiles) {
    listeUstensiles.innerHTML += `<li><label><input type="checkbox"> ${nom}</label></li>`;
  }

  afficherEcran("ecran-preparation");
}

document.getElementById("prepa-retour").addEventListener("click", afficherAccueil);
document.getElementById("prepa-commencer").addEventListener("click", () => demarrerCuisine(recetteChoisie));
