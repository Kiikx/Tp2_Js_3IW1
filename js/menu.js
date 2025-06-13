import { ajouterAuPanier } from "./panier.js";
import { optionsPlats } from "./options.js";

export function chargerMenu() {
  fetch("https://keligmartin.github.io/api/menu.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur réseau : " + response.status);
      }
      return response.json();
    })
    .then(plats => {
      const menuContainer = document.getElementById("menu-items");
      plats.forEach(plat => {
        const item = document.createElement("div");
        item.classList.add("menu-item");

        let checkboxesHTML = "";
        if (optionsPlats[plat.name]) {
          checkboxesHTML = `<details class="options-dropdown"><summary>Options</summary><div class="options-plat">` +
            optionsPlats[plat.name].map(opt => `
              <label>
                <input type="checkbox" class="option-checkbox" value="${opt}">
                ${opt}
              </label>
            `).join("") + `</div></details>`;
        }

        item.innerHTML = `
          <img src="images/${plat.image}" alt="${plat.name}">
          <h3>${plat.name}</h3>
          <p>${plat.price.toFixed(2)} €</p>
          ${checkboxesHTML}
          <button>Ajouter</button>
        `;

        item.querySelector("button").addEventListener("click", () => {
          const options = Array.from(item.querySelectorAll(".option-checkbox"))
            .filter(cb => cb.checked)
            .map(cb => cb.value);
          ajouterAuPanier(plat, options);
        });

        menuContainer.appendChild(item);
      });
    })
    .catch(error => {
      console.error("Erreur lors de la requête :", error);
    });
}
