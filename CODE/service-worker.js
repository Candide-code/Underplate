// ==========================================================
// SERVICE WORKER : le jeu marche sans réseau et se met à jour tout seul
//
// Il se place entre le jeu et Internet, et garde une copie de chaque
// fichier dans le téléphone (le « cache »).
//   - Code et recettes (HTML, JS, CSS, JSON) : on demande d'abord la
//     dernière version sur Internet. Pas de réseau, ou trop lent (3 s) :
//     on prend la copie du téléphone. → Un push sur GitHub arrive chez
//     tout le monde à la prochaine ouverture, sans rien changer ici.
//   - Images et polices : elles ne changent presque jamais, donc on prend
//     la copie du téléphone si on l'a (plus rapide), sinon Internet.
// Chaque fichier reçu d'Internet est rangé dans le cache au passage.
// ==========================================================

const CACHE = "underplate";
const DELAI_RESEAU = 3000; // en ms : au-delà, on se rabat sur la copie

// Les fichiers gardés dès l'installation, pour que le jeu s'ouvre hors ligne
// même avant d'avoir tout visité. Un fichier oublié ici n'est pas grave :
// il sera mis en cache la première fois qu'il est chargé.
const FICHIERS_DE_BASE = [
  "./",
  "index.html",
  "manifest.json",
  "main.js",
  "base/base.css", "base/outils.js",
  "recettes/ingredients.js", "recettes/recettes.js",
  "joueur/xp.js", "joueur/joueur.js",
  "chef/chef.css", "chef/chef.js", "chef/creation.js",
  "custom/custom.css", "custom/custom.js", "custom/assistant.js",
  "sauvegarde/sauvegarde.js",
  "accueil/accueil.css", "accueil/accueil.js",
  "preparation/preparation.css", "preparation/preparation.js",
  "cuisine/cuisine.css", "cuisine/cuisine.js",
  "fin-recette/fin-recette.css", "fin-recette/fin-recette.js",
  "grimoire/grimoire.css", "grimoire/grimoire.js",
  "assets/icones/icone-192.png", "assets/icones/icone-512.png"
];

// Installation : on remplit le cache avec les fichiers de base
self.addEventListener("install", evenement => {
  evenement.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FICHIERS_DE_BASE))
      .then(() => self.skipWaiting()) // pas besoin d'attendre la fermeture des onglets
  );
});

// Activation : le service worker prend la main tout de suite
self.addEventListener("activate", evenement => {
  evenement.waitUntil(self.clients.claim());
});

// Chaque fois que le jeu demande un fichier
self.addEventListener("fetch", evenement => {
  const requete = evenement.request;
  if (requete.method !== "GET") return;

  const url = new URL(requete.url);
  const estImageOuPolice = requete.destination === "image" || requete.destination === "font"
    || url.hostname.endsWith("gstatic.com");

  if (estImageOuPolice) {
    evenement.respondWith(copieDabord(requete));
  } else if (url.origin === location.origin || url.hostname === "fonts.googleapis.com") {
    evenement.respondWith(reseauDabord(requete));
  }
});

// Réseau d'abord (avec un délai max), sinon la copie du téléphone
async function reseauDabord(requete) {
  const cache = await caches.open(CACHE);
  try {
    // cache: "no-cache" : on vérifie auprès de GitHub que le fichier n'a pas changé,
    // au lieu de reprendre la version gardée par le navigateur (jusqu'à 10 min)
    const reponse = await avecDelai(fetch(requete.url, { cache: "no-cache" }), DELAI_RESEAU);
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch (erreur) {
    // ignoreSearch : index.html?reset retrouve index.html
    const copie = await cache.match(requete, { ignoreSearch: true });
    if (copie) return copie;
    if (requete.mode === "navigate") return cache.match("index.html");
    throw erreur;
  }
}

// La copie du téléphone d'abord, sinon Internet (et on la garde)
async function copieDabord(requete) {
  const cache = await caches.open(CACHE);
  const copie = await cache.match(requete);
  if (copie) return copie;
  const reponse = await fetch(requete);
  if (reponse.ok || reponse.type === "opaque") cache.put(requete, reponse.clone());
  return reponse;
}

// Abandonne une promesse si elle met plus de « ms » millisecondes
function avecDelai(promesse, ms) {
  return new Promise((resoudre, rejeter) => {
    const minuteur = setTimeout(() => rejeter(new Error("réseau trop lent")), ms);
    promesse.then(
      valeur => { clearTimeout(minuteur); resoudre(valeur); },
      erreur => { clearTimeout(minuteur); rejeter(erreur); }
    );
  });
}
