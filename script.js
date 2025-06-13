document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menu-items");
  const panierContainer = document.getElementById("panier-items");
  const totalDisplay = document.getElementById("total");

  let panier = {};

  const btnCommander = document.getElementById("btn-commander");
  const recapZone = document.getElementById("recap");
  const recapContenu = document.getElementById("recap-contenu");
  const recapPrix = document.getElementById("recap-prix");
  const btnValider = document.getElementById("btn-valider");
  const btnAnnuler = document.getElementById("btn-annuler");

  const commandesEnCours = [];

  const panierSauvegarde = localStorage.getItem("panier");

  const btnViderPanier = document.getElementById("btn-vider-panier");

  let wallet = 0;

  const soldeAffiche = document.getElementById("wallet-solde");
  const rechargeInput = document.getElementById("recharge-montant");
  const btnRecharger = document.getElementById("btn-recharger");

  const walletSauvegarde = localStorage.getItem("wallet");
  if (walletSauvegarde) {
    wallet = parseFloat(walletSauvegarde);
    afficherSolde();
  }

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


  function afficherSolde() {
    soldeAffiche.textContent = wallet.toFixed(2) + " €";
  }



  const optionsPlats = {
    "Pizza": [
      "Pâte fine",
      "Pâte épaisse",
      "Bordure fromage",
      "Extra mozzarella",
      "Sans olives",
      "Ajout champignons",
      "Ajout chorizo",
      "Végétarienne",
      "Sans gluten",
      "Allégée en sel"
    ],
    "Tacos": [
      "Sauce blanche",
      "Sauce harissa",
      "Sauce barbecue",
      "Sans sauce",
      "Double viande",
      "Poulet croustillant",
      "Bœuf haché",
      "Ajout frites",
      "Supplément fromage",
      "Galette grillée"
    ],
    "Salade": [
      "Vinaigrette balsamique",
      "Vinaigrette citron",
      "Sans vinaigrette",
      "Ajout œuf dur",
      "Ajout thon",
      "Ajout fromage de chèvre",
      "Sans gluten",
      "Végétalienne",
      "Ajout graines",
      "Allégée en calories"
    ],
    "Sushis": [
      "Avec sauce soja sucrée",
      "Avec sauce soja salée",
      "Sans wasabi",
      "Ajout gingembre",
      "Riz vinaigré",
      "Riz nature",
      "Sans algues",
      "Tempura en option",
      "Ajout avocat",
      "Mix saumon & thon"
    ],
    "Poulet vindaloo": [
      "Épicé doux",
      "Épicé moyen",
      "Très épicé",
      "Sans coriandre",
      "Ajout naan nature",
      "Ajout naan fromage",
      "Riz basmati",
      "Riz coco",
      "Avec raita",
      "Portion double"
    ],
    "Burger": [
      "Pain brioché",
      "Pain sésame",
      "Pain sans gluten",
      "Steak saignant",
      "Steak à point",
      "Steak bien cuit",
      "Extra cheddar",
      "Ajout bacon",
      "Sans cornichons",
      "Sauce maison"
    ]
  };




  if (panierSauvegarde) {
    panier = JSON.parse(panierSauvegarde);
    console.log("Panier chargé depuis le stockage local :", panier);

    afficherPanier();
  }

  async function chargerMenu() {
    try {
      const response = await fetch("https://keligmartin.github.io/api/menu.json");
      if (!response.ok) throw new Error("Erreur lors du chargement du menu");

      const plats = await response.json();

      plats.forEach(plat => {
        const item = document.createElement("div");
        item.classList.add("menu-item");

        let checkboxesHTML = "";
        if (optionsPlats[plat.name]) {
          checkboxesHTML = `<details class="options-dropdown"><summary>Options</summary><div class="options-plat">` +
            optionsPlats[plat.name].map((opt, index) => `
            <label>
              <input type="checkbox" class="option-checkbox" name="option-${plat.id}" value="${opt}">
              ${opt}
            </label>
          `).join("") +
            `</div></details>`;
        }



        item.innerHTML = `
          <img src="images/${plat.image}" alt="${plat.name}">
          <h3>${plat.name}</h3>
          <p>${plat.price.toFixed(2)} €</p>
          ${checkboxesHTML}
          <button data-id="${plat.id}" data-name="${plat.name}" data-price="${plat.price}">
            Ajouter
          </button>
        `;



        const button = item.querySelector("button");
        button.addEventListener("click", () => {
          const checkboxes = item.querySelectorAll(".option-checkbox");
          const selectedOptions = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

          ajouterAuPanier(plat, selectedOptions);
        });


        menuContainer.appendChild(item);
      });

    } catch (error) {
      console.error("Erreur : ", error);
      afficherToaster("Impossible de charger le menu", true);
    }
  }

  function sauvegarderPanier() {
    localStorage.setItem("panier", JSON.stringify(panier));
  }


  function ajouterAuPanier(plat, options = []) {
    const key = `${plat.id}-${options.sort().join("+")}`;
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



  btnCommander.addEventListener("click", () => {
    afficherRecapitulatif();
  });

  btnViderPanier.addEventListener("click", () => {
    panier = {};
    sauvegarderPanier();
    afficherPanier();
    afficherToaster("Panier vidé !");
  });

  btnAnnuler.addEventListener("click", () => {
    recapZone.style.display = "none";
  });

  function afficherRecapitulatif() {
    recapContenu.innerHTML = "";
    console.log("Contenu du panier :", panier);

    let totalHT = 0;
    const TVA = 0.20;

    for (const id in panier) {
      const item = panier[id];
      console.log("Traitement de l'article :", id, panier[id]);

      if (!item || typeof item.price === 'undefined') {
        console.warn("Objet invalide dans le panier :", item);
        continue;
      }

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

  function afficherPanier() {
    panierContainer.innerHTML = "";

    let total = 0;

    for (const id in panier) {
      const item = panier[id];

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("panier-item");

      // Ligne 1 : nom + quantité
      const nom = document.createElement("div");
      nom.classList.add("panier-nom");
      const optionsText = item.options && item.options.length
        ? ` (${item.options.join(", ")})`
        : "";

      nom.textContent = `${item.name}${optionsText} x ${item.quantity}`;

      // Ligne 2 : prix total
      const prix = document.createElement("div");
      prix.classList.add("panier-prix");
      prix.textContent = `${(item.price * item.quantity).toFixed(2)} €`;

      // Ligne 3 : boutons
      const boutons = document.createElement("div");
      boutons.classList.add("panier-boutons");

      const btnMoins = document.createElement("button");
      btnMoins.textContent = "➖";
      btnMoins.addEventListener("click", () => {
        diminuerQuantite(id);
      });

      const btnSupprimer = document.createElement("button");
      btnSupprimer.textContent = "❌";
      btnSupprimer.addEventListener("click", () => {
        supprimerItemDuPanier(id);
      });

      boutons.appendChild(btnMoins);
      boutons.appendChild(btnSupprimer);

      // Composition du bloc
      itemDiv.appendChild(nom);
      itemDiv.appendChild(prix);
      itemDiv.appendChild(boutons);

      panierContainer.appendChild(itemDiv);

      total += item.price * item.quantity;
    }

    totalDisplay.textContent = total.toFixed(2) + " €";

  }

  function supprimerItemDuPanier(id) {
    delete panier[id];
    sauvegarderPanier();
    afficherPanier();
  }

  function diminuerQuantite(id) {
    if (panier[id]) {
      panier[id].quantity -= 1;
      if (panier[id].quantity <= 0) {
        delete panier[id]; // supprime si quantité atteinte
      }
      sauvegarderPanier();
      afficherPanier();
    }
  }



  function afficherToaster(message, erreur = false) {
    const toaster = document.getElementById("toaster");
    toaster.textContent = message;
    toaster.style.backgroundColor = erreur ? "#e53935" : "#4caf50";
    toaster.style.display = "block";
    setTimeout(() => toaster.style.display = "none", 3000);
  }

  function fakePostCommande() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("Commande enregistrée !");
      }, 1000);
    });
  }

