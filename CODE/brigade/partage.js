// ==========================================================
// RECETTES PARTAGÉES : les recettes CUSTOM des membres d'une brigade
// - Envoi : mes recettes CUSTOM partent sur le serveur (table
//   recettes_partagees) à chaque sauvegarde, avec les ingrédients et
//   ustensiles que j'ai tapés à la main (les autres ne les ont pas).
// - Écran d'une brigade : les recettes des AUTRES membres, avec
//   « AJOUTER » pour en mettre une copie dans mes recettes CUSTOM.
// Une copie n'est pas repartagée (sinon l'auteur verrait sa propre
// recette revenir par un autre membre).
// ==========================================================

// ---------- Envoi de mes recettes ----------

// Ma recette + les ingrédients et ustensiles « perso » qu'elle utilise
function paquetRecette(recette) {
  const ingredientsPerso = {};
  for (const ligne of recette.ingredients) {
    if (joueur.ingredientsPerso[ligne.id]) ingredientsPerso[ligne.id] = joueur.ingredientsPerso[ligne.id];
  }
  const ustensilesPerso = {};
  for (const id of recette.ustensiles) {
    if (joueur.ustensilesPerso[id]) ustensilesPerso[id] = joueur.ustensilesPerso[id];
  }
  return { recette, ingredientsPerso, ustensilesPerso };
}

// Met le serveur à jour : mes recettes (sauf les copies), et on retire
// celles que j'ai supprimées. Appelée par envoyerAuServeur (connexion.js).
async function partagerMesRecettes(monId) {
  const miennes = joueur.recettesPerso.filter(recette => !recette.copieDe);
  const maintenant = new Date().toISOString();

  // 1. On retire du serveur les recettes qui ne sont plus dans ma liste
  let retrait = serveur.from("recettes_partagees").delete().eq("joueur_id", monId);
  if (miennes.length > 0) {
    // not in : « toutes SAUF celles-ci » (identifiants : lettres, chiffres, tirets)
    retrait = retrait.not("recette_id", "in", "(" + miennes.map(r => r.id).join(",") + ")");
  }
  const reponseRetrait = await retrait;
  if (reponseRetrait.error) throw reponseRetrait.error;

  // 2. On envoie (ou met à jour) les autres
  if (miennes.length === 0) return;
  const { error } = await serveur.from("recettes_partagees").upsert(
    miennes.map(recette => ({
      joueur_id: monId,
      recette_id: recette.id,
      recette: paquetRecette(recette),
      mis_a_jour: maintenant
    }))
  );
  if (error) throw error;
}

// ---------- Vérifier une recette venue d'un autre joueur ----------

