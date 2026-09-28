// ==========================================================
// BRIGADE : les groupes entre potes
// Créer une brigade (le serveur lui donne un code de partage),
// en rejoindre une avec un code, voir ses brigades, en quitter une.
// Tout passe par le serveur (serveur/connexion.js) : sans réseau,
// l'écran affiche un message au lieu des brigades.
// Guide : guidelines/serveur-supabase.md
// ==========================================================

const listeBrigades = document.getElementById("liste-brigades");
const messageBrigade = document.getElementById("brigade-message");

const fenetreCreer = document.getElementById("fenetre-creer-brigade");
const fenetreRejoindre = document.getElementById("fenetre-rejoindre-brigade");
const fenetreQuitterBrigade = document.getElementById("fenetre-quitter-brigade");

// La brigade qu'on s'apprête à quitter (le temps de la confirmation)
let brigadeAQuitter = null;

// Un code de 6 caractères s'affiche en 2 blocs, plus facile à dicter : K7P M4Q
function codeLisible(code) {
  return code.slice(0, 3) + " " + code.slice(3);
}

// Un texte d'erreur du serveur contient-il ce mot ? (ex. "code inconnu")
function erreurContient(erreur, mot) {
  return String(erreur && erreur.message).includes(mot);
}

// ---------- L'écran ----------

document.getElementById("brigade-retour").addEventListener("click", afficherAccueil);

function afficherBrigade() {
  afficherEcran("ecran-brigade");
  chargerBrigades();
}

function afficherMessageBrigade(texte) {
  messageBrigade.textContent = texte;
  messageBrigade.hidden = texte === "";
}

// Demande au serveur la liste de mes brigades, puis les affiche
async function chargerBrigades() {
  if (!serveurJoignable()) {
    listeBrigades.innerHTML = "";
    afficherMessageBrigade("Pas de réseau… Réessaie plus tard.");
    return;
  }

  // On garde la liste affichée pendant le chargement : pas de clignotement
  if (listeBrigades.innerHTML === "") afficherMessageBrigade("Chargement…");

  try {
    await compteDuJoueur();
    // Les règles du serveur ne renvoient QUE les brigades dont je suis membre.
    // membres(count) : le nombre de membres de chaque brigade, en une seule demande.
    const { data, error } = await serveur
      .from("groupes")
      .select("id, nom, code, membres(count)")
      .order("cree_le");
    if (error) throw error;

    afficherMessageBrigade(data.length === 0
      ? "Tu n'as pas encore de brigade. Crées-en une, ou rejoins celle d'un pote avec son code !"
      : "");
    afficherListeBrigades(data);
  } catch (erreur) {
    console.warn("Brigades impossibles à charger :", erreur);
    afficherMessageBrigade("Le serveur ne répond pas. Réessaie dans un moment.");
  }
}

// Une carte par brigade : nom, code de partage, nombre de membres, « Quitter »
function afficherListeBrigades(brigades) {
  listeBrigades.innerHTML = "";

  for (const brigade of brigades) {
    const nombre = brigade.membres[0].count;
    const carte = document.createElement("div");
    carte.className = "carte-brigade cadre";
    // echapper() : le nom vient d'un autre joueur, on ne le laisse
    // jamais passer pour du HTML (voir base/outils.js)
    carte.innerHTML = `
      <h3>${echapper(brigade.nom)}</h3>
      <p class="brigade-code">Code : <strong>${codeLisible(brigade.code)}</strong></p>
      <p class="brigade-membres">${nombre} membre${nombre > 1 ? "s" : ""}</p>
      <button class="bouton-lien">Quitter</button>`;

    carte.querySelector(".bouton-lien").addEventListener("click", () => ouvrirQuitter(brigade));
    listeBrigades.appendChild(carte);
  }
}

// ---------- Créer une brigade ----------

const champNomBrigade = document.getElementById("nom-brigade");
const messageCreer = document.getElementById("creer-brigade-message");
const boutonCreer = document.getElementById("creer-brigade-valider");

document.getElementById("brigade-creer").addEventListener("click", () => {
  champNomBrigade.value = "";
  messageCreer.textContent = "";
  boutonCreer.disabled = false;
  fenetreCreer.showModal();
});

document.getElementById("creer-brigade-annuler").addEventListener("click", () => fenetreCreer.close());

boutonCreer.addEventListener("click", async () => {
  const nom = champNomBrigade.value.trim();
  if (nom === "") {
    faireTrembler(champNomBrigade);
    champNomBrigade.focus();
    return;
  }
  if (!serveurJoignable()) {
    messageCreer.textContent = "* Pas de réseau… Réessaie plus tard.";
    return;
  }

  boutonCreer.disabled = true;
  messageCreer.textContent = "* Je prépare ta brigade…";
  try {
    await compteDuJoueur();
    // creer_groupe : la fonction du serveur (SQL de l'étape 2) tire le code
    const { error } = await serveur.rpc("creer_groupe", { nom_groupe: nom });
    if (error) throw error;
    fenetreCreer.close();
    chargerBrigades();
  } catch (erreur) {
    console.warn("Création impossible :", erreur);
    messageCreer.textContent = "* Le serveur ne répond pas. Réessaie dans un moment.";
    boutonCreer.disabled = false;
  }
});

// ---------- Rejoindre une brigade ----------

const champCodeBrigade = document.getElementById("code-brigade");
const messageRejoindre = document.getElementById("rejoindre-brigade-message");
const boutonRejoindre = document.getElementById("rejoindre-brigade-valider");

document.getElementById("brigade-rejoindre").addEventListener("click", () => {
  champCodeBrigade.value = "";
  messageRejoindre.textContent = "";
  boutonRejoindre.disabled = false;
  fenetreRejoindre.showModal();
});

document.getElementById("rejoindre-brigade-annuler").addEventListener("click", () => fenetreRejoindre.close());

boutonRejoindre.addEventListener("click", async () => {
  const code = champCodeBrigade.value.trim();
  if (code === "") {
    faireTrembler(champCodeBrigade);
    champCodeBrigade.focus();
    return;
  }
  if (!serveurJoignable()) {
    messageRejoindre.textContent = "* Pas de réseau… Réessaie plus tard.";
    return;
  }

  boutonRejoindre.disabled = true;
  messageRejoindre.textContent = "* Je cherche la brigade…";
  try {
    await compteDuJoueur();
    // Le serveur accepte les minuscules et les espaces (« k7p m4q »)
    const { error } = await serveur.rpc("rejoindre_groupe", { code_saisi: code });
    if (error) throw error;
    fenetreRejoindre.close();
    chargerBrigades();
  } catch (erreur) {
    console.warn("Impossible de rejoindre :", erreur);
    messageRejoindre.textContent = erreurContient(erreur, "code inconnu")
      ? "* Code inconnu. Vérifie-le : il n'y a ni O, ni I, ni 0, ni 1."
      : "* Le serveur ne répond pas. Réessaie dans un moment.";
    boutonRejoindre.disabled = false;
  }
});

// ---------- Quitter une brigade ----------

function ouvrirQuitter(brigade) {
  brigadeAQuitter = brigade;
  // textContent : le nom est affiché tel quel, jamais comme du HTML
  document.getElementById("quitter-brigade-question").textContent =
    "* Quitter la brigade « " + brigade.nom + " » ?";
  fenetreQuitterBrigade.showModal();
}

document.getElementById("quitter-brigade-non").addEventListener("click", () => fenetreQuitterBrigade.close());

document.getElementById("quitter-brigade-oui").addEventListener("click", async () => {
  fenetreQuitterBrigade.close();
  if (!serveurJoignable()) {
    afficherMessageBrigade("Pas de réseau… Réessaie plus tard.");
    return;
  }
  try {
    const id = await compteDuJoueur();
    // Les règles du serveur ne me laissent supprimer QUE ma propre ligne
    const { error } = await serveur
      .from("membres")
      .delete()
      .eq("groupe_id", brigadeAQuitter.id)
      .eq("joueur_id", id);
    if (error) throw error;
    chargerBrigades();
  } catch (erreur) {
    console.warn("Impossible de quitter :", erreur);
    afficherMessageBrigade("Le serveur ne répond pas. Réessaie dans un moment.");
  }
});
