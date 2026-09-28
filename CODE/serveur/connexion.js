// ==========================================================
// CONNEXION : le compte anonyme, et la copie de la partie sur le serveur
// Le jeu reste « local d'abord » : la sauvegarde du téléphone est la
// référence. Le serveur en reçoit une copie après chaque sauvegarde.
// Sans réseau, rien ne part : on réessaie à la prochaine sauvegarde
// ou à la prochaine ouverture du jeu.
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

// Renvoie l'identifiant du compte, en le créant s'il n'existe pas encore.
// La clé du compte est gardée par supabase-js dans le localStorage :
// à la prochaine ouverture, on retrouve le même compte.
async function compteDuJoueur() {
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
