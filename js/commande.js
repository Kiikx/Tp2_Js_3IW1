import { panier, sauvegarderPanier, afficherPanier, viderPanier } from "./panier.js";
import { afficherToaster } from "./toaster.js";
import { debiterWallet, getSoldeWallet } from "./wallet.js";

const btnCommander = document.getElementById("btn-commander");
const btnViderPanier = document.getElementById("btn-vider-panier");
const btnValider = document.getElementById("btn-valider");
const btnAnnuler = document.getElementById("btn-annuler");

const recapZone = document.getElementById("recap");
const recapContenu = document.getElementById("recap-contenu");
const recapPrix = document.getElementById("recap-prix");

const commandesEnCours = [];

export function initialiserCommande() {
  btnCommander.addEventListener("click", () => {
    if (Object.keys(panier).length === 0) {
      afficherToaster("Le panier est vide, impossible de commander", true);
    }else {
    afficherRecapitulatif();
    }
  });



  btnAnnuler.addEventListener("click", () => {
    recapZone.style.display = "none";
  });

  btnValider.addEventListener("click", async () => {
    let totalHT = 0;
    const TVA = 0.20;

    for (const id in panier) {
      const item = panier[id];
      if (!item || typeof item.price === "undefined") continue;
      totalHT += item.price * item.quantity;
    }

    const totalTTC = totalHT + totalHT * TVA;

    if (getSoldeWallet() < totalTTC) {
      afficherToaster("Fonds insuffisants dans le wallet", true);
      return;
    }

    recapZone.style.display = "none";
    await fakePostCommande();
    debiterWallet(totalTTC);

    viderPanier();
    sauvegarderPanier();
    afficherPanier();
    afficherToaster("Commande validée !");
    afficherSuiviCommande();
  });
}

function afficherRecapitulatif() {
  recapContenu.innerHTML = "";
  let totalHT = 0;
  const TVA = 0.20;

  for (const id in panier) {
    const item = panier[id];

    if (!item || typeof item.price === "undefined") continue;

    const ligne = document.createElement("div");
    ligne.innerHTML = `
  <p>
    <strong>${item.name}</strong> x ${item.quantity}<br>
    ${item.price.toFixed(2)} € / unité = <strong>${(item.price * item.quantity).toFixed(2)} €</strong>
  </p>
`;
    recapContenu.appendChild(ligne);
    totalHT += item.price * item.quantity;
  }

  const montantTVA = totalHT * TVA;
  const totalTTC = totalHT + montantTVA;

  recapPrix.innerHTML = `
    <strong>Prix HT :</strong> ${totalHT.toFixed(2)} €<br>
    <strong>TVA (20%) :</strong> ${montantTVA.toFixed(2)} €<br>
    <strong>Total TTC :</strong> ${totalTTC.toFixed(2)} €
  `;

  recapZone.style.display = "block";
}

function afficherSuiviCommande() {
  if (commandesEnCours.length >= 5) {
    afficherToaster("Trop de commandes en cours !", true);
    return;
  }

  const commandeId = Date.now();
  commandesEnCours.push(commandeId);

  const suivi = document.createElement("section");
  suivi.classList.add("suivi-commande");
  suivi.setAttribute("data-id", commandeId);

  const statut = document.createElement("p");
  statut.textContent = "🕒 Préparation en cours...";
  suivi.appendChild(statut);

  const btnAnnulerCommande = document.createElement("button");
  btnAnnulerCommande.textContent = "Annuler";
  btnAnnulerCommande.addEventListener("click", () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    suivi.remove();
    afficherToaster("Commande annulée !");
    const index = commandesEnCours.indexOf(commandeId);
    if (index > -1) commandesEnCours.splice(index, 1);
  });
  suivi.appendChild(btnAnnulerCommande);

  document.body.appendChild(suivi);

  const timer1 = setTimeout(() => {
    btnAnnulerCommande.remove();
    statut.textContent = "🛵 En livraison...";
  }, 3000);

  const timer2 = setTimeout(() => {
    statut.textContent = "✅ Commande livrée !";
    btnAnnulerCommande.remove();
    const index = commandesEnCours.indexOf(commandeId);
    if (index > -1) commandesEnCours.splice(index, 1);
  }, 6000);
}

function fakePostCommande() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("ok");
    }, 1500);
  });
}
