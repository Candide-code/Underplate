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
  } catch (erreur) {
    console.warn("Chargement impossible :", erreur);
  }
}
