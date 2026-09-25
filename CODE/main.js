// ==========================================================
// POINT D'ENTRÉE : c'est ici que l'app démarre
// ==========================================================

// Pour tester comme un nouveau joueur : ouvrir la page avec ?reset
// à la fin de l'adresse (ex. index.html?reset). La sauvegarde est
// effacée, puis on enlève ?reset de l'adresse pour qu'un simple
// rechargement ne remette pas tout à zéro une 2e fois.
if (new URLSearchParams(location.search).has("reset")) {
  try {
    localStorage.removeItem(CLE_SAUVEGARDE);
    history.replaceState(null, "", location.pathname);
  } catch (erreur) {
    console.warn("Reset impossible :", erreur);
  }
}

charger(); // on récupère la progression sauvegardée

// Pas encore de chef : on commence par le créer. Sinon, direction l'accueil.
if (joueur.chef === null) {
  ouvrirCreation();
} else {
  afficherAccueil();
}

console.log("Underplate est prêt !", joueur);
