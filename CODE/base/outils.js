// ==========================================================
// OUTILS COMMUNS, utilisés par plusieurs écrans
// ==========================================================

// Affiche un écran et cache tous les autres.
// id : l'id de l'écran, par ex. "ecran-accueil"
function afficherEcran(id) {
  const ecrans = document.querySelectorAll(".ecran");
  for (const ecran of ecrans) {
    ecran.hidden = true;
  }
  document.getElementById(id).hidden = false;
  window.scrollTo(0, 0); // on remonte en haut de la page
}

// Renvoie le HTML d'un sprite :
// - l'image si elle existe,
// - sinon un sprite temporaire (carré avec une lettre).
function htmlSprite(sprite, lettre, description) {
  if (sprite) {
    return `<img class="sprite" src="${sprite}" alt="${description}">`;
  }
  return `<span class="sprite sprite-temp" role="img" aria-label="${description}">${lettre}</span>`;
}

// Mélange un tableau au hasard (utile pour le plateau d'ingrédients)
function melanger(tableau) {
  const copie = [...tableau]; // on travaille sur une copie
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]]; // on échange deux éléments
  }
  return copie;
}

// Fait trembler un élément (ajoute puis retire la classe CSS "tremble")
function faireTrembler(element) {
  element.classList.remove("tremble");
  void element.offsetWidth; // astuce : force le navigateur à relancer l'animation
  element.classList.add("tremble");
}

// ---------- Garder l'écran allumé (API Wake Lock) ----------
// Pendant qu'on cuisine, le téléphone ne doit pas se mettre en veille.
// navigator.wakeLock.request("screen") demande au navigateur un "verrou"
// qui empêche l'écran de s'éteindre, jusqu'à ce qu'on le relâche.

let verrouEcran = null;              // le verrou en cours (null = aucun)
let ecranDoitResterAllume = false;   // ce qu'on veut, même si le verrou a sauté

// "async" : la fonction peut attendre une réponse du navigateur avec "await"
async function garderEcranAllume() {
  ecranDoitResterAllume = true;
  if (!("wakeLock" in navigator)) return; // navigateur trop ancien : tant pis
  try {
    verrouEcran = await navigator.wakeLock.request("screen");
    // Si on a quitté la recette pendant l'attente, on relâche tout de suite
    if (!ecranDoitResterAllume) laisserEcranSEteindre();
  } catch (erreur) {
    console.warn("Impossible de garder l'écran allumé :", erreur);
  }
}

function laisserEcranSEteindre() {
  ecranDoitResterAllume = false;
  if (verrouEcran) {
    verrouEcran.release();
    verrouEcran = null;
  }
}

// Le navigateur relâche le verrou tout seul quand on change d'appli.
// Quand on revient sur la page, on le redemande si on cuisine encore.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && ecranDoitResterAllume) {
    garderEcranAllume();
  }
});

// ---------- Le bip (API Web Audio) ----------
// Le navigateur fabrique le son lui-même : pas besoin de fichier audio.
// Un "oscillateur" produit une note ; en onde carrée ("square"),
// ça donne un son de vieille console, qui va bien avec le pixel art.

let contexteAudio = null; // la "table de mixage" du navigateur

// Les navigateurs (surtout sur iPhone) n'autorisent le son qu'après
// un geste du joueur. On appelle donc cette fonction dans un clic,
// pour que le bip puisse sonner plus tard, tout seul.
function preparerSon() {
  if (!contexteAudio) {
    const Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) return; // navigateur trop ancien : pas de son
    contexteAudio = new Contexte();
  }
  if (contexteAudio.state === "suspended") contexteAudio.resume();
}

// 2 séries de 3 bips, comme un minuteur de cuisine
function jouerBip() {
  if (!contexteAudio) return;
  if (contexteAudio.state === "suspended") contexteAudio.resume();

  const maintenant = contexteAudio.currentTime; // l'horloge du son, en secondes
  for (let serie = 0; serie < 2; serie++) {
    for (let i = 0; i < 3; i++) {
      const debut = maintenant + serie * 0.8 + i * 0.15;

      const oscillateur = contexteAudio.createOscillator();
      oscillateur.type = "square";
      oscillateur.frequency.value = 880; // la note (en Hz) : un La aigu

      const volume = contexteAudio.createGain();
      volume.gain.value = 0.15;          // de 0 (muet) à 1 (très fort)

      // On branche : oscillateur → volume → haut-parleur
      oscillateur.connect(volume);
      volume.connect(contexteAudio.destination);

      oscillateur.start(debut);
      oscillateur.stop(debut + 0.1);     // chaque bip dure 0,1 s
    }
  }
}

// Fait vibrer le téléphone si c'est possible (Android oui, iPhone non)
function vibrer(motif) {
  if (navigator.vibrate) {
    navigator.vibrate(motif);
  }
}

// ---------- Recherche ----------

// Pour chercher sans se soucier des accents ni des majuscules : "Pâtes" → "pates"
function simplifier(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
