// ==========================================================
// CONNEXION : le compte anonyme, et la copie de la partie sur le serveur
// Le jeu reste « local d'abord » : la sauvegarde du téléphone est la
// référence. Le serveur en reçoit une copie après chaque sauvegarde.
// Sans réseau, rien ne part : on réessaie au retour du réseau, à la
// prochaine sauvegarde ou à la prochaine ouverture du jeu.
// Guide : guidelines/serveur-supabase.md (partie 7)
// ==========================================================

// Le « client » Supabase : c'est par lui qu'on parle au serveur.
// supabase = la bibliothèque (lib/supabase.js). Si elle n'a pas pu
// se charger, serveur reste null et le jeu marche sans serveur.
const serveur = window.supabase
  ? supabase.createClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE)
  : null;

// Pas de bibliothèque ou pas de réseau : inutile d'essayer
function serveurJoignable() {
  return serveur !== null && navigator.onLine;
}

// Un seul envoi à la fois. Si on sauvegarde pendant un envoi,
// on en refait un à la fin (avec la partie la plus récente).
let envoiEnCours = false;
let envoiARefaire = false;

// La demande de compte en cours (null = aucune)
let compteEnCours = null;

// Renvoie l'identifiant du compte, en le créant s'il n'existe pas encore.
// Si deux parties du jeu le demandent en même temps (envoi + brigade…),
// elles attendent la MÊME réponse : on ne crée jamais 2 comptes d'un coup.
function compteDuJoueur() {
  if (!compteEnCours) {
    compteEnCours = trouverOuCreerCompte().finally(() => { compteEnCours = null; });
  }
  return compteEnCours;
}

// La clé du compte est gardée par supabase-js dans le localStorage :
// à la prochaine ouverture, on retrouve le même compte.
async function trouverOuCreerCompte() {
  const { data } = await serveur.auth.getSession();
  if (data.session) return data.session.user.id;

  const reponse = await serveur.auth.signInAnonymously();
  if (reponse.error) throw reponse.error;
  console.log("Compte créé sur le serveur :", reponse.data.user.id);
  return reponse.data.user.id;
}

// Envoie le profil (ce que les groupes verront) et la sauvegarde complète (privée)
async function envoyerAuServeur() {
  // Pas de serveur, pas de réseau, ou chef pas encore créé : rien à faire
  if (!serveurJoignable() || !joueur.chef) return;

  if (envoiEnCours) {
    envoiARefaire = true;
    return;
  }
  envoiEnCours = true;

  try {
    const id = await compteDuJoueur();
    const maintenant = new Date().toISOString();

    // upsert = « crée la ligne si elle n'existe pas, sinon mets-la à jour »
    const [profil, sauvegarde] = await Promise.all([
      serveur.from("profils").upsert({
        id: id,
        pseudo: joueur.chef.pseudo,
        chef: joueur.chef,
        xp: joueur.xp,
        mis_a_jour: maintenant
      }),
      serveur.from("sauvegardes").upsert({
        id: id,
        donnees: joueur,
        mis_a_jour: maintenant
      })
    ]);
    if (profil.error) throw profil.error;
    if (sauvegarde.error) throw sauvegarde.error;

    // Mes recettes CUSTOM, pour les membres de mes brigades (brigade/partage.js)
    await partagerMesRecettes(id);

    // Le profil est bien sur le serveur : les événements en attente peuvent partir
    envoyerFileActivites();
  } catch (erreur) {
    // Pas grave : la partie est dans le téléphone, on réessaiera
    console.warn("Envoi au serveur impossible :", erreur);
  } finally {
    envoiEnCours = false;
    if (envoiARefaire) {
      envoiARefaire = false;
      envoyerAuServeur();
    }
  }
}

// ---------- Le fil d'activité, avec sa file d'attente ----------
// Un événement (« a cuisiné… ») passe TOUJOURS par une file d'attente
// rangée dans le téléphone. On essaie de l'envoyer tout de suite ; sans
// réseau, il attend, et part au retour du réseau ou à la prochaine ouverture.
// Chaque événement garde sa vraie date : dans le fil, il se range au bon moment.

const CLE_FILE_ACTIVITES = "underplate-file-activites";
const TAILLE_MAX_FILE = 100; // au-delà, les plus anciens sont oubliés

function lireFileActivites() {
  try {
    return JSON.parse(localStorage.getItem(CLE_FILE_ACTIVITES)) || [];
  } catch (erreur) {
    return [];
  }
}

function ecrireFileActivites(file) {
  try {
    if (file.length === 0) localStorage.removeItem(CLE_FILE_ACTIVITES);
    else localStorage.setItem(CLE_FILE_ACTIVITES, JSON.stringify(file));
  } catch (erreur) {
    console.warn("File d'attente non gardée :", erreur);
  }
}

// activites = [{ type: "recette", donnees: { … } }, …] (voir fin-recette.js)
// joueur_id n'est pas envoyé : le serveur met celui du compte connecté.
function publierActivites(activites) {
  if (activites.length === 0) return;
  const maintenant = new Date().toISOString();
  const nouvelles = activites.map(activite => ({ ...activite, cree_le: maintenant }));
  ecrireFileActivites(lireFileActivites().concat(nouvelles).slice(-TAILLE_MAX_FILE));
  envoyerFileActivites();
}

// Un seul envoi de la file à la fois
let fileEnCours = false;

async function envoyerFileActivites() {
  if (fileEnCours || !serveurJoignable() || !joueur.chef) return;
  const file = lireFileActivites();
  if (file.length === 0) return;

  fileEnCours = true;
  try {
    await compteDuJoueur();
    const { error } = await serveur.from("activites").insert(file);
    if (error) throw error;
    // On retire ce qui est parti. D'autres événements ont pu arriver
    // pendant l'envoi (à la fin de la file) : on les garde.
    ecrireFileActivites(lireFileActivites().slice(file.length));
  } catch (erreur) {
    // Pas grave : ils restent dans la file, on réessaiera
    console.warn("Activités en attente :", erreur);
  } finally {
    fileEnCours = false;
  }
}

// Le réseau revient (Wi-Fi retrouvé, mode avion coupé…) : on envoie
// la partie, puis la file d'attente (voir la fin de envoyerAuServeur)
window.addEventListener("online", () => envoyerAuServeur());
