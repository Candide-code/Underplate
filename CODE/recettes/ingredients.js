// ==========================================================
// CATALOGUE DES INGRÉDIENTS
// Chaque ingrédient est décrit une seule fois ici, puis les
// recettes y font référence par son identifiant (ex. "oeuf").
// sprite: null = pas encore dessiné → on affiche un sprite temporaire.
// Les ingrédients qui ne sont pas dans la recette servent de pièges.
// ==========================================================

const ingredients = {
  oeuf:         { nom: "Œufs",        sprite: "assets/sprites/ingredients/oeuf.png" },
  fromage:      { nom: "Fromage",     sprite: "assets/sprites/ingredients/fromage.png" },
  sel:          { nom: "Sel",         sprite: "assets/sprites/ingredients/sel.png" },
  riz:          { nom: "Riz",         sprite: "assets/sprites/ingredients/riz.png" },
  "pain-de-mie": { nom: "Pain de mie", sprite: "assets/sprites/ingredients/pain-de-mie.png" },
  poulet:       { nom: "Poulet",      sprite: "assets/sprites/ingredients/poulet.png" },
  jambon:       { nom: "Jambon",      sprite: "assets/sprites/ingredients/jambon.png" },
  beurre:       { nom: "Beurre",      sprite: null },
  poivre:       { nom: "Poivre",      sprite: null }
};

// Les ustensiles affichés au centre de l'écran de cuisine
const ustensiles = {
  bol:   { nom: "Bol",   sprite: null },
  poele: { nom: "Poêle", sprite: null }
};
