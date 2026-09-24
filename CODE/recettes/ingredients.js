// ==========================================================
// CATALOGUE DES INGRÉDIENTS
// Chaque ingrédient est décrit une seule fois ici, puis les
// recettes y font référence par son identifiant (ex. "oeuf").
// sprite: null = pas encore dessiné → on affiche un sprite temporaire.
// Sur le plateau de cuisine, on n'affiche que les ingrédients de la recette.
// ==========================================================

const ingredients = {
  oeuf:         { nom: "Œufs",        sprite: "assets/sprites/ingredients/oeuf.png" },
  fromage:      { nom: "Fromage",     sprite: "assets/sprites/ingredients/fromage.png" },
  sel:          { nom: "Sel",         sprite: "assets/sprites/ingredients/sel.png" },
  riz:          { nom: "Riz",         sprite: "assets/sprites/ingredients/riz.png" },
  "pain-de-mie": { nom: "Pain de mie", sprite: "assets/sprites/ingredients/pain-de-mie.png" },
  poulet:       { nom: "Poulet",      sprite: "assets/sprites/ingredients/poulet.png" },
  jambon:       { nom: "Jambon",      sprite: "assets/sprites/ingredients/jambon.png" },
  ail:          { nom: "Ail",         sprite: "assets/sprites/ingredients/ail.png" },
  oignon:       { nom: "Oignon",      sprite: "assets/sprites/ingredients/oignon.png" },
  carotte:      { nom: "Carotte",     sprite: "assets/sprites/ingredients/carotte.png" },
  "pomme-de-terre": { nom: "Pomme de terre", sprite: "assets/sprites/ingredients/pomme-de-terre.png" },
  tomate:       { nom: "Tomate",      sprite: "assets/sprites/ingredients/tomate.png" },
  "petits-pois": { nom: "Petits pois", sprite: "assets/sprites/ingredients/petits-pois.png" },
  beurre:       { nom: "Beurre",      sprite: null },
  poivre:       { nom: "Poivre",      sprite: null },
  pates:        { nom: "Pâtes",       sprite: null },
  huile:        { nom: "Huile",       sprite: null },
  basilic:      { nom: "Basilic",     sprite: null },
  eau:          { nom: "Eau",         sprite: null }
};

// Les ustensiles affichés au centre de l'écran de cuisine
const ustensiles = {
  bol:       { nom: "Bol",       sprite: null },
  poele:     { nom: "Poêle",     sprite: null },
  casserole: { nom: "Casserole", sprite: null }
};
