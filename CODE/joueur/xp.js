// ==========================================================
// FORMULES RPG : XP, niveaux, titres
// (les règles sont dans guidelines/phase-0-cadrage.md)
// ==========================================================

// XP de base selon la difficulté (index = nombre d'étoiles)
const XP_PAR_DIFFICULTE = [0, 20, 35, 55, 80, 120];

// Les titres, avec le niveau à partir duquel on les obtient.
// Les paliers s'espacent : chaque titre se mérite plus que le précédent.
const TITRES = [
  { niveau: 1,   m: "Commis",         f: "Commise" },
  { niveau: 5,   m: "Apprenti",       f: "Apprentie" },
  { niveau: 10,  m: "Cuistot",        f: "Cuistote" },
  { niveau: 18,  m: "Chef de partie", f: "Cheffe de partie" },
  { niveau: 30,  m: "Sous-chef",      f: "Sous-cheffe" },
  { niveau: 50,  m: "Chef",           f: "Cheffe" },
  { niveau: 75,  m: "Chef étoilé",    f: "Cheffe étoilée" },
  { niveau: 100, m: "Chef 1 étoile",  f: "Cheffe 1 étoile" },
  { niveau: 125, m: "Chef 2 étoiles", f: "Cheffe 2 étoiles" },
  { niveau: 150, m: "Chef 3 étoiles", f: "Cheffe 3 étoiles" }
];

// XP à gagner pour passer du niveau "niveau" au suivant :
// - niveaux 1 à 5 : +25 % à chaque fois (70, 88, 109, 137, 171)
// - ensuite : +10 XP par niveau, sans jamais dépasser 200 (≈ 3 repas par niveau)
function xpPourNiveauSuivant(niveau) {
  if (niveau <= 5) {
    return Math.round(70 * Math.pow(1.25, niveau - 1));
  }
  return Math.min(171 + 10 * (niveau - 5), 200);
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

// Titre du joueur : le dernier palier atteint (après le dernier, on le garde).
// genre = "m" ou "f" : titre[genre] revient à écrire titre.m ou titre.f
function titreDuNiveau(niveau, genre) {
  let titre = TITRES[0];
  for (const t of TITRES) {
    if (niveau >= t.niveau) titre = t;
  }
  return titre[genre];
}

// Bonus d'écart : une recette trop facile pour ton niveau rapporte moins
// Il ne sert que pendant le déblocage des recettes (niveaux 1 à 5) :
// dès le niveau 6, toutes sont débloquées et plus rien n'est pénalisé.
function bonusEcart(niveauJoueur, niveauRecette) {
  if (niveauJoueur >= 6) return 1;
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

// Le niveau « de référence » d'une recette pour le malus d'écart : le plus grand
// entre son niveau de déblocage et son nombre d'étoiles. Une recette difficile
// débloquée tôt (cinnamon roll ★★★★ au niveau 1) n'est pas punie comme une omelette.
function niveauDeReference(recette) {
  return Math.max(recette.niveauRequis, recette.difficulte);
}

// Bonus « recette longue » : +25 % pour une recette de 2 h ou plus
const DUREE_RECETTE_LONGUE = 120; // en minutes
function bonusRecetteLongue(recette) {
  return recette.temps >= DUREE_RECETTE_LONGUE ? 1.25 : 1;
}

// XP gagnée en finissant une recette déjà faite "fois" fois
function calculerXpGagnee(recette, niveauJoueur, fois) {
  const base = XP_PAR_DIFFICULTE[recette.difficulte];
  const decouverte = fois === 0 ? 1.5 : 1; // bonus découverte ×1,5 la 1re fois
  const rang = rangDeMaitrise(fois);
  const maitrise = rang ? rang.bonus : 1;  // bonus du rang déjà atteint
  const ecart = bonusEcart(niveauJoueur, niveauDeReference(recette));
  return Math.round(base * decouverte * ecart * maitrise * bonusRecetteLongue(recette));
}