// Un texte sans < > " (ils pourraient casser l'affichage, qui met ces
// textes dans du HTML), sans espaces autour, et pas trop long
function texteSur(valeur, longueurMax) {
  return String(valeur == null ? "" : valeur).replace(/[<>"]/g, "").trim().slice(0, longueurMax);
}

// Un nombre entier entre min et max, sinon la valeur par défaut
function entierSur(valeur, min, max, defaut) {
  const nombre = Math.round(Number(valeur));
  return Number.isFinite(nombre) && nombre >= min && nombre <= max ? nombre : defaut;
}

// Un identifiant « propre » : minuscules, chiffres et tirets seulement
function identifiantSur(valeur) {
  return typeof valeur === "string" && /^[a-z0-9-]{1,60}$/.test(valeur) ? valeur : null;
}

// Reconstruit une recette champ par champ à partir d'un paquet reçu.
// Renvoie null si elle est incomplète ou bizarre (on ne l'ajoute pas).
// Les ingrédients / ustensiles perso qui me manquent sont ajoutés à mes catalogues.
function recetteVerifiee(paquet, origine) {
  const source = paquet && paquet.recette;
  if (!source || !Array.isArray(source.ingredients) || !Array.isArray(source.ustensiles)
      || !Array.isArray(source.etapes) || source.etapes.length === 0) return null;

  const nouveauxIngredients = {};
  const nouveauxUstensiles = {};

  // Un ingrédient de la recette : déjà dans mon catalogue, ou fourni par le paquet
  function ingredientConnu(valeur) {
    const id = identifiantSur(valeur);
    if (!id) return null;
    if (ingredients[id] || nouveauxIngredients[id]) return id;
    const definition = paquet.ingredientsPerso && paquet.ingredientsPerso[id];
    if (!definition) return null;
    nouveauxIngredients[id] = { nom: texteSur(definition.nom, 30) || "?", famille: texteSur(definition.famille, 20), sprite: null };
    return id;
  }

  function ustensileConnu(valeur) {
    const id = identifiantSur(valeur);
    if (!id) return null;
    if (ustensiles[id] || nouveauxUstensiles[id]) return id;
    const definition = paquet.ustensilesPerso && paquet.ustensilesPerso[id];
    if (!definition) return null;
    nouveauxUstensiles[id] = { nom: texteSur(definition.nom, 30) || "?", groupe: texteSur(definition.groupe, 20), sprite: null };
    return id;
  }

  // nouvelleRecettePerso (custom.js) : une recette vide, avec un nouvel identifiant
  const recette = nouvelleRecettePerso(source.categorie === "sucre" ? "sucre" : "sale");
  recette.nom = texteSur(source.nom, 40) || "Recette partagée";
  recette.difficulte = entierSur(source.difficulte, 1, 5, 1);
  recette.temps = entierSur(source.temps, 1, 600, 10);
  recette.copieDe = origine; // { joueur, recette } : pour savoir qu'on l'a déjà

  for (const ligne of source.ingredients) {
    const id = ingredientConnu(ligne && ligne.id);
    if (!id) return null;
    recette.ingredients.push({ id: id, quantite: texteSur(ligne.quantite, 20) });
  }

  for (const valeur of source.ustensiles) {
    const id = ustensileConnu(valeur);
    if (!id) return null;
    recette.ustensiles.push(id);
  }

  for (const e of source.etapes) {
    if (!e || !["ajouter", "action", "cuisson"].includes(e.type)) return null;
    const ustensile = ustensileConnu(e.ustensile);
    if (!ustensile) return null;
    const etape = { type: e.type, ustensile: ustensile, texte: texteSur(e.texte, 200) };
    if (e.type === "ajouter") {
      etape.ingredient = ingredientConnu(e.ingredient);
      if (!etape.ingredient) return null;
    }
    if (e.type === "action") {
      etape.action = texteSur(e.action, 30) || "Mélanger";
      etape.fois = entierSur(e.fois, 1, 20, 3);
    }
    if (e.type === "cuisson") etape.duree = entierSur(e.duree, 1, 36000, 60);
    recette.etapes.push(etape);
  }

  // Tout est bon : on garde les ingrédients / ustensiles qui me manquaient
  Object.assign(joueur.ingredientsPerso, nouveauxIngredients);
  Object.assign(joueur.ustensilesPerso, nouveauxUstensiles);
  return recette;
}

// ---------- Écran d'une brigade : les recettes des autres ----------

const listePartagees = document.getElementById("recettes-partagees");
const messagePartagees = document.getElementById("partagees-message");

function afficherMessagePartagees(texte) {
  messagePartagees.textContent = texte;
  messagePartagees.hidden = texte === "";
}

// Déjà dans mes recettes ? (une copie retient d'où elle vient)
function dejaCopiee(ligne) {
  return joueur.recettesPerso.some(r =>
    r.copieDe && r.copieDe.joueur === ligne.joueur_id && r.copieDe.recette === ligne.recette_id);
}

// idsAutres : les membres de la brigade, sauf moi
async function chargerRecettesPartagees(idsAutres) {
  listePartagees.innerHTML = "";
  if (idsAutres.length === 0) {
    afficherMessagePartagees("Invite des potes : leurs recettes CUSTOM apparaîtront ici.");
    return;
  }
  afficherMessagePartagees("Chargement…");
  try {
    const { data, error } = await serveur
      .from("recettes_partagees")
      .select("joueur_id, recette_id, recette, profils(pseudo, chef)")
      .in("joueur_id", idsAutres)
      .order("mis_a_jour", { ascending: false });
    if (error) throw error;

    afficherMessagePartagees(data.length === 0 ? "Personne n'a encore créé de recette CUSTOM." : "");
    for (const ligne of data) afficherRecettePartagee(ligne);
  } catch (erreur) {
    console.warn("Recettes partagées impossibles à charger :", erreur);
    afficherMessagePartagees("Le serveur ne répond pas. Réessaie dans un moment.");
  }
}

// Une carte : nom, catégorie, étoiles, auteur, puis AJOUTER (ou « déjà ajoutée »)
function afficherRecettePartagee(ligne) {
  const source = (ligne.recette && ligne.recette.recette) || {};
  const profil = ligne.profils || {};
  const chef = chefVerifie(profil.chef);
  const auteur = (chef.genre === "f" ? "Cheffe " : "Chef ") + (profil.pseudo || "?");
  const etoiles = "★".repeat(entierSur(source.difficulte, 1, 5, 1));

  const carte = document.createElement("li");
  carte.className = "recette-partagee cadre";
  carte.innerHTML = `
    <p class="recette-partagee-nom">${echapper(source.nom || "?")}</p>
    <p class="recette-partagee-infos">${source.categorie === "sucre" ? "Sucré" : "Salé"} · ${etoiles} · de ${echapper(auteur)}</p>
    <p class="recette-partagee-ok" hidden>✓ Dans tes recettes CUSTOM</p>
    <button class="bouton">AJOUTER ▶</button>`;

  const bouton = carte.querySelector(".bouton");
  const ok = carte.querySelector(".recette-partagee-ok");
  function montrerAjoutee() {
    bouton.hidden = true;
    ok.hidden = false;
  }
  if (dejaCopiee(ligne)) montrerAjoutee();

  bouton.addEventListener("click", () => {
    const copie = recetteVerifiee(ligne.recette, { joueur: ligne.joueur_id, recette: ligne.recette_id });
    if (!copie) {
      faireTrembler(carte);
      ok.textContent = "Cette recette n'a pas pu être copiée.";
      ok.hidden = false;
      return;
    }
    brancherCataloguesPerso();       // les nouveaux ingrédients rejoignent les catalogues (custom.js)
    enregistrerRecettePerso(copie);  // ajoutée à mes recettes + sauvegarde (custom.js)
    montrerAjoutee();
  });

  listePartagees.appendChild(carte);
}