btnValider.addEventListener("click", async () => {
  recapZone.style.display = "none";

  // 🔢 Recalcul du total TTC AVANT l'appel à fakePostCommande()
  let totalHT = 0;
  for (const id in panier) {
    const item = panier[id];
    totalHT += item.price * item.quantity;
  }
  const montantTVA = totalHT * 0.20;
  const totalTTC = totalHT + montantTVA;

  if (wallet < totalTTC) {
    afficherToaster("Fonds insuffisants dans le wallet", true);
    return;
  }

  try {
    const confirmation = await fakePostCommande();
    afficherToaster(confirmation);
    afficherSuiviCommande();

    // 💰 Déduction du solde (IMPORTANT : doit être APRES vérif et avant reset)
    wallet -= totalTTC;
    localStorage.setItem("wallet", wallet.toFixed(2));
    afficherSolde();

    // 🧹 Réinitialiser le panier
    panier = {};
    sauvegarderPanier();
    afficherPanier();

  } catch (error) {
    afficherToaster("Erreur lors de la commande", true);
  }
});




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
      commandesEnCours.splice(commandesEnCours.indexOf(commandeId), 1);
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
      commandesEnCours.splice(commandesEnCours.indexOf(commandeId), 1);
    }, 6000);
  }


  chargerMenu();

});
