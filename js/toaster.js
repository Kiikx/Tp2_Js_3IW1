export function afficherToaster(message, erreur = false) {
  const toaster = document.getElementById("toaster");
  toaster.textContent = message;
  toaster.style.backgroundColor = erreur ? "#e53935" : "#4caf50";
  toaster.style.display = "block";
  setTimeout(() => toaster.style.display = "none", 3000);
}
