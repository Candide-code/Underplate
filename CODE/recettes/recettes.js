// ==========================================================
// LISTE DES RECETTES
// Un tableau [ ] qui contient un objet { } par recette.
//
// Les 3 types d'étapes :
//   "ajouter" → glisser un ingrédient dans l'ustensile
//   "action"  → taper l'ustensile plusieurs fois (champ "fois")
//   "cuisson" → minuteur (champ "duree", en secondes)
//
// Une recette « prévue » (aVenir: true) n'a que son niveau et sa catégorie :
// elle s'affiche en 🔒 ??? dans le bandeau « À DÉBLOQUER », mais ne se
// débloque pas tant qu'on ne l'a pas écrite (elle affiche alors « Bientôt »).
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
  },

  {
    id: "prc",
    nom: "PRC (poulet riz courgettes)",
    categorie: "sale",
    sprite: "assets/sprites/plats/prc.png", // poulet rôti du pack « Pixel Food », en attendant mieux
    initiale: "P",
    difficulte: 2,
    niveauRequis: 2,
    temps: 35,

    // Pour 1 personne, version poulet pané (le plat du quotidien)
    ingredients: [
      { id: "poulet",    quantite: "200 g (blanc)" },
      { id: "riz",       quantite: "75 g" },
      { id: "courgette", quantite: "60 g" },
      { id: "oignon",    quantite: "½" },
      { id: "ail",       quantite: "1 gousse" },
      { id: "huile",     quantite: "2 c. à soupe" },
      { id: "farine",    quantite: "2 c. à soupe" },
      { id: "oeuf",      quantite: "1 jaune" },
      { id: "chapelure", quantite: "4 c. à soupe" },
      { id: "sel",       quantite: "1 pincée" },
      { id: "poivre",    quantite: "1 pincée" },
      { id: "eau",       quantite: "1 L" }
    ],
    ustensiles: ["casserole", "poele", "planche", "couteau", "assiette", "fourchette", "spatule", "passoire"],

    // Les courgettes cuisent d'abord ; puis le riz part dans l'eau, et ses
    // ~11 min de cuisson couvrent la panure et le poulet (2 × 5 min).
    etapes: [
      { type: "ajouter", ustensile: "casserole", ingredient: "eau",
        texte: "Remplis la casserole d'eau et mets-la à chauffer sur feu vif." },
      { type: "action",  ustensile: "planche", action: "Couper", fois: 3,
        texte: "Pendant que l'eau chauffe : coupe la courgette en dés, émince le ½ oignon et hache l'ail." },
      { type: "ajouter", ustensile: "poele", ingredient: "huile",
        texte: "Verse 1 c. à soupe d'huile dans la poêle, à feu moyen." },
      { type: "ajouter", ustensile: "poele", ingredient: "oignon",
        texte: "Ajoute l'oignon…" },
      { type: "ajouter", ustensile: "poele", ingredient: "ail",
        texte: "…et l'ail." },
      { type: "action",  ustensile: "poele", action: "Faire revenir", fois: 3,
        texte: "Fais revenir 2 min en remuant." },
      { type: "ajouter", ustensile: "poele", ingredient: "courgette",
        texte: "Ajoute les dés de courgette." },
      { type: "ajouter", ustensile: "poele", ingredient: "poivre",
        texte: "Poivre les légumes." },
      { type: "cuisson", ustensile: "poele", duree: 480,
        texte: "Laisse cuire 8 min à feu moyen-doux, en remuant de temps en temps." },
      { type: "ajouter", ustensile: "casserole", ingredient: "sel",
        texte: "L'eau bout ? Sale-la avec une pincée de sel." },
      { type: "ajouter", ustensile: "casserole", ingredient: "riz",
        texte: "Verse le riz. Il cuit environ 11 min pendant que tu prépares le poulet." },
      { type: "ajouter", ustensile: "assiette", ingredient: "farine",
        texte: "Réserve les légumes dans un bol. Prépare 3 assiettes : dans la 1re, mets la farine." },
      { type: "ajouter", ustensile: "assiette", ingredient: "oeuf",
        texte: "Dans la 2e, le jaune d'œuf, battu à la fourchette." },
      { type: "ajouter", ustensile: "assiette", ingredient: "chapelure",
        texte: "Dans la 3e, la chapelure." },
      { type: "action",  ustensile: "assiette", action: "Paner", fois: 3,
        texte: "Passe le poulet dans la farine, puis le jaune d'œuf, puis la chapelure. Un tap par assiette !" },
      { type: "ajouter", ustensile: "poele", ingredient: "huile",
        texte: "Verse le reste d'huile dans la poêle et fais-la chauffer." },
      { type: "ajouter", ustensile: "poele", ingredient: "poulet",
        texte: "Dépose le poulet pané dans l'huile chaude." },
      { type: "cuisson", ustensile: "poele", duree: 300,
        texte: "Fais-le dorer 5 min." },
      { type: "action",  ustensile: "poele", action: "Retourner", fois: 1,
        texte: "Retourne le poulet avec la spatule." },
      { type: "cuisson", ustensile: "poele", duree: 300,
        texte: "Encore 5 min de l'autre côté : le cœur doit être bien cuit." },
      { type: "action",  ustensile: "casserole", action: "Égoutter", fois: 1,
        texte: "Égoutte le riz dans la passoire." },
      { type: "action",  ustensile: "assiette", action: "Servir", fois: 1,
        texte: "Sers le poulet avec le riz et les courgettes. Bon appétit !" }
    ]
  },

  {
    id: "cinnamon-roll",
    nom: "Cinnamon roll",
    categorie: "sucre",
    sprite: "assets/sprites/plats/cinnamon-roll.png", // brioche du pack « Pixel Food », en attendant mieux
    initiale: "C",
    difficulte: 4,
    niveauRequis: 1,
    temps: 180, // 3 h de préparation (pâte, 2 h de pousse, cuisson), + 2 h d'attente avant de les manger

    // Pour 12 rolls environ
    ingredients: [
      { id: "farine",            quantite: "400 g" },
      { id: "levure-boulangere", quantite: "½ cube fraîche (ou 1 sachet de levure boulangère sèche)" },
      { id: "lait",              quantite: "10 cl tiède + un peu pour badigeonner" },
      { id: "beurre",            quantite: "170 g fondu (70 g pâte + 100 g garniture)" },
      { id: "oeuf",              quantite: "2" },
      { id: "sucre",             quantite: "140 g + un peu (80 g pâte, 60 g garniture)" },
      { id: "sel",               quantite: "2 pincées" },
      { id: "vanille",           quantite: "arôme, à l'œil" },
      { id: "cannelle",          quantite: "1 c. à café + 2 c. à soupe" },
      { id: "cream-cheese",      quantite: "100 g" },
      { id: "sucre-glace",       quantite: "60 g" },
      { id: "eau",               quantite: "un peu, tiède" }
    ],
    ustensiles: ["saladier", "bol", "rouleau", "maryse", "couteau", "pinceau", "plaque", "papier-cuisson", "four"],

    // Les minuteurs bloquent l'écran : la garniture se prépare AVANT les 2 h de
    // pousse, et le glaçage AVANT les 2 h d'attente (ils patientent tranquillement).
    etapes: [
      // --- La pâte ---
      { type: "ajouter", ustensile: "bol", ingredient: "lait",
        texte: "Fais tiédir 10 cl de lait et verse-le dans un bol." },
      { type: "ajouter", ustensile: "bol", ingredient: "levure-boulangere",
        texte: "Émiette le ½ cube de levure fraîche dans le lait tiède (ou verse le sachet de levure boulangère sèche)." },
      { type: "action",  ustensile: "bol", action: "Mélanger", fois: 3,
        texte: "Mélange jusqu'à ce que la levure soit bien diluée." },
      { type: "ajouter", ustensile: "saladier", ingredient: "farine",
        texte: "Mets les 400 g de farine dans le saladier." },
      { type: "action",  ustensile: "saladier", action: "Verser", fois: 1,
        texte: "Verse le lait à la levure sur la farine." },
      { type: "ajouter", ustensile: "saladier", ingredient: "oeuf",
        texte: "Ajoute les 2 œufs." },
      { type: "ajouter", ustensile: "saladier", ingredient: "sucre",
        texte: "Ajoute 80 g de sucre en poudre." },
      { type: "ajouter", ustensile: "saladier", ingredient: "sel",
        texte: "Deux pincées de sel." },
      { type: "ajouter", ustensile: "saladier", ingredient: "beurre",
        texte: "Ajoute 70 g de beurre fondu." },
      { type: "ajouter", ustensile: "saladier", ingredient: "vanille",
        texte: "L'arôme vanille, à l'œil." },
      { type: "ajouter", ustensile: "saladier", ingredient: "cannelle",
        texte: "Et 1 c. à café de cannelle." },
      { type: "cuisson", ustensile: "saladier", duree: 900,
        texte: "Bats la pâte pendant 15 min (à la main ou au robot)." },

      // --- La garniture (elle attendra pendant la pousse) ---
      { type: "ajouter", ustensile: "bol", ingredient: "beurre",
        texte: "Prépare la garniture : 100 g de beurre fondu dans un bol propre." },
      { type: "ajouter", ustensile: "bol", ingredient: "sucre",
        texte: "Ajoute 60 g de sucre." },
      { type: "ajouter", ustensile: "bol", ingredient: "cannelle",
        texte: "Et 2 c. à soupe de cannelle." },
      { type: "action",  ustensile: "bol", action: "Mélanger", fois: 3,
        texte: "Mélange la garniture, et mets-la de côté." },

      // --- La pousse ---
      { type: "cuisson", ustensile: "saladier", duree: 7200,
        texte: "Couvre le saladier et laisse la pâte reposer 2 h." },

      // --- Le façonnage ---
      { type: "action",  ustensile: "four", action: "Préchauffer", fois: 1,
        texte: "Préchauffe le four à 200 °C." },
      { type: "action",  ustensile: "saladier", action: "Dégazer", fois: 3,
        texte: "Dégaze la pâte en appuyant dessus avec le poing." },
      { type: "action",  ustensile: "rouleau", action: "Étaler", fois: 3,
        texte: "Étale la pâte en forme de rectangle." },
      { type: "action",  ustensile: "maryse", action: "Étaler", fois: 3,
        texte: "Étale la garniture sur toute la pâte." },
      { type: "action",  ustensile: "rouleau", action: "Rouler", fois: 3,
        texte: "Roule la pâte en boudin." },
      { type: "action",  ustensile: "couteau", action: "Couper", fois: 12,
        texte: "Coupe des petits rondins et pose-les sur la plaque (papier cuisson). Un tap par roll !" },
      { type: "action",  ustensile: "pinceau", action: "Badigeonner", fois: 3,
        texte: "Badigeonne les rolls de lait tiède au pinceau, et saupoudre un peu de sucre." },

      // --- La cuisson ---
      { type: "action",  ustensile: "four", action: "Enfourner", fois: 1,
        texte: "Enfourne la plaque." },
      { type: "cuisson", ustensile: "four", duree: 720,
        texte: "Laisse cuire 12 min à 200 °C." },
      { type: "action",  ustensile: "four", action: "Sortir", fois: 1,
        texte: "Sors les rolls du four." },

      // --- Le glaçage (il attendra pendant que les rolls refroidissent) ---
      { type: "ajouter", ustensile: "bol", ingredient: "cream-cheese",
        texte: "Prépare le glaçage : le cream cheese dans un bol." },
      { type: "ajouter", ustensile: "bol", ingredient: "sucre-glace",
        texte: "Ajoute les 60 g de sucre glace." },
      { type: "ajouter", ustensile: "bol", ingredient: "eau",
        texte: "Un peu d'eau tiède, à l'œil, pour le détendre." },
      { type: "action",  ustensile: "bol", action: "Mélanger", fois: 4,
        texte: "Mélange jusqu'à obtenir un glaçage lisse." },
      { type: "cuisson", ustensile: "plaque", duree: 7200,
        texte: "Le plus dur : attendre 2 h que les rolls refroidissent avant de les manger. Courage !" },
      { type: "action",  ustensile: "maryse", action: "Étaler", fois: 12,
        texte: "Nappe chaque roll de glaçage. Un tap par roll ! C'est prêt, régale-toi." }
    ]
  },

  {
    id: "gyozas-poulet",
    nom: "Gyozas au poulet maison",
    categorie: "sale",
    sprite: "assets/sprites/plats/gyozas-poulet.png", // dumplings du pack « Pixel Food » (ghostpixxells)
    initiale: "G",
    difficulte: 2,
    niveauRequis: 3,
    temps: 60,

    // Recette perso : farce maison dans des feuilles achetées. Avec 700 g de
    // poulet on en fait beaucoup : on cuit ce qu'on mange, le reste va au congélateur.
    // La sauce se prépare juste avant la cuisson, pour servir les gyozas bien chauds.
    ingredients: [
      { id: "poulet",            quantite: "700 g, haché" },
      { id: "carotte",           quantite: "1 grosse" },
      { id: "oignon",            quantite: "1" },
      { id: "champignon-de-paris", quantite: "1" },
      { id: "oignon-nouveau",    quantite: "quelques tiges (farce + sauce)" },
      { id: "gingembre",         quantite: "1 c. à café" },
      { id: "ail",               quantite: "1 c. à café" },
      { id: "sauce-huitre",      quantite: "3 c. à soupe" },
      { id: "sauce-soja",        quantite: "3 c. à soupe" },
      { id: "feuilles-gyoza",    quantite: "autant que de farce" },
      { id: "eau",               quantite: "un peu" },
      { id: "huile",             quantite: "1 filet" },
      { id: "sauce-soja-sucree", quantite: "6 c. à soupe (sauce)" },
      { id: "huile-pimentee",    quantite: "2 c. à soupe (sauce)" },
      { id: "nokoss",          quantite: "1 c. à café (sauce)" },
      { id: "graines-sesame",    quantite: "1 pincée (sauce)" }
    ],
    ustensiles: ["rape", "planche", "couteau", "saladier", "cuillere", "assiette", "bol", "poele", "congelateur"],

    etapes: [
      // La farce
      { type: "action",  ustensile: "rape", action: "Râper", fois: 2,
        texte: "Râpe la carotte, puis l'oignon." },
      { type: "action",  ustensile: "planche", action: "Couper", fois: 2,
        texte: "Émince le champignon et cisèle les oignons nouveaux. Garde-en un peu pour la sauce." },
      { type: "ajouter", ustensile: "saladier", ingredient: "poulet",
        texte: "Mets le poulet haché dans le saladier." },
      { type: "ajouter", ustensile: "saladier", ingredient: "carotte",
        texte: "Ajoute la carotte râpée…" },
      { type: "ajouter", ustensile: "saladier", ingredient: "oignon",
        texte: "…l'oignon râpé…" },
      { type: "ajouter", ustensile: "saladier", ingredient: "champignon-de-paris",
        texte: "…le champignon…" },
      { type: "ajouter", ustensile: "saladier", ingredient: "oignon-nouveau",
        texte: "…et les oignons nouveaux." },
      { type: "ajouter", ustensile: "saladier", ingredient: "gingembre",
        texte: "Ajoute 1 c. à café de gingembre." },
      { type: "ajouter", ustensile: "saladier", ingredient: "ail",
        texte: "Et 1 c. à café d'ail." },
      { type: "ajouter", ustensile: "saladier", ingredient: "sauce-huitre",
        texte: "Verse 3 c. à soupe de sauce huître…" },
      { type: "ajouter", ustensile: "saladier", ingredient: "sauce-soja",
        texte: "…et 3 c. à soupe de sauce soja." },
      { type: "action",  ustensile: "saladier", action: "Mélanger", fois: 6,
        texte: "Mélange bien toute la farce." },

      // Le pliage
      { type: "ajouter", ustensile: "assiette", ingredient: "feuilles-gyoza",
        texte: "Pose une feuille de gyoza et dépose une petite quantité de farce au centre." },
      { type: "ajouter", ustensile: "assiette", ingredient: "eau",
        texte: "Humidifie les bords de la feuille avec un peu d'eau." },
      { type: "action",  ustensile: "assiette", action: "Plier", fois: 10,
        texte: "Referme en portefeuille. Un tap par gyoza, et continue jusqu'à ce qu'il n'y ait plus de farce !" },

      // La sauce
      { type: "ajouter", ustensile: "bol", ingredient: "sauce-soja-sucree",
        texte: "Prépare la sauce : 6 c. à soupe de soja sucrée dans un bol…" },
      { type: "ajouter", ustensile: "bol", ingredient: "huile-pimentee",
        texte: "…2 c. à soupe d'huile pimentée…" },
      { type: "ajouter", ustensile: "bol", ingredient: "nokoss",
        texte: "…1 c. à café de nokoss…" },
      { type: "ajouter", ustensile: "bol", ingredient: "graines-sesame",
        texte: "…des graines de sésame…" },
      { type: "ajouter", ustensile: "bol", ingredient: "oignon-nouveau",
        texte: "…et le reste des oignons nouveaux." },
      { type: "action",  ustensile: "bol", action: "Mélanger", fois: 3,
        texte: "Mélange la sauce." },

      // La cuisson
      { type: "ajouter", ustensile: "poele", ingredient: "huile",
        texte: "Verse un filet d'huile dans la poêle, à feu moyen-vif." },
      { type: "action",  ustensile: "poele", action: "Mettre", fois: 1,
        texte: "Dépose les gyozas que tu vas manger dans la poêle, à plat." },
      { type: "cuisson", ustensile: "poele", duree: 180,
        texte: "Fais-les dorer jusqu'à ce que le dessous soit bien doré." },
      { type: "ajouter", ustensile: "poele", ingredient: "eau",
        texte: "Ajoute un peu d'eau dans la poêle. Attention, ça crépite !" },
      { type: "action",  ustensile: "poele", action: "Couvrir", fois: 1,
        texte: "Couvre tout de suite." },
      { type: "cuisson", ustensile: "poele", duree: 300,
        texte: "Laisse finir la cuisson à la vapeur, environ 5 min." },
      { type: "action",  ustensile: "assiette", action: "Servir", fois: 1,
        texte: "Sers les gyozas avec la sauce. Bon appétit !" },

      // La conservation
      { type: "action",  ustensile: "congelateur", action: "Mettre", fois: 1,
        texte: "Mets les gyozas pas cuisinés au congélateur pour les conserver." }
    ]
  },

  {
    id: "croque-monsieur",
    nom: "Croque-monsieur",
    categorie: "sale",
    sprite: "assets/sprites/plats/croque-monsieur.png", // pack « Pixel Food » (ghostpixxells)
    initiale: "C",
    difficulte: 2,
    niveauRequis: 4,
    temps: 20,

    // Pour 1 personne (2 croques), au four : le fromage est mélangé à de la
    // crème fraîche (ou du cream cheese), salé et poivré, pour un croque fondant
    ingredients: [
      { id: "pain-de-mie",   quantite: "4 tranches" },
      { id: "jambon",        quantite: "2 tranches" },
      { id: "fromage",       quantite: "60 g, râpé" },
      { id: "creme-fraiche", quantite: "2 c. à soupe (ou cream cheese)" },
      { id: "beurre",        quantite: "10 g" },
      { id: "sel",           quantite: "1 pincée" },
      { id: "poivre",        quantite: "1 pincée" }
    ],
    ustensiles: ["four", "bol", "plaque", "papier-cuisson", "couteau"],

    etapes: [
      { type: "action",  ustensile: "four", action: "Préchauffer", fois: 1,
        texte: "Préchauffe le four à 200 °C (en mode grill si tu as)." },

      // --- Le mélange fromage + crème ---
      { type: "ajouter", ustensile: "bol", ingredient: "fromage",
        texte: "Dans un bol, mets le fromage râpé." },
      { type: "ajouter", ustensile: "bol", ingredient: "creme-fraiche",
        texte: "Ajoute la crème fraîche (ou du cream cheese)." },
      { type: "ajouter", ustensile: "bol", ingredient: "sel",
        texte: "Sale…" },
      { type: "ajouter", ustensile: "bol", ingredient: "poivre",
        texte: "…et poivre." },
      { type: "action",  ustensile: "bol", action: "Mélanger", fois: 3,
        texte: "Mélange bien." },

      // --- Le montage ---
      { type: "ajouter", ustensile: "plaque", ingredient: "pain-de-mie",
        texte: "Pose 2 tranches de pain de mie sur la plaque, sur du papier cuisson." },
      { type: "ajouter", ustensile: "plaque", ingredient: "beurre",
        texte: "Beurre-les légèrement au couteau." },
      { type: "ajouter", ustensile: "plaque", ingredient: "jambon",
        texte: "Pose une tranche de jambon sur chacune." },
      { type: "action",  ustensile: "plaque", action: "Étaler", fois: 2,
        texte: "Étale un peu du mélange sur le jambon." },
      { type: "ajouter", ustensile: "plaque", ingredient: "pain-de-mie",
        texte: "Referme avec les 2 autres tranches de pain." },
      { type: "action",  ustensile: "plaque", action: "Étaler", fois: 2,
        texte: "Recouvre le dessus avec le reste du mélange." },

      // --- La cuisson ---
      { type: "action",  ustensile: "four", action: "Enfourner", fois: 1,
        texte: "Enfourne la plaque." },
      { type: "cuisson", ustensile: "four", duree: 600,
        texte: "Laisse cuire 10 min, jusqu'à ce que le dessus soit doré et gratiné." },
      { type: "action",  ustensile: "four", action: "Sortir", fois: 1,
        texte: "Sors les croques. Attention, c'est chaud !" },
      { type: "action",  ustensile: "plaque", action: "Servir", fois: 1,
        texte: "Coupe-les en deux et sers, avec une petite salade si tu veux." }
    ]
  },

  // ---------- Recettes prévues (pas encore écrites) ----------
  // Rythme : 1 recette par palier, 2 tous les 5 niveaux, en alternant salé et sucré
  { id: "carbonara",          aVenir: true, nom: "Carbonara",                   categorie: "sale",  niveauRequis: 5 },
  { id: "gateau-chocolat",    aVenir: true, nom: "Gâteau au chocolat",          categorie: "sucre", niveauRequis: 5 },
  { id: "tarte-pommes",       aVenir: true, nom: "Tarte aux pommes",            categorie: "sucre", niveauRequis: 7 },
  { id: "riz-saute",          aVenir: true, nom: "Riz sauté",                   categorie: "sale",  niveauRequis: 8 },
  { id: "cheesecake",         aVenir: true, nom: "Cheesecake",                  categorie: "sucre", niveauRequis: 9 },
  { id: "quiche",             aVenir: true, nom: "Quiche",                      categorie: "sale",  niveauRequis: 10 },
  { id: "muffins",            aVenir: true, nom: "Muffins",                     categorie: "sucre", niveauRequis: 10 },
  { id: "curry-japonais",     aVenir: true, nom: "Curry japonais",              categorie: "sale",  niveauRequis: 12 }
];

// Les recettes vraiment écrites (sans les prévues) : ce sont les seules
// qu'on peut débloquer, cuisiner, et qui comptent dans le Grimoire
function recettesEcrites() {
  return recettes.filter(recette => !recette.aVenir);
}
