// ==========================================================
// FIN DE RECETTE : "J'ai fini", XP gagnée, level up, récap
// ==========================================================

let recetteTerminee = null;

function terminerRecette(recette) {
  recetteTerminee = recette;

  document.getElementById("fin-sprite").innerHTML = htmlSprite(recette.sprite, recette.initiale, recette.nom);
  document.getElementById("fin-nom").textContent = recette.nom;
  document.getElementById("fin-jai-fini").hidden = false;
  document.getElementById("fin-resultats").hidden = true;

  afficherEcran("ecran-fin");
}

// Le joueur confirme sur l'honneur qu'il a bien cuisiné
document.getElementById("fin-jai-fini").addEventListener("click", () => {
  const recette = recetteTerminee;

  // 1. On calcule et on ajoute l'XP
  const avant = calculerNiveau(joueur.xp);
  const foisAvant = nombreDeFois(recette.id);
  const gain = calculerXpGagnee(recette, avant.niveau, foisAvant);

  joueur.xp += gain;
  joueur.recettesFaites[recette.id] = foisAvant + 1;
  sauvegarder();

  const apres = calculerNiveau(joueur.xp);
  const rangAvant = rangDeMaitrise(foisAvant);
  const rangApres = rangDeMaitrise(foisAvant + 1);

  // 2. XP gagnée (avec le détail des bonus) + barre qui se remplit grâce à la transition CSS
  const bonus = [];
  if (foisAvant === 0) bonus.push("découverte ×1,5");
  if (rangAvant) bonus.push("rang " + rangAvant.nom + " +" + pourcentageBonus(rangAvant) + " %");
  document.getElementById("fin-gain").textContent =
    "+" + gain + " XP" + (bonus.length > 0 ? " (" + bonus.join(", ") + ")" : "");
  const barre = document.getElementById("fin-barre");
  barre.style.width = "0%";
  setTimeout(() => {
    barre.style.width = (apres.xpDansNiveau / apres.xpNecessaire) * 100 + "%";
  }, 100);
  document.getElementById("fin-xp").textContent =
    "Niv. " + apres.niveau + " · " + apres.xpDansNiveau + " / " + apres.xpNecessaire + " XP";

  // 3. Message dans la boîte de dialogue
  let lignes = [];
  if (apres.niveau > avant.niveau) {
    lignes.push("* Tu te sens plus " + accord("fort", "forte") + ". Niveau " + apres.niveau + " !");
    // Le titre ne change qu'à certains paliers (5, 10, 18…) : on ne l'annonce que s'il change
    const genre = chefActuel().genre;
    const titreAvant = titreDuNiveau(avant.niveau, genre);
    const titreApres = titreDuNiveau(apres.niveau, genre);
    if (titreApres !== titreAvant) {
      lignes.push("* Nouveau titre : " + titreApres + " !");
    }
    const debloquees = recettesEcrites().filter(r => r.niveauRequis > avant.niveau && r.niveauRequis <= apres.niveau);
    for (const r of debloquees) {
      lignes.push("* Nouvelle recette : " + r.nom + " !");
    }
  } else {
    const manque = apres.xpNecessaire - apres.xpDansNiveau;
    lignes.push("* Bien joué, " + nomDuChef() + " !");
    lignes.push("* Plus que " + manque + " XP avant le niveau " + (apres.niveau + 1) + ".");
  }
  if (rangApres !== rangAvant) {
    lignes.push("* " + recette.nom + " maîtrisée : rang " + rangApres.nom + " !");
    lignes.push("* Bonus sur cette recette : +" + pourcentageBonus(rangApres) + " % d'XP.");
  }
  document.getElementById("fin-dialogue").innerHTML = lignes.map(l => `<p>${l}</p>`).join("");

  // 4. Récap de la recette pour la refaire (même contenu que la fiche du Grimoire)
  document.getElementById("fin-recap").innerHTML = htmlRecap(recette);

  document.getElementById("fin-jai-fini").hidden = true;
  document.getElementById("fin-resultats").hidden = false;
});

document.getElementById("fin-retour").addEventListener("click", afficherAccueil);
