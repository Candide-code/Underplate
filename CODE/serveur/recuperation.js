// ==========================================================
// CODE DE RÉCUPÉRATION : retrouver sa partie sur un autre téléphone
// - « Mon code » : le serveur crée un code (ex. TOQUE-7K2P-M4QX)
//   et n'en garde que l'empreinte. Le téléphone le garde pour le remontrer.
// - « J'ai déjà une partie » : on tape le code, le serveur « déménage »
//   l'ancienne partie vers le compte de ce téléphone et nous la renvoie.
// Les deux fenêtres sont dans l'écran « Ton chef » (index.html).
// Guide : guidelines/serveur-supabase.md (partie 7)
// ==========================================================

// Le code est rangé à part, PAS dans l'objet joueur : sinon il partirait
// sur le serveur avec la sauvegarde, et le serveur ne doit jamais le connaître.
const CLE_CODE = "underplate-code-recuperation";

const fenetreMonCode = document.getElementById("fenetre-mon-code");
const fenetreRecuperer = document.getElementById("fenetre-recuperer");
const champCode = document.getElementById("code-saisi");
const messageRecuperer = document.getElementById("recuperer-message");
const boutonRecuperer = document.getElementById("recuperer-valider");

function codeGarde() {
  try {
    return localStorage.getItem(CLE_CODE);
  } catch (erreur) {
    return null;
  }
}

function garderCode(code) {
  try {
    localStorage.setItem(CLE_CODE, code);
  } catch (erreur) {
    console.warn("Code non gardé :", erreur);
  }
}

// « toque 7k2p m4qx » → « TOQUE-7K2P-M4QX » (pour le remontrer proprement)
function codeBienEcrit(code) {
  const secret = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-8);
  return "TOQUE-" + secret.slice(0, 4) + "-" + secret.slice(4);
}

// ---------- Mon code ----------

document.getElementById("creation-mon-code").addEventListener("click", ouvrirMonCode);
document.getElementById("mon-code-ok").addEventListener("click", () => fenetreMonCode.close());

async function ouvrirMonCode() {
  const texteCode = document.getElementById("mon-code");
  const explication = document.getElementById("mon-code-explication");
  fenetreMonCode.showModal();

  // Déjà demandé : on le remontre (le serveur, lui, ne peut plus le lire)
  const dejaLa = codeGarde();
  if (dejaLa) {
    texteCode.textContent = dejaLa;
    explication.textContent = "* Note-le bien ! Sur un autre téléphone, il te rend ta partie.";
    return;
  }

  if (!serveurJoignable()) {
    texteCode.textContent = "…";
    explication.textContent = "* Pas de réseau… Réessaie plus tard.";
    return;
  }

  texteCode.textContent = "…";
  explication.textContent = "* Je prépare ton code…";
  try {
    await compteDuJoueur();
    // rpc = appeler une fonction du serveur (ici, celle du SQL de l'étape 4)
    const { data, error } = await serveur.rpc("creer_code_recuperation");
    if (error) throw error;

    garderCode(data);
    texteCode.textContent = data;
    explication.textContent = "* Note-le bien ! Sur un autre téléphone, il te rend ta partie.";
  } catch (erreur) {
    // Cas le plus probable : le profil n'est pas encore arrivé sur le serveur
    console.warn("Code impossible :", erreur);
    envoyerAuServeur();
    explication.textContent = "* Le serveur ne répond pas. Réessaie dans un moment.";
  }
}

// ---------- J'ai déjà une partie ----------

document.getElementById("creation-recuperer").addEventListener("click", () => {
  champCode.value = "";
  boutonRecuperer.disabled = false;
  // Un chef existe déjà sur ce téléphone : on prévient qu'il sera remplacé
  messageRecuperer.textContent = joueur.chef
    ? "* Attention : ta partie sur ce téléphone sera remplacée."
    : "";
  fenetreRecuperer.showModal();
});

document.getElementById("recuperer-annuler").addEventListener("click", () => fenetreRecuperer.close());
boutonRecuperer.addEventListener("click", recupererPartie);

async function recupererPartie() {
  const code = champCode.value.trim();
  if (code === "") {
    faireTrembler(champCode);
    champCode.focus();
    return;
  }

  if (!serveurJoignable()) {
    messageRecuperer.textContent = "* Pas de réseau… Réessaie plus tard.";
    return;
  }

  boutonRecuperer.disabled = true; // pas de double appui pendant l'attente
  messageRecuperer.textContent = "* Je cherche ta partie…";

  try {
    await compteDuJoueur(); // le compte de CE téléphone (créé s'il n'existe pas)
    const { data, error } = await serveur.rpc("recuperer_partie", { code_saisi: code });
    if (error) throw error;

    if (!data) {
      messageRecuperer.textContent = "* Ce code n'a pas de partie enregistrée.";
      boutonRecuperer.disabled = false;
      return;
    }

    // On remplace la sauvegarde du téléphone, puis on relance le jeu :
    // au démarrage, charger() la lit comme n'importe quelle sauvegarde.
    localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(data));
    garderCode(codeBienEcrit(code));
    location.reload();
  } catch (erreur) {
    console.warn("Récupération impossible :", erreur);
    messageRecuperer.textContent = String(erreur.message).includes("code inconnu")
      ? "* Code inconnu. Vérifie-le : il n'y a ni O, ni I, ni 0, ni 1."
      : "* Le serveur ne répond pas. Réessaie dans un moment.";
    boutonRecuperer.disabled = false;
  }
}
