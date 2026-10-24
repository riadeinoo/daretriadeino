
document.addEventListener('DOMContentLoaded', () => {
  const liste = document.getElementById('participants-liste');
  const boutonAjouter = document.getElementById('ajouter-participant');
  const compteur = document.getElementById('participants-compteur');
  const erreur = document.getElementById('participants-erreur');

  const minimum = Number(liste.dataset.min);
  const maximum = Number(liste.dataset.max);

  
const nomCercle = document.getElementById('nom-cercle');
const erreurNom = document.getElementById('nom-cercle-erreur');

nomCercle.addEventListener('input', () => {
  const valeur = nomCercle.value.trim();
  const regex = /^[\p{L}0-9 -]+$/u;

  if (
    valeur.length < 3 ||
    valeur.length > 40 ||
    !regex.test(valeur)
  ) {
    erreurNom.textContent =
      'Entrez 3 à 40 caractères : lettres, chiffres, espaces ou tirets.';
    erreurNom.classList.remove('hidden');
    nomCercle.setAttribute('aria-invalid', 'true');
    nomCercle.setAttribute('aria-describedby', 'nom-cercle-erreur');
  } else {
    erreurNom.textContent = '';
    erreurNom.classList.add('hidden');
    nomCercle.removeAttribute('aria-invalid');
    nomCercle.removeAttribute('aria-describedby');
  }
});

const cotisation = document.getElementById('cotisation');
const erreurCotisation = document.getElementById('cotisation-erreur');

function verifierCotisation() {
  const montant = Number(cotisation.value);

  if (
    cotisation.value === '' ||
    !Number.isInteger(montant) ||
    montant < 100 ||
    montant > 50000
  ) {
    erreurCotisation.textContent =
      'La cotisation doit être un entier entre 100 et 50 000 MAD.';
    erreurCotisation.classList.remove('hidden');
    cotisation.setAttribute('aria-invalid', 'true');
    cotisation.setAttribute('aria-describedby', 'cotisation-erreur');
  } else {
    erreurCotisation.textContent = '';
    erreurCotisation.classList.add('hidden');
    cotisation.removeAttribute('aria-invalid');
    cotisation.removeAttribute('aria-describedby');
  }
}

cotisation.addEventListener('input', verifierCotisation);


const periodicite = document.getElementById('periodicite');
const erreurPeriodicite = document.getElementById('periodicite-erreur');

function verifierPeriodicite() {
  if (
    periodicite.value !== 'hebdomadaire' &&
    periodicite.value !== 'quinzaine' &&
    periodicite.value !== 'mensuelle'
  ) {
    erreurPeriodicite.textContent = 'Veuillez choisir une périodicité valide.';
    erreurPeriodicite.classList.remove('hidden');
    periodicite.setAttribute('aria-invalid', 'true');
    periodicite.setAttribute('aria-describedby', 'periodicite-erreur');
  } else {
    erreurPeriodicite.textContent = '';
    erreurPeriodicite.classList.add('hidden');
    periodicite.removeAttribute('aria-invalid');
    periodicite.removeAttribute('aria-describedby');
  }
}

periodicite.addEventListener('change', verifierPeriodicite);

const dateDebut = document.getElementById('date-debut');
const erreurDate = document.getElementById('date-debut-erreur');

function verifierDate() {
  const aujourdHui = new Date();
  const annee = aujourdHui.getFullYear();
  const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');
  const jour = String(aujourdHui.getDate()).padStart(2, '0');
  const dateMinimum = annee + '-' + mois + '-' + jour;

  if (dateDebut.value === '' || dateDebut.value < dateMinimum) {
    erreurDate.textContent = 'La date de début doit être aujourd’hui ou plus tard.';
    erreurDate.classList.remove('hidden');
    dateDebut.setAttribute('aria-invalid', 'true');
    dateDebut.setAttribute('aria-describedby', 'date-debut-erreur');
  } else {
    erreurDate.textContent = '';
    erreurDate.classList.add('hidden');
    dateDebut.removeAttribute('aria-invalid');
    dateDebut.removeAttribute('aria-describedby');
  }
}

dateDebut.addEventListener('input', verifierDate);

  function ajouterParticipant() {
    const nombre = liste.querySelectorAll('li').length;

    if (nombre >= maximum) {
      erreur.textContent = 'Maximum 20 participants atteint.';
      return;
    }

    const li = document.createElement('li');

    li.innerHTML = `
      <input type="text" placeholder="Nom du participant">

      <button type="button" data-action="retirer">
        Retirer
      </button>
    `;

    liste.appendChild(li);

    mettreAJourCompteur();
    erreur.textContent = '';
  }

  function mettreAJourCompteur() {
    const nombre = liste.querySelectorAll('li').length;

    compteur.textContent =
      nombre + (nombre === 1 ? ' participant' : ' participants');
  }

  boutonAjouter.addEventListener('click', ajouterParticipant);

});
