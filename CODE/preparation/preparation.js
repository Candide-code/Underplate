// ==========================================================
// PRÉPARATION : vérifier qu'on a tout avant de cuisiner
// ==========================================================

let recetteChoisie = null;

function ouvrirPreparation(recette) {
  recetteChoisie = recette;

  // MODIFIER / Supprimer : seulement pour une recette perso (voir custom/assistant.js)
  document.getElementById("prepa-perso").hidden = !recette.perso;

  const niveauJoueur = calculerNiveau(joueur.xp).niveau;
  const fois = nombreDeFois(recette.id);
  const xp = calculerXpGagnee(recette, niveauJoueur, fois);

  // Rang de maîtrise actuel et objectif suivant
  const rang = rangDeMaitrise(fois);
  const suivant = rangSuivant(fois);
  let texteRang = rang ? "Rang " + rang.nom + " (+" + pourcentageBonus(rang) + " % XP)" : "Pas encore de rang";
  if (suivant) {
    texteRang += " · " + fois + "/" + suivant.fois + " vers " + suivant.nom;
  }

  document.getElementById("prepa-titre").textContent = recette.nom;
  document.getElementById("prepa-sprite").innerHTML =
    htmlSprite(recette.sprite, recette.initiale, recette.nom);
  document.getElementById("prepa-infos").innerHTML =
    "★".repeat(recette.difficulte) + " · " + recette.temps + " min · +" + xp + " XP<br>" + texteRang;

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
  for (const id of recette.ustensiles) {
    listeUstensiles.innerHTML += `<li><label><input type="checkbox"> ${ustensiles[id].nom}</label></li>`;
  }

  afficherEcran("ecran-preparation");
}

// ← : retour à la grille de la catégorie de cette recette (salé ou sucré)
document.getElementById("prepa-retour").addEventListener("click", () =>
  afficherRecettes(recetteChoisie.categorie, recetteChoisie.perso ? "perso" : "jeu"));
document.getElementById("prepa-commencer").addEventListener("click", () => demarrerCuisine(recetteChoisie));
