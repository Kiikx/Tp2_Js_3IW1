import { afficherToaster } from "./toaster.js";

let wallet = 0;

const soldeAffiche = document.getElementById("wallet-solde");
const rechargeInput = document.getElementById("recharge-montant");
const btnRecharger = document.getElementById("btn-recharger");

export function initialiserWallet() {
  const walletSauvegarde = localStorage.getItem("wallet");
  if (walletSauvegarde) {
    wallet = parseFloat(walletSauvegarde);
  }
  afficherSolde();

  btnRecharger.addEventListener("click", () => {
    const montant = parseFloat(rechargeInput.value);
    if (!isNaN(montant) && montant > 0) {
      wallet += montant;
      localStorage.setItem("wallet", wallet.toFixed(2));
      afficherSolde();
      rechargeInput.value = "";
      afficherToaster(`Wallet rechargé de ${montant.toFixed(2)} €`);
    } else {
      afficherToaster("Montant invalide", true);
    }
  });
}

export function debiterWallet(montant) {
  wallet -= montant;
  localStorage.setItem("wallet", wallet.toFixed(2));
  afficherSolde();
}

export function getSoldeWallet() {
  return wallet;
}

function afficherSolde() {
  soldeAffiche.textContent = wallet.toFixed(2) + " €";
}
