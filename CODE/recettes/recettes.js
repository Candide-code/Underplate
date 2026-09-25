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
    categorie: "sale",     // "sale" ou "sucre" : dans quel menu elle apparaît
    sprite: "assets/sprites/plats/omelette.png", // pack « Pixel Food » (ghostpixxells)
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
    ustensiles: ["bol", "fourchette", "poele", "spatule"], // identifiants du catalogue

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
    categorie: "sale",
    sprite: "assets/sprites/plats/pates-tomate.png",
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
    ustensiles: ["casserole", "poele", "cuillere", "passoire"],

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
  },

  {
    id: "cookies",
    nom: "Cookies",
    categorie: "sucre",
    sprite: "assets/sprites/plats/cookies.png", // pack « Pixel Food » (ghostpixxells)
    initiale: "C",
    difficulte: 2,
    niveauRequis: 1,
    temps: 60, // arrondi : 15-20 min de préparation + 35 min de congélateur + 12 min de cuisson

    // Pour 15 cookies
    ingredients: [
      { id: "beurre",           quantite: "200 g, mou" },
      { id: "sucre",            quantite: "200 g (roux ou blanc)" },
      { id: "oeuf",             quantite: "2" },
      { id: "farine",           quantite: "280 g" },
      { id: "levure-chimique",  quantite: "1 c. à café" },
      { id: "pepites-chocolat", quantite: "150 g" }
    ],
    ustensiles: ["saladier", "cuillere", "congelateur", "four", "plaque", "papier-cuisson"],

    // Le four préchauffe pendant les 10 dernières minutes de congélateur :
    // l'attente de 35 min est coupée en deux minuteurs (25 + 10).
    etapes: [
      { type: "ajouter", ustensile: "saladier", ingredient: "beurre",
        texte: "Mets le beurre mou dans le saladier." },
      { type: "ajouter", ustensile: "saladier", ingredient: "sucre",
        texte: "Ajoute le sucre, roux ou blanc." },
      { type: "action",  ustensile: "saladier", action: "Mélanger", fois: 6,
        texte: "Mélange jusqu'à obtenir une crème." },
      { type: "ajouter", ustensile: "saladier", ingredient: "oeuf",
        texte: "Ajoute les 2 œufs." },
      { type: "action",  ustensile: "saladier", action: "Mélanger", fois: 4,
        texte: "Mélange bien." },
      { type: "ajouter", ustensile: "saladier", ingredient: "farine",
        texte: "Ajoute la farine…" },
      { type: "ajouter", ustensile: "saladier", ingredient: "levure-chimique",
        texte: "…et la levure chimique." },
      { type: "action",  ustensile: "saladier", action: "Mélanger", fois: 6,
        texte: "Mélange jusqu'à obtenir une pâte homogène." },
      { type: "ajouter", ustensile: "saladier", ingredient: "pepites-chocolat",
        texte: "Ajoute les pépites de chocolat." },
      { type: "action",  ustensile: "saladier", action: "Mélanger", fois: 3,
        texte: "Mélange pour bien les répartir dans la pâte." },
      { type: "action",  ustensile: "congelateur", action: "Mettre", fois: 1,
        texte: "Mets la pâte au congélateur." },
      { type: "cuisson", ustensile: "congelateur", duree: 1500,
        texte: "Laisse durcir la pâte 25 min." },
      { type: "action",  ustensile: "four", action: "Préchauffer", fois: 1,
        texte: "Préchauffe le four à 180 °C. La pâte reste au congélateur." },
      { type: "cuisson", ustensile: "congelateur", duree: 600,
        texte: "Encore 10 min de congélateur, le temps que le four chauffe." },
      { type: "action",  ustensile: "plaque", action: "Mettre", fois: 15,
        texte: "Pose du papier cuisson sur la plaque et forme 15 boules de pâte. Un tap par boule !" },
      { type: "action",  ustensile: "four", action: "Enfourner", fois: 1,
        texte: "Enfourne la plaque." },
      { type: "cuisson", ustensile: "four", duree: 720,
        texte: "Laisse cuire 12 min à 180 °C." },
      { type: "action",  ustensile: "four", action: "Sortir", fois: 1,
        texte: "Sors les cookies et laisse-les refroidir sur la plaque avant de les décoller." }
    ]
  }
];
