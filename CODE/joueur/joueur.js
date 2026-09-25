// ==========================================================
// LE JOUEUR : sa progression et l'en-tête de l'accueil
// ==========================================================

// "let" et pas "const" : la sauvegarde pourra remplacer tout l'objet
let joueur = {
  xp: 0,
  recettesFaites: {}, // ex. { omelette: 3 } = omelette faite 3 fois
  grimoireLu: [],     // recettes dont on a déjà ouvert la fiche du Grimoire
  chef: null          // le perso (pseudo, genre, peau…) ; null = pas encore créé
};

// Nombre de fois que le joueur a fini une recette (0 si jamais)
function nombreDeFois(idRecette) {
  return joueur.recettesFaites[idRecette] || 0;
}

// Nouvelle page dans le Grimoire : recette cuisinée, mais fiche jamais ouverte
function estNouveauDansGrimoire(idRecette) {
  return nombreDeFois(idRecette) > 0 && !joueur.grimoireLu.includes(idRecette);
}

// Y a-t-il au moins une nouvelle page ? (pour le badge du bouton GRIMOIRE)
function grimoireANouveautes() {
  return recettes.some(recette => estNouveauDansGrimoire(recette.id));
}

// Met à jour l'en-tête : niveau, titre, barre et texte d'XP
function afficherEntete() {
  const infos = calculerNiveau(joueur.xp);
  const pourcentage = (infos.xpDansNiveau / infos.xpNecessaire) * 100;

  // htmlChef est dans chef/chef.js : il est chargé après ce fichier,
  // mais afficherEntete n'est appelée qu'une fois tout chargé (main.js)
  document.getElementById("entete-avatar").innerHTML = htmlChef(chefActuel());

  document.getElementById("entete-nom").textContent = nomDuChef();
  document.getElementById("entete-niveau").textContent =
    "Niv. " + infos.niveau + " · " + titreDuNiveau(infos.niveau, chefActuel().genre);
  document.getElementById("entete-barre").style.width = pourcentage + "%";
  document.getElementById("entete-xp").textContent =
    infos.xpDansNiveau + " / " + infos.xpNecessaire + " XP";
}
