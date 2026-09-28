// ==========================================================
// UNE BRIGADE : son classement, et « Quitter la brigade »
// On touche une brigade dans la liste (brigade.js) → cet écran.
// Le classement : tous les membres, du plus d'XP au moins d'XP.
// Le niveau et le titre ne sont pas sur le serveur : on les
// recalcule depuis l'XP (joueur/xp.js), comme pour soi.
// ==========================================================

const listeClassement = document.getElementById("classement");
const messageClassement = document.getElementById("classement-message");
const fenetreQuitterBrigade = document.getElementById("fenetre-quitter-brigade");

// La brigade affichée (pour recharger, et pour la quitter)
let brigadeOuverte = null;

function afficherMessageClassement(texte) {
  messageClassement.textContent = texte;
  messageClassement.hidden = texte === "";
}

// ---------- L'écran ----------

// brigade = { id, nom, code } (une ligne de la liste de brigade.js)
function ouvrirBrigade(brigade) {
  brigadeOuverte = brigade;
  document.getElementById("une-brigade-nom").textContent = brigade.nom;
  document.getElementById("une-brigade-code").textContent = codeLisible(brigade.code);
  listeClassement.innerHTML = "";
  afficherEcran("ecran-une-brigade");
  chargerClassement();
}

document.getElementById("une-brigade-retour").addEventListener("click", afficherBrigade);

async function chargerClassement() {
  if (!serveurJoignable()) {
    afficherMessageClassement("Pas de réseau… Réessaie plus tard.");
    return;
  }
  afficherMessageClassement("Chargement…");

  try {
    const monId = await compteDuJoueur();
    // Les membres de la brigade, et pour chacun son profil (pseudo, perso, XP).
    // profils(…) : la table membres pointe vers profils, le serveur les
    // assemble en une seule demande. Les règles RLS vérifient que je suis
    // bien dans cette brigade.
    const { data, error } = await serveur
      .from("membres")
      .select("joueur_id, profils(pseudo, chef, xp)")
      .eq("groupe_id", brigadeOuverte.id);
    if (error) throw error;

    // Du plus d'XP au moins d'XP (b - a : ordre décroissant)
    const membres = data
      .filter(membre => membre.profils)
      .sort((a, b) => b.profils.xp - a.profils.xp);

    afficherMessageClassement("");
    afficherClassement(membres, monId);
  } catch (erreur) {
    console.warn("Classement impossible à charger :", erreur);
    afficherMessageClassement("Le serveur ne répond pas. Réessaie dans un moment.");
  }
}

// Une ligne par membre : rang | perso | Cheffe Marie, Niv. 3 · Commis, 250 XP
function afficherClassement(membres, monId) {
  listeClassement.innerHTML = "";

  membres.forEach((membre, position) => {
    // chefVerifie (chef.js) : le perso d'un autre joueur ne garde que des choix connus
    const chef = chefVerifie(membre.profils.chef);
    const xp = Math.max(0, Number(membre.profils.xp) || 0);
    const niveau = calculerNiveau(xp).niveau;
    const nom = (chef.genre === "f" ? "Cheffe " : "Chef ") + membre.profils.pseudo;

    const ligne = document.createElement("li");
    ligne.className = "ligne-classement cadre";
    if (membre.joueur_id === monId) ligne.classList.add("moi");

    // echapper() : le pseudo vient d'un autre joueur (voir base/outils.js)
    ligne.innerHTML = `
      <span class="rang">${position + 1}</span>
      ${htmlChef(chef)}
      <div class="classement-infos">
        <p class="classement-nom">${echapper(nom)}</p>
        <p class="classement-niveau">Niv. ${niveau} · ${titreDuNiveau(niveau, chef.genre)}</p>
        <p class="classement-xp">${xp} XP</p>
      </div>`;
    listeClassement.appendChild(ligne);
  });
}

// ---------- Quitter la brigade ----------

document.getElementById("une-brigade-quitter").addEventListener("click", () => {
  // textContent : le nom est affiché tel quel, jamais comme du HTML
  document.getElementById("quitter-brigade-question").textContent =
    "* Quitter la brigade « " + brigadeOuverte.nom + " » ?";
  fenetreQuitterBrigade.showModal();
});

document.getElementById("quitter-brigade-non").addEventListener("click", () => fenetreQuitterBrigade.close());

document.getElementById("quitter-brigade-oui").addEventListener("click", async () => {
  fenetreQuitterBrigade.close();
  if (!serveurJoignable()) {
    afficherMessageClassement("Pas de réseau… Réessaie plus tard.");
    return;
  }
  try {
    const id = await compteDuJoueur();
    // Les règles du serveur ne me laissent supprimer QUE ma propre ligne
    const { error } = await serveur
      .from("membres")
      .delete()
      .eq("groupe_id", brigadeOuverte.id)
      .eq("joueur_id", id);
    if (error) throw error;
    afficherBrigade(); // retour à la liste, sans cette brigade
  } catch (erreur) {
    console.warn("Impossible de quitter :", erreur);
    afficherMessageClassement("Le serveur ne répond pas. Réessaie dans un moment.");
  }
});
