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
    localStorage.removeItem(CLE_FILE_ACTIVITES); // les événements pas encore partis
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

// Des recettes arrivées avec une mise à jour ? On les annonce (nouveautes.js)
verifierNouveautes();

// Compte sur le serveur : créé s'il n'existe pas, et la partie y est copiée
// (serveur/connexion.js). Le jeu n'attend pas la réponse pour s'afficher.
envoyerAuServeur();

// App installable : on lance le service worker (jeu hors ligne + mises à jour).
// Il ne marche que sur un vrai serveur (GitHub Pages), pas en ouvrant le fichier.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("service-worker.js")
    .catch(erreur => console.warn("Service worker impossible :", erreur));
}

console.log("Underplate est prêt !", joueur);
