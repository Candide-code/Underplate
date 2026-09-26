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

  const niveau = calculerNiveau(joueur.xp).niveau;
  const lignes = [nouvelles.length === 1 ? "* Nouvelle recette au menu !" : "* Nouvelles recettes au menu !"];
  for (const recette of nouvelles) {
    const categorie = recette.categorie === "sucre" ? "sucré" : "salé";
    const quand = niveau >= recette.niveauRequis
      ? "prête à cuisiner !"
      : "dès le niveau " + recette.niveauRequis + ".";
    lignes.push("* " + recette.nom + " (" + categorie + ") : " + quand);
  }
  document.getElementById("nouveautes-texte").innerHTML = lignes.map(l => `<p>${l}</p>`).join("");

  // On ne les annonce qu'une fois
  joueur.recettesConnues = joueur.recettesConnues.concat(nouvelles.map(recette => recette.id));
  sauvegarder();

  fenetreNouveautes.showModal();
}
