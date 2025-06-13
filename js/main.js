import { chargerMenu } from "./menu.js";
import { initialiserPanier } from "./panier.js";
import { initialiserWallet } from "./wallet.js";
import { initialiserCommande } from "./commande.js";

document.addEventListener("DOMContentLoaded", () => {
  chargerMenu();
  initialiserPanier();
  initialiserWallet();
  initialiserCommande();
});
