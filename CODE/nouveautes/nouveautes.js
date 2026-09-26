// ==========================================================
// NOUVEAUTÉS : annonce les recettes arrivées avec une mise à jour
// La sauvegarde retient les recettes que le joueur connaît déjà
// (joueur.recettesConnues). À l'ouverture, celles qui manquent à
// cette liste sont annoncées dans une boîte de dialogue.
// ==========================================================

const fenetreNouveautes = document.getElementById("fenetre-nouveautes");

document.getElementById("nouveautes-ok").addEventListener("click", () => {
  fenetreNouveautes.close();
});

function verifierNouveautes() {
  const ids = recettesEcrites().map(recette => recette.id);

  // 1re fois : un nouveau joueur connaît déjà tout (rien à annoncer).
  // Une sauvegarde d'avant cette fonction connaît tout sauf les gyozas,
  // la 1re recette arrivée par mise à jour (2026-09-26).
  if (!joueur.recettesConnues) {
    joueur.recettesConnues = joueur.chef === null ? ids : ids.filter(id => id !== "gyozas-poulet");
    sauvegarder();
  }

  const nouvelles = recettesEcrites().filter(recette => !joueur.recettesConnues.includes(recette.id));
  if (nouvelles.length === 0) return;

  // On garde la surprise : pas de nom, juste l'annonce
  const lignes = [
    "* Du nouveau dans la cuisine…",
    nouvelles.length === 1
      ? "* Une nouvelle recette est arrivée !"
      : "* " + nouvelles.length + " nouvelles recettes sont arrivées !",
    "* Va jeter un œil dans RECETTES."
  ];
  document.getElementById("nouveautes-texte").innerHTML = lignes.map(l => `<p>${l}</p>`).join("");

  // On ne les annonce qu'une fois
  joueur.recettesConnues = joueur.recettesConnues.concat(nouvelles.map(recette => recette.id));
  sauvegarder();

  fenetreNouveautes.showModal();
}
