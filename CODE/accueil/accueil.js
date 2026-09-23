// ==========================================================
// ACCUEIL : en-tête du joueur + une carte par recette
// ==========================================================

function afficherAccueil() {
  afficherEntete();

  const niveauJoueur = calculerNiveau(joueur.xp).niveau;
  const grille = document.getElementById("grille-recettes");
  grille.innerHTML = ""; // on vide la grille avant de la remplir

  for (const recette of recettes) {
    const carte = document.createElement("button");
    carte.className = "carte-recette cadre";

    if (recette.niveauRequis > niveauJoueur) {
      // Recette verrouillée : on cache tout sauf le niveau requis
      carte.classList.add("verrouillee");
      carte.disabled = true;
      carte.innerHTML = `
        <span class="sprite sprite-temp">?</span>
        <h3>???</h3>
        <div class="carte-infos"><span>🔒</span><span>Niv. ${recette.niveauRequis}</span></div>`;
    } else {
      const fois = nombreDeFois(recette.id);
      carte.innerHTML = `
        ${fois === 0 ? '<span class="badge-new">NEW!</span>' : ""}
        ${htmlSprite(recette.sprite, recette.initiale, recette.nom)}
        <h3>${recette.nom}</h3>
        <div class="carte-infos">
          <span class="difficulte">${"★".repeat(recette.difficulte)}</span>
          <span class="fois-faite">${fois === 0 ? "jamais" : "✓x" + fois}</span>
        </div>`;
      carte.addEventListener("click", () => ouvrirPreparation(recette));
    }

    grille.appendChild(carte);
  }

  afficherEcran("ecran-accueil");
}
