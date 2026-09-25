// ==========================================================
// LE CHEF : le personnage du joueur, fait de couches superposées
// (système « poupée de papier » du pack Mana Seed)
//
// Chaque couche est une image 64×64 avec le même cadre :
// on les pose toutes au même endroit, l'une sur l'autre,
// dans cet ordre : corps → yeux → veste → tablier → cheveux → toque
// ==========================================================

const DOSSIER_CHEF = "assets/sprites/chef/";

// Fabrique une liste numérotée : numeros(3) → 1/3, 2/3, 3/3
function numeros(total) {
  const liste = [];
  for (let n = 1; n <= total; n++) {
    liste.push({ id: n, nom: n + "/" + total });
  }
  return liste;
}

// Tous les choix possibles, chacun sous forme de liste { id, nom } :
// l'écran « Crée ton chef » les fait défiler avec les flèches ◀ ▶
const CHOIX_CHEF = {
  genre: [
    { id: "m", nom: "Chef" },
    { id: "f", nom: "Cheffe" }
  ],
  peau:    numeros(11), // peau-01 à peau-11, de la plus claire à la plus foncée
  cheveux: numeros(13), // 13 couleurs, les mêmes pour toutes les coupes
  coupe: [
    { id: "court",   nom: "Courte" },
    { id: "carre",   nom: "Carré" },
    { id: "chignon", nom: "Chignon" },
    { id: "afro",    nom: "Afro" },
    { id: "locs",    nom: "Locs" }
  ],
  yeux: [
    { id: "noir",   nom: "Noirs" },
    { id: "marron", nom: "Marron" },
    { id: "bleu",   nom: "Bleus" },
    { id: "vert",   nom: "Verts" }
  ],
  tablier: [
    { id: "rouge",  nom: "Rouge" },
    { id: "orange", nom: "Orange" },
    { id: "vert",   nom: "Vert" },
    { id: "bleu",   nom: "Bleu" },
    { id: "noir",   nom: "Noir" }
  ],
  toque: [
    { id: true,  nom: "Oui" },
    { id: false, nom: "Non" }
  ]
};

// Le chef affiché tant que le joueur n'a pas créé le sien
const CHEF_PAR_DEFAUT = {
  pseudo: "",
  genre: "m",
  peau: 4,
  coupe: "court",
  cheveux: 11,
  yeux: "marron",
  tablier: "rouge",
  toque: true
};

// Le chef du joueur (ou celui par défaut s'il n'en a pas encore).
// { ...A, ...B } mélange deux objets : on part du chef par défaut,
// puis les choix du joueur remplacent chaque valeur. Si un champ
// manque (ex. "toque" dans un chef créé avant ce choix), celui
// par défaut est gardé.
function chefActuel() {
  return { ...CHEF_PAR_DEFAUT, ...joueur.chef };
}

// Choisit le mot accordé selon le genre du chef :
// accord("fort", "forte") → "fort" pour un chef, "forte" pour une cheffe
function accord(masculin, feminin) {
  return chefActuel().genre === "f" ? feminin : masculin;
}

// "Chef Marie" ou "Cheffe Marie"
function nomDuChef() {
  const chef = chefActuel();
  return accord("Chef", "Cheffe") + " " + chef.pseudo;
}

// Transforme un nombre en texte à 2 chiffres : 4 → "04"
function deuxChiffres(nombre) {
  return String(nombre).padStart(2, "0");
}

// Renvoie le HTML du chef : une <img> par couche, dans le bon ordre.
// Le premier <img> est tout en dessous, le dernier tout au-dessus.
function htmlChef(chef) {
  const couches = [
    "peau-" + deuxChiffres(chef.peau),
    "yeux-" + chef.yeux,
    "veste",
    "tablier-" + chef.tablier,
    "cheveux-" + chef.coupe + "-" + deuxChiffres(chef.cheveux)
  ];
  if (chef.toque) {
    couches.push("toque"); // la toque tout au-dessus, seulement si on la veut
  }

  let html = "";
  for (const couche of couches) {
    html += `<img src="${DOSSIER_CHEF}${couche}.png" alt="">`;
  }
  // role="img" + aria-label : un lecteur d'écran lit « Ton chef »
  // au lieu de 6 images vides
  return `<div class="chef" role="img" aria-label="Ton chef">${html}</div>`;
}
