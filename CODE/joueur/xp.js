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

// Rangs de maîtrise d'une recette : plus on la refait, plus elle rapporte
const RANGS = [
  { nom: "Bronze",  fois: 1,  bonus: 1.05 }, // +5 %
  { nom: "Argent",  fois: 5,  bonus: 1.10 }, // +10 %
  { nom: "Or",      fois: 10, bonus: 1.25 }, // +25 %
  { nom: "Platine", fois: 20, bonus: 1.50 }  // +50 %
];

// Rang atteint après avoir fait la recette "fois" fois (null si jamais faite)
function rangDeMaitrise(fois) {
  let rang = null;
  for (const r of RANGS) {
    if (fois >= r.fois) rang = r;
  }
  return rang;
}

// Prochain rang à atteindre (null si on est déjà Platine)
function rangSuivant(fois) {
  return RANGS.find(r => fois < r.fois) || null;
}

// Bonus d'un rang en pourcentage : 1.25 → 25
function pourcentageBonus(rang) {
  return Math.round((rang.bonus - 1) * 100);
}

// XP gagnée en finissant une recette déjà faite "fois" fois
function calculerXpGagnee(recette, niveauJoueur, fois) {
  const base = XP_PAR_DIFFICULTE[recette.difficulte];
  const decouverte = fois === 0 ? 1.5 : 1; // bonus découverte ×1,5 la 1re fois
  const rang = rangDeMaitrise(fois);
  const maitrise = rang ? rang.bonus : 1;  // bonus du rang déjà atteint
  return Math.round(base * decouverte * bonusEcart(niveauJoueur, recette.niveauRequis) * maitrise);
}
