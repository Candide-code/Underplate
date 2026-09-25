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
  },

  {
    id: "pates-tomate",
    nom: "Pâtes à la sauce tomate",
    sprite: null,
    initiale: "P",
    difficulte: 1,
    niveauRequis: 1,
    temps: 20,

    ingredients: [
      { id: "pates",   quantite: "100 g" },
      { id: "tomate",  quantite: "200 g concassées (½ boîte)" },
      { id: "ail",     quantite: "1 gousse" },
      { id: "huile",   quantite: "1 c. à soupe" },
      { id: "sel",     quantite: "2 pincées" },
      { id: "eau",     quantite: "1 L" },
      { id: "basilic", quantite: "quelques feuilles (facultatif)" }
    ],
    ustensiles: ["Casserole", "Poêle", "Cuillère en bois", "Passoire"],

    // La sauce se prépare pendant que l'eau chauffe, puis mijote
    // pendant que les pâtes cuisent : on passe d'un ustensile à l'autre.
    etapes: [
      { type: "ajouter", ustensile: "casserole", ingredient: "eau",
        texte: "Remplis la casserole d'eau et mets-la sur feu vif, avec un couvercle." },
      { type: "ajouter", ustensile: "poele",     ingredient: "huile",
        texte: "Pendant que l'eau chauffe, verse l'huile dans la poêle, à feu moyen." },
      { type: "ajouter", ustensile: "poele",     ingredient: "ail",
        texte: "Épluche et hache l'ail, puis fais-le revenir 1 min. Il ne doit pas brûler." },
      { type: "ajouter", ustensile: "poele",     ingredient: "tomate",
        texte: "Ajoute les tomates concassées." },
      { type: "ajouter", ustensile: "poele",     ingredient: "sel",
        texte: "Et une pincée de sel." },
      { type: "action",  ustensile: "poele",     action: "Remuer", fois: 3,
        texte: "Remue, puis baisse à feu doux : la sauce va mijoter pendant la cuisson des pâtes." },
      { type: "ajouter", ustensile: "casserole", ingredient: "sel",
        texte: "Quand l'eau bout à gros bouillons, ajoute une pincée de sel." },
      { type: "ajouter", ustensile: "casserole", ingredient: "pates",
        texte: "Verse les pâtes dans l'eau." },
      { type: "cuisson", ustensile: "casserole", duree: 600,
        texte: "Laisse cuire environ 10 min (regarde le paquet). Remue les pâtes et la sauce de temps en temps." },
      { type: "action",  ustensile: "casserole", action: "Égoutter", fois: 1,
        texte: "Égoutte les pâtes dans la passoire." },
      { type: "action",  ustensile: "poele",     action: "Mélanger", fois: 3,
        texte: "Verse les pâtes dans la poêle et mélange-les bien avec la sauce." },
      { type: "ajouter", ustensile: "poele",     ingredient: "basilic",
        texte: "Sers et ajoute quelques feuilles de basilic, si tu en as." }
    ]
  }
];
