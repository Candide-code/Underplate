// ==========================================================
// SAUVEGARDE : la progression reste quand on recharge la page
// localStorage = un petit espace de stockage dans le navigateur.
// Il ne stocke que du texte, d'où JSON.stringify / JSON.parse.
// ==========================================================

// Nom de la case de rangement dans le navigateur. Il date de l'ancien nom
// de l'app (Petit Chef) : on le garde, sinon les joueurs perdraient leur progression.
const CLE_SAUVEGARDE = "petit-chef-sauvegarde";

function sauvegarder() {
  try {
    localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(joueur));
  } catch (erreur) {
    console.warn("Sauvegarde impossible :", erreur);
  }
}

function charger() {
  try {
    const texte = localStorage.getItem(CLE_SAUVEGARDE);
    if (texte) {
      joueur = JSON.parse(texte);
    }
    // Sauvegarde d'avant le badge NEW! du Grimoire : on considère
    // que les recettes déjà faites ont déjà été lues
    if (!joueur.grimoireLu) {
      joueur.grimoireLu = Object.keys(joueur.recettesFaites);
    }
    // Sauvegarde d'avant « Crée ton chef » : pas encore de perso
    if (joueur.chef === undefined) {
      joueur.chef = null;
    }
    // Sauvegarde d'avant CUSTOM : pas encore de recettes perso
    if (!joueur.recettesPerso)    joueur.recettesPerso = [];
    if (!joueur.ingredientsPerso) joueur.ingredientsPerso = {};
    if (!joueur.ustensilesPerso)  joueur.ustensilesPerso = {};
    if (!joueur.nomsIngredients)  joueur.nomsIngredients = {};

    // Les ingrédients et ustensiles tapés à la main rejoignent les catalogues du jeu
    brancherCataloguesPerso();
  } catch (erreur) {
    console.warn("Chargement impossible :", erreur);
  }
}
