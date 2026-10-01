// ==========================================================
// SUPPRIMER MON COMPTE (RGPD : droit à l'effacement)
// 1. Le serveur efface tout ce qui appartient au joueur, puis son compte
//    (fonction supprimer_mon_compte, fin de guidelines/serveur-supabase.sql).
// 2. On efface ensuite tout ce qui reste dans le téléphone, et le jeu
//    redémarre comme au tout premier lancement (« Crée ton chef »).
// La fenêtre est dans l'écran « Ton chef » (index.html).
// Guide : guidelines/serveur-supabase.md (partie 9)
// ==========================================================

const fenetreSupprimer = document.getElementById("fenetre-supprimer-compte");
const messageSupprimer = document.getElementById("supprimer-message");
const boutonSupprimer = document.getElementById("supprimer-oui");

document.getElementById("creation-supprimer").addEventListener("click", () => {
  // « sûr » pour un chef, « sûre » pour une cheffe (accord() dans chef/chef.js)
  document.getElementById("supprimer-question").textContent = "* Es-tu " + accord("sûr", "sûre") + " ?";
  messageSupprimer.textContent = "";
  boutonSupprimer.disabled = false;
  fenetreSupprimer.showModal();
});

document.getElementById("supprimer-non").addEventListener("click", () => fenetreSupprimer.close());
boutonSupprimer.addEventListener("click", supprimerMonCompte);

async function supprimerMonCompte() {
  // Sans la bibliothèque, on ne peut même pas savoir s'il y a un compte
  if (serveur === null) {
    messageSupprimer.textContent = "* Le serveur ne répond pas. Réessaie dans un moment.";
    return;
  }

  boutonSupprimer.disabled = true; // pas de double appui pendant l'attente

  try {
    // getSession lit seulement le téléphone : ça marche même sans réseau.
    // On ne crée PAS de compte ici (pas de compteDuJoueur()).
    const { data } = await serveur.auth.getSession();

    if (data.session) {
      // Un compte existe : il faut le réseau, sinon ses données resteraient
      // sur le serveur sans plus aucun moyen de les effacer.
      if (!navigator.onLine) {
        messageSupprimer.textContent = "* Pas de réseau… Réessaie plus tard.";
        boutonSupprimer.disabled = false;
        return;
      }

      messageSupprimer.textContent = "* J'efface tout…";
      const reponse = await serveur.rpc("supprimer_mon_compte");
      if (reponse.error) throw reponse.error;
      // false = les données sont effacées, mais le compte vide est resté
      if (reponse.data === false) console.warn("Compte vide resté sur le serveur");

      // On oublie la clé du compte (scope "local" : rien à demander au serveur,
      // le compte n'y existe plus)
      await serveur.auth.signOut({ scope: "local" });
    }

    effacerTelephone();
    location.reload(); // le jeu redémarre sur « Crée ton chef »
  } catch (erreur) {
    console.warn("Suppression impossible :", erreur);
    messageSupprimer.textContent = "* Le serveur ne répond pas. Rien n'a été effacé, réessaie dans un moment.";
    boutonSupprimer.disabled = false;
  }
}

// Tout ce que le jeu range dans le téléphone
function effacerTelephone() {
  try {
    localStorage.removeItem(CLE_SAUVEGARDE);     // la partie
    localStorage.removeItem(CLE_FILE_ACTIVITES); // les événements pas encore partis
    localStorage.removeItem(CLE_CODE);           // le code de récupération
  } catch (erreur) {
    console.warn("Effacement impossible :", erreur);
  }
}
