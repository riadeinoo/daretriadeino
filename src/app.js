document.addEventListener('DOMContentLoaded', () => {
  const liste = document.getElementById('participants-liste');
  const boutonAjouter = document.getElementById('ajouter-participant');
  const compteur = document.getElementById('participants-compteur');
  const erreur = document.getElementById('participants-erreur');

  const minimum = Number(liste.dataset.min);
  const maximum = Number(liste.dataset.max);

  
const nomCercle = document.getElementById('nom-cercle');
const erreurNom = document.getElementById('nom-cercle-erreur');


function verifierNom() {
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
} 

nomCercle.addEventListener('input', verifierNom); 

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
      erreur.textContent = 'Maximum ' + maximum + ' participants atteint.';
      erreur.classList.remove('hidden');
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
    erreur.classList.add('hidden');
  }

  liste.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-action="retirer"]');
    if (!bouton) return;

    bouton.closest('li').remove();
    mettreAJourCompteur();
    erreur.textContent = '';
    erreur.classList.add('hidden');
  });

  function mettreAJourCompteur() {
    const nombre = liste.querySelectorAll('li').length;

    compteur.textContent =
      nombre + (nombre === 1 ? ' participant' : ' participants');
  }

  boutonAjouter.addEventListener('click', ajouterParticipant);

  function calculerMontantRecu(cotisation, nombreParticipants) {
    return cotisation * nombreParticipants;
  }

  function calculerTotalCycle(cotisation, nombreTours) {
    return cotisation * nombreTours;
  }

  function calculerNombreTours(nombreParticipants) {
    return nombreParticipants;
  }

  function calculerDateTour(dateDebut, periodicite, numeroTour) {
    const date = new Date(dateDebut + 'T12:00:00');

    if (periodicite === 'hebdomadaire') {
      date.setDate(date.getDate() + (numeroTour - 1) * 7);
    } else if (periodicite === 'quinzaine') {
      date.setDate(date.getDate() + (numeroTour - 1) * 14); 
    } else if (periodicite === 'mensuelle') {
      const jour = date.getDate();

      date.setDate(1);
      date.setMonth(date.getMonth() + numeroTour - 1);

      const dernierJour = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();

      date.setDate(Math.min(jour, dernierJour));
    }

    return date;
  }

  function formaterDate(date) {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function construireTableau(nombreTours, montantRecu) {
    const corps = document.getElementById('calendrier-corps');
    corps.replaceChildren(); 

    const noms = [...liste.querySelectorAll('input')].map(i => i.value.trim());

    for (let n = 1; n <= nombreTours; n++) {
      const date = calculerDateTour(dateDebut.value, periodicite.value, n);
      const valeurs = [
        n,
        formaterDate(date),
        noms[n - 1] || 'Participant ' + n,
        montantRecu + ' MAD',
        'À venir'
      ];

      const tr = corps.insertRow();
      tr.dataset.tour = n;
      valeurs.forEach(v => {
        const td = tr.insertCell();
        td.className = 'px-4 py-3';
        td.textContent = v; 
      });
      tr.insertCell().className = 'px-4 py-3'; 
    }
  }

function verifierNomsParticipants() {
  const regex = /^[\p{L}'’-]{2,30}$/u;
  const dejaVus = [];
  let message = '';

  liste.querySelectorAll('input').forEach(champ => {
    const valeur = champ.value.trim();
    const cle = valeur.toLowerCase();
    let invalide = false;

    if (!regex.test(valeur)) {
      message = 'Chaque prénom doit contenir 2 à 30 lettres (accents, apostrophe et tiret autorisés).';
      invalide = true;
    } else if (dejaVus.includes(cle)) {
      message = 'Deux participants ne peuvent pas avoir le même prénom.';
      invalide = true;
    }
    dejaVus.push(cle);

    if (invalide) {
      champ.setAttribute('aria-invalid', 'true');
      champ.setAttribute('aria-describedby', 'participants-erreur');
    } else {
      champ.removeAttribute('aria-invalid');
      champ.removeAttribute('aria-describedby');
    }
  });

  erreur.textContent = message;
  erreur.classList.toggle('hidden', message === '');
}

liste.addEventListener('input', () => {
  if (!erreur.classList.contains('hidden')) verifierNomsParticipants();
});

  function afficherResume() { 


    verifierNom();
    verifierCotisation();
    verifierPeriodicite();
    verifierDate();

    const assezDeParticipants = liste.querySelectorAll('li').length >= minimum;
    if (assezDeParticipants) {
      verifierNomsParticipants();
    } else {
      erreur.textContent = 'Minimum ' + minimum + ' participants requis.';
      erreur.classList.remove('hidden');
    }

    const premierInvalide = document.querySelector('[aria-invalid="true"]');
    if (premierInvalide) {
      premierInvalide.focus();
      return;
    }
    if (!assezDeParticipants) {
      boutonAjouter.focus();
      return;
    }

    const nombreParticipants = liste.querySelectorAll('li').length;
    const montant = Number(cotisation.value);
    const nombreTours = calculerNombreTours(nombreParticipants);

    const montantRecu = calculerMontantRecu(montant, nombreParticipants);
    const totalCycle = calculerTotalCycle(montant, nombreTours);

    const premierTour = calculerDateTour(
      dateDebut.value, periodicite.value, 1
    );

    const dernierTour = calculerDateTour(
      dateDebut.value, periodicite.value, nombreTours
    );

    document.getElementById('resume-cagnotte').textContent =
      montantRecu + ' MAD';

    document.getElementById('resume-total-cycle').textContent =
      totalCycle + ' MAD';

    document.getElementById('resume-nb-tours').textContent =
      nombreTours;

    document.getElementById('resume-dates').textContent =
      formaterDate(premierTour) + ' – ' + formaterDate(dernierTour);

    construireTableau(nombreTours, montantRecu); 

    document.getElementById('etat-vide').classList.add('hidden');
    document.getElementById('contenu-resultat').classList.remove('hidden');
  }

  document.getElementById('daret-form').addEventListener('submit', (e) => {
    e.preventDefault();
    afficherResume();
  });

  document.getElementById('reinitialiser').addEventListener('click', () => {
    document.getElementById('daret-form').reset();

    document.querySelectorAll('[aria-invalid]').forEach(champ => {
      champ.removeAttribute('aria-invalid');
      champ.removeAttribute('aria-describedby');
    });
    [erreurNom, erreurCotisation, erreurPeriodicite, erreurDate, erreur].forEach(zone => {
      zone.textContent = '';
      zone.classList.add('hidden');
    });

    liste.replaceChildren();
    for (let i = 0; i < minimum; i++) ajouterParticipant();

    document.getElementById('calendrier-corps').replaceChildren();
    document.getElementById('contenu-resultat').classList.add('hidden');
    document.getElementById('etat-vide').classList.remove('hidden');
  });

  for (let i = 0; i < minimum; i++) ajouterParticipant();
  mettreAJourCompteur();

});