// ==========================================================
// BRIGADE : les groupes entre potes
// Créer une brigade (le serveur lui donne un code de partage),
// en rejoindre une avec un code, voir ses brigades.
// Toucher une brigade ouvre son écran : classement, quitter (classement.js).
// Tout passe par le serveur (serveur/connexion.js) : sans réseau,
// l'écran affiche un message au lieu des brigades.
// Guide : guidelines/serveur-supabase.md
// ==========================================================

const listeBrigades = document.getElementById("liste-brigades");
const messageBrigade = document.getElementById("brigade-message");

const fenetreCreer = document.getElementById("fenetre-creer-brigade");
const fenetreRejoindre = document.getElementById("fenetre-rejoindre-brigade");
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

// Une carte par brigade : nom, code de partage, nombre de membres.
// C'est un bouton : on la touche pour ouvrir le classement.
function afficherListeBrigades(brigades) {
  listeBrigades.innerHTML = "";

  for (const brigade of brigades) {
    const nombre = brigade.membres[0].count;
    const carte = document.createElement("button");
    carte.className = "carte-brigade cadre";
    // echapper() : le nom vient d'un autre joueur, on ne le laisse
    // jamais passer pour du HTML (voir base/outils.js)
    carte.innerHTML = `
      <h3>${echapper(brigade.nom)} ▶</h3>
      <p class="brigade-code">Code : <strong>${codeLisible(brigade.code)}</strong></p>
      <p class="brigade-membres">${nombre} membre${nombre > 1 ? "s" : ""}</p>`;

    // ouvrirBrigade est dans classement.js, chargé après ce fichier
    carte.addEventListener("click", () => ouvrirBrigade(brigade));
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
