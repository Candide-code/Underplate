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
  const dejaFaite = nombreDeFois(recette.id) > 0;
  const gain = calculerXpGagnee(recette, avant.niveau, dejaFaite);

  joueur.xp += gain;
  joueur.recettesFaites[recette.id] = nombreDeFois(recette.id) + 1;
  sauvegarder();

  const apres = calculerNiveau(joueur.xp);

  // 2. XP gagnée + barre (elle se remplit grâce à la transition CSS)
  document.getElementById("fin-gain").textContent = "+" + gain + " XP" + (dejaFaite ? "" : " (découverte ×1,5)");
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
    lignes.push("* Tu te sens plus fort. Niveau " + apres.niveau + " !");
    lignes.push("* Tu es maintenant " + titreDuNiveau(apres.niveau) + ".");
    const debloquees = recettes.filter(r => r.niveauRequis > avant.niveau && r.niveauRequis <= apres.niveau);
    for (const r of debloquees) {
      lignes.push("* Nouvelle recette : " + r.nom + " !");
    }
  } else {
    const manque = apres.xpNecessaire - apres.xpDansNiveau;
    lignes.push("* Bien joué, chef !");
    lignes.push("* Plus que " + manque + " XP avant le niveau " + (apres.niveau + 1) + ".");
  }
  document.getElementById("fin-dialogue").innerHTML = lignes.map(l => `<p>${l}</p>`).join("");

  // 4. Récap de la recette pour la refaire
  document.getElementById("fin-recap").innerHTML =
    recette.etapes.map(e => `<li>${e.texte}</li>`).join("");

  document.getElementById("fin-jai-fini").hidden = true;
  document.getElementById("fin-resultats").hidden = false;
});

document.getElementById("fin-retour").addEventListener("click", afficherAccueil);
