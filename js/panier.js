import { afficherToaster } from "./toaster.js";

export let panier = {};

const panierContainer = document.getElementById("panier-items");
const totalDisplay = document.getElementById("total");
const btnVider = document.getElementById("btn-vider-panier");

export function initialiserPanier() {
  const panierSauvegarde = localStorage.getItem("panier");
  if (panierSauvegarde) {
    panier = JSON.parse(panierSauvegarde);
  }

  if (btnVider) {
    btnVider.addEventListener("click", () => {
      console.log(Object.keys(panier).length);
      
      if (Object.keys(panier).length === 0) {
        console.log("Panier déjà vide");
        
        afficherToaster("Le panier est déjà vide", true);
      } else {
        panier = {};
        sauvegarderPanier();
        afficherPanier();
        afficherToaster("Panier vidé");
      }
    });
  }

  afficherPanier();
}

export function ajouterAuPanier(plat, options = []) {
  const key = plat.id + "-" + options.sort().join("+");
  if (panier[key]) {
    panier[key].quantity += 1;
  } else {
    panier[key] = {
      name: plat.name,
      price: plat.price,
      options: options,
      quantity: 1
    };
  }
  sauvegarderPanier();
  afficherPanier();
}

export function sauvegarderPanier() {
  localStorage.setItem("panier", JSON.stringify(panier));
}
export function viderPanier() {
  Object.keys(panier).forEach((key) => delete panier[key]);
  sauvegarderPanier();
  afficherPanier();
}


export function afficherPanier() {
  panierContainer.innerHTML = "";
  let total = 0;

  for (const id in panier) {
    const item = panier[id];
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("panier-item");

    const optionsText = item.options?.length ? ` (${item.options.join(", ")})` : "";

    const nom = document.createElement("div");
    nom.classList.add("panier-nom");
    nom.textContent = `${item.name}${optionsText} x ${item.quantity}`;

    const prix = document.createElement("div");
    prix.classList.add("panier-prix");
    prix.textContent = `${(item.price * item.quantity).toFixed(2)} €`;

    const boutons = document.createElement("div");
    boutons.classList.add("panier-boutons");

    const btnMoins = document.createElement("button");
    btnMoins.textContent = "➖";
    btnMoins.addEventListener("click", () => {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        delete panier[id];
      }
      sauvegarderPanier();
      afficherPanier();
    });

    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "❌";
    btnSupprimer.addEventListener("click", () => {
      delete panier[id];
      sauvegarderPanier();
      afficherPanier();
    });

    boutons.appendChild(btnMoins);
    boutons.appendChild(btnSupprimer);
    itemDiv.appendChild(nom);
    itemDiv.appendChild(prix);
    itemDiv.appendChild(boutons);
    panierContainer.appendChild(itemDiv);

    total += item.price * item.quantity;
  }

  totalDisplay.textContent = total.toFixed(2) + " €";


}
