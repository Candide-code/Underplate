// ==========================================================
// LISTE DES RECETTES
// Un tableau [ ] qui contient un objet { } par recette.
//
// Les 3 types d'étapes :
//   "ajouter" → glisser un ingrédient dans l'ustensile
//   "action"  → taper l'ustensile plusieurs fois (champ "fois")
//   "cuisson" → minuteur (champ "duree", en secondes)
// ==========================================================

const recettes = [
  {
    id: "omelette",
    nom: "Omelette au fromage",
    sprite: null,          // pas encore dessiné
    initiale: "O",         // lettre du sprite temporaire
    difficulte: 1,         // de 1 à 5 étoiles
    niveauRequis: 1,       // niveau du joueur pour la débloquer
    temps: 10,             // en minutes

    // Ce qu'il faut préparer (écran de préparation)
    ingredients: [
      { id: "oeuf",    quantite: "2" },
      { id: "fromage", quantite: "30 g, râpé" },
      { id: "beurre",  quantite: "1 noisette" },
      { id: "sel",     quantite: "1 pincée" },
      { id: "poivre",  quantite: "1 pincée" }
    ],
    ustensiles: ["Bol", "Fourchette", "Poêle", "Spatule"],

    // Le déroulé, une étape par écran
    etapes: [
      { type: "ajouter", ustensile: "bol",   ingredient: "oeuf",
        texte: "Casse 2 œufs dans un bol." },
      { type: "ajouter", ustensile: "bol",   ingredient: "sel",
        texte: "Ajoute une pincée de sel." },
      { type: "ajouter", ustensile: "bol",   ingredient: "poivre",
        texte: "Et une pincée de poivre." },
      { type: "action",  ustensile: "bol",   action: "Battre", fois: 6,
        texte: "Bats les œufs à la fourchette jusqu'à ce que ce soit bien mélangé." },
      { type: "ajouter", ustensile: "poele", ingredient: "beurre",
        texte: "Fais fondre le beurre dans la poêle, à feu moyen." },
      { type: "action",  ustensile: "poele", action: "Verser", fois: 1,
        texte: "Verse les œufs battus dans la poêle." },
      { type: "cuisson", ustensile: "poele", duree: 120,
        texte: "Laisse cuire 2 min sans remuer. Les bords doivent prendre." },
      { type: "ajouter", ustensile: "poele", ingredient: "fromage",
        texte: "Parsème le fromage sur une moitié de l'omelette." },
      { type: "action",  ustensile: "poele", action: "Plier", fois: 2,
        texte: "Plie l'omelette en deux avec la spatule." },
      { type: "cuisson", ustensile: "poele", duree: 60,
        texte: "Encore 1 min pour que le fromage fonde, puis glisse-la dans l'assiette." }
    ]
  }
];
