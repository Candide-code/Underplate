// ==========================================================
// ACCUEIL : en-tête du joueur + menu (Recettes / Grimoire)
// RECETTES : une carte par recette
// ==========================================================

// ---------- Accueil (le menu) ----------

function afficherAccueil() {
  afficherEntete();
  // Badge NEW! sur GRIMOIRE tant qu'une nouvelle fiche n'a pas été ouverte
  document.getElementById("grimoire-badge").hidden = !grimoireANouveautes();
  afficherEcran("ecran-accueil");
}

document.getElementById("menu-recettes").addEventListener("click", afficherRecettes);
// afficherGrimoire est dans grimoire.js, chargé APRÈS ce fichier : on l'appelle
// dans une petite fonction () => …, qui ne la cherche qu'au moment du clic
document.getElementById("menu-grimoire").addEventListener("click", () => afficherGrimoire());

// ---------- Écran Recettes ----------

// Bordure selon le rang de maîtrise : ajoute "maitrise rang-or", etc. à la carte
function appliquerRang(carte, fois) {
  const rang = rangDeMaitrise(fois);
  if (rang) {
    carte.classList.add("maitrise", "rang-" + rang.nom.toLowerCase());
    carte.title = "Rang " + rang.nom;
  }
}

function afficherRecettes() {
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

      appliquerRang(carte, fois);

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

  afficherEcran("ecran-recettes");
}

document.getElementById("recettes-retour").addEventListener("click", afficherAccueil);
