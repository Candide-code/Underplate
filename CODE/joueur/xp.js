// ==========================================================
// FORMULES RPG : XP, niveaux, titres
// (les règles sont dans guidelines/phase-0-cadrage.md)
// ==========================================================

// XP de base selon la difficulté (index = nombre d'étoiles)
const XP_PAR_DIFFICULTE = [0, 20, 35, 55, 80, 120];

const TITRES = ["Commis", "Apprenti", "Cuistot", "Chef de partie", "Sous-chef", "Chef", "Chef étoilé"];

// XP à gagner pour passer du niveau "niveau" au suivant : 70 × 1,25^(niveau − 1)
function xpPourNiveauSuivant(niveau) {
  return Math.round(70 * Math.pow(1.25, niveau - 1));
}

// À partir de l'XP totale, calcule le niveau et la progression dans ce niveau.
// Exemple : 100 XP → niveau 2, 30 XP sur 88 vers le niveau 3.
function calculerNiveau(xpTotale) {
  let niveau = 1;
  let reste = xpTotale;
  while (reste >= xpPourNiveauSuivant(niveau)) {
    reste = reste - xpPourNiveauSuivant(niveau);
    niveau = niveau + 1;
  }
  return {
    niveau: niveau,
    xpDansNiveau: reste,
    xpNecessaire: xpPourNiveauSuivant(niveau)
  };
}

// Titre du joueur (après le dernier titre, on le garde)
function titreDuNiveau(niveau) {
  const index = Math.min(niveau, TITRES.length) - 1;
  return TITRES[index];
}

// Bonus d'écart : une recette trop facile pour ton niveau rapporte moins
function bonusEcart(niveauJoueur, niveauRecette) {
  const ecart = niveauJoueur - niveauRecette;
  if (ecart <= 1) return 1;
  if (ecart === 2) return 0.75;
  if (ecart === 3) return 0.5;
  return 0.25;
}

// XP gagnée en finissant une recette
function calculerXpGagnee(recette, niveauJoueur, dejaFaite) {
  const base = XP_PAR_DIFFICULTE[recette.difficulte];
  const decouverte = dejaFaite ? 1 : 1.5; // bonus découverte ×1,5 la 1re fois
  return Math.round(base * decouverte * bonusEcart(niveauJoueur, recette.niveauRequis));
}
