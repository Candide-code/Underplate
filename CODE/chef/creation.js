// ==========================================================
// CRÉE TON CHEF : choisir son pseudo et l'apparence de son perso
// S'ouvre au premier lancement, puis quand on touche l'avatar.
// ==========================================================

// Les lignes de réglage, dans l'ordre de l'écran.
// "cle" = le nom du champ dans l'objet chef, et dans CHOIX_CHEF.
const REGLAGES = [
  { cle: "genre",   nom: "Genre" },
  { cle: "peau",    nom: "Peau" },
  { cle: "coupe",   nom: "Coupe" },
  { cle: "cheveux", nom: "Cheveux" },
  { cle: "yeux",    nom: "Yeux" },
  { cle: "tablier", nom: "Tablier" },
  { cle: "toque",   nom: "Toque" }
];

// Le chef en cours de modification. On travaille sur une COPIE :
// tant qu'on n'a pas validé, le vrai chef (joueur.chef) ne change pas.
let brouillon = null;

// ---------- Ouvrir l'écran ----------

function ouvrirCreation() {
  const premiereFois = joueur.chef === null;

  // { ...objet } fait une copie : modifier la copie ne touche pas l'original
  brouillon = { ...chefActuel() };

  // Premier lancement : "Crée ton chef", pas de retour possible.
  // Ensuite : "Ton chef", avec ← pour annuler.
  document.getElementById("creation-titre").textContent = premiereFois ? "Crée ton chef" : "Ton chef";
  document.getElementById("creation-retour").hidden = premiereFois;
  document.getElementById("creation-valider").textContent = premiereFois ? "C'EST PARTI ▶" : "VALIDER ▶";
  document.getElementById("creation-pseudo").value = brouillon.pseudo;

  construireLignes();
  afficherApercu();
  afficherEcran("ecran-creation");
}

// Une ligne par réglage :  Peau   ◀  3/11  ▶
function construireLignes() {
  const conteneur = document.getElementById("creation-lignes");
  conteneur.innerHTML = "";

  for (const reglage of REGLAGES) {
    const ligne = document.createElement("div");
    ligne.className = "creation-ligne";
    ligne.innerHTML = `
      <span class="creation-nom">${reglage.nom}</span>
      <button class="bouton-fleche" aria-label="${reglage.nom} précédent">◀</button>
      <span class="creation-valeur" id="valeur-${reglage.cle}"></span>
      <button class="bouton-fleche" aria-label="${reglage.nom} suivant">▶</button>`;

    // querySelectorAll renvoie les 2 flèches de CETTE ligne : [0] = ◀, [1] = ▶
    const fleches = ligne.querySelectorAll(".bouton-fleche");
    fleches[0].addEventListener("click", () => changerChoix(reglage.cle, -1));
    fleches[1].addEventListener("click", () => changerChoix(reglage.cle, +1));

    conteneur.appendChild(ligne);
  }
}

// ---------- Les flèches ----------

// sens = -1 (◀) ou +1 (▶)
function changerChoix(cle, sens) {
  const choix = CHOIX_CHEF[cle];
  const position = choix.findIndex(c => c.id === brouillon[cle]);

  // Le % (modulo) fait « boucler » : après le dernier on revient au premier,
  // et avant le premier on va au dernier (d'où le + choix.length)
  const nouvelle = (position + sens + choix.length) % choix.length;
  brouillon[cle] = choix[nouvelle].id;

  afficherApercu();
}

// Met à jour le perso en grand et le texte de chaque ligne
function afficherApercu() {
  document.getElementById("creation-apercu").innerHTML = htmlChef(brouillon);

  for (const reglage of REGLAGES) {
    const choisi = CHOIX_CHEF[reglage.cle].find(c => c.id === brouillon[reglage.cle]);
    document.getElementById("valeur-" + reglage.cle).textContent = choisi.nom;
  }
}

// ---------- Valider / annuler ----------

document.getElementById("creation-valider").addEventListener("click", () => {
  const champPseudo = document.getElementById("creation-pseudo");
  const pseudo = champPseudo.value.trim(); // trim() enlève les espaces au début et à la fin

  // Pas de pseudo : le champ tremble et on reste sur l'écran
  if (pseudo === "") {
    faireTrembler(champPseudo);
    champPseudo.focus();
    return;
  }

  brouillon.pseudo = pseudo;
  joueur.chef = brouillon;
  sauvegarder();
  afficherAccueil();
});

// ← : on annule, le chef reste comme avant
document.getElementById("creation-retour").addEventListener("click", afficherAccueil);

// Toucher l'avatar de l'en-tête ouvre l'écran pour modifier son chef
document.getElementById("entete-avatar").addEventListener("click", ouvrirCreation);
