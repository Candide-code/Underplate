// ==========================================================
// SAUVEGARDE : la progression reste quand on recharge la page
// localStorage = un petit espace de stockage dans le navigateur.
// Il ne stocke que du texte, d'où JSON.stringify / JSON.parse.
// ==========================================================

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
  } catch (erreur) {
    console.warn("Chargement impossible :", erreur);
  }
}
