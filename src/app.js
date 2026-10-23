document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('daret-form');
  const participantsListe = document.getElementById('participants-liste');
  const participantsErreur = document.getElementById('participants-erreur');
  const ajouterBtn = document.getElementById('ajouter-participant');
  const compteur = document.getElementById('participants-compteur');
  const reinitialiserBtn = document.getElementById('reinitialiser');
  const etatVide = document.getElementById('etat-vide');
  const contenuResultat = document.getElementById('contenu-resultat');
  const titreResultat = document.getElementById('titre-resultat');

  const resumeCagnotte = document.getElementById('resume-cagnotte');
  const resumeTotalCycle = document.getElementById('resume-total-cycle');
  const resumeNbTours = document.getElementById('resume-nb-tours');
  const resumeDates = document.getElementById('resume-dates');

  const MIN = parseInt(participantsListe.dataset.min, 10) || 2;
  const MAX = parseInt(participantsListe.dataset.max, 10) || 20;

  document.getElementById('participants-min').textContent = MIN;
  document.getElementById('participants-max').textContent = MAX;


const REGEX_NOM_CERCLE = /^[\p{L}\d -]{3,40}$/u;
const REGEX_PRENOM = /^[\p{L}'’-]{2,30}$/u;  
const PERIODICITES = ['hebdomadaire', 'quinzaine', 'mensuelle'];
const JOURS_PAR_PERIODE = { hebdomadaire: 7, quinzaine: 14 };
const NB_PARTICIPANTS_DEPART = 2;


function aujourdhui() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const jj = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${jj}`;
}


function dateDuTour(dateIso, periodicite, index) {
  const [annee, mois, jour] = dateIso.split('-').map(Number);

  if (periodicite === 'mensuelle') {
    const totalMois = (mois - 1) + index;
    const a = annee + Math.floor(totalMois / 12);
    const m = totalMois % 12;
    const dernierJour = new Date(a, m + 1, 0).getDate(); 
    return new Date(a, m, Math.min(jour, dernierJour)); 
  }

  const pas = JOURS_PAR_PERIODE[periodicite];
  return new Date(annee, mois - 1, jour + index * pas);
}

function formaterDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formaterMontant(n) {
  return `${n.toLocaleString('fr-FR')} MAD`;
}


function calculerCercle({ cotisation, nbParticipants, periodicite, dateDebut }) {
  const nbTours = nbParticipants;
  return {
    montantRecu: cotisation * nbParticipants,
    totalVerseParParticipant: cotisation * nbTours,
    nbTours,
    premierTour: dateDuTour(dateDebut, periodicite, 0),
    dernierTour: dateDuTour(dateDebut, periodicite, nbTours - 1)
  };
}

function validerNom(v) {
  v = v.trim();
  if (!v) return 'Le nom du cercle est obligatoire.';
  if (v.length < 3 || v.length > 40) return 'Le nom doit contenir entre 3 et 40 caractères.';
  if (!REGEX_NOM_CERCLE.test(v)) return 'Le nom ne peut contenir que des lettres, chiffres, espaces et tirets.';
  return '';
}

function validerCotisation(v) {
  v = v.trim();
  if (!v) return 'La cotisation est obligatoire.';
  if (!/^\d+$/.test(v)) return 'La cotisation doit être un nombre entier (sans virgule ni signe).';
  const n = Number(v);
  if (n < 100 || n > 50000) return 'La cotisation doit être comprise entre 100 et 50 000 MAD.';
  return '';
}

function validerPeriodicite(v) {
  return PERIODICITES.includes(v) ? '' : 'Choisissez une périodicité dans la liste.';
}

function validerDate(v) {
  if (!v) return 'La date de début est obligatoire.';
  if (v < aujourdhui()) return "La date de début doit être aujourd'hui ou plus tard.";
  return '';
}

function validerPrenoms(valeurs, min) {
  const propres = valeurs.map(v => v.trim());
  const remplis = propres.map((v, i) => ({ v, i })).filter(x => x.v !== '');


  for (const { v, i } of remplis) {
    if (!REGEX_PRENOM.test(v)) {
      return {
        message: `« ${v} » n'est pas un prénom valide : 2 à 30 lettres (accents, apostrophe et tiret autorisés).`,
        indices: [i]
      };
    }
  }

  
  const vus = new Set();
  for (const { v, i } of remplis) {
    const cle = v.toLocaleLowerCase('fr');
    if (vus.has(cle)) {
      return { message: `« ${v} » apparaît plusieurs fois : chaque prénom doit être unique.`, indices: [i] };
    }
    vus.add(cle);
  }


  if (remplis.length < min) {
    return {
      message: `Saisissez au moins ${min} prénoms (${remplis.length} renseigné${remplis.length > 1 ? 's' : ''}).`,
      indices: propres.map((v, i) => (v === '' ? i : -1)).filter(i => i >= 0)
    };
  }

  return { message: '', indices: [] };
}

  const CHAMPS = [
    { id: 'nom-cercle', erreurId: 'nom-cercle-erreur', valider: validerNom },
    { id: 'cotisation', erreurId: 'cotisation-erreur', valider: validerCotisation },
    { id: 'periodicite', erreurId: 'periodicite-erreur', valider: validerPeriodicite },
    { id: 'date-debut', erreurId: 'date-debut-erreur', valider: validerDate }
  ].map(c => ({ ...c, el: document.getElementById(c.id) }));

 
  CHAMPS[3].el.min = aujourdhui();

  function afficherErreurChamp(champs, erreurId, message) {
    const liste = Array.isArray(champs) ? champs : [champs];
    const el = document.getElementById(erreurId);
    el.textContent = message;
    el.classList.remove('hidden');
    liste.forEach(c => {
      c.setAttribute('aria-invalid', 'true');
      c.setAttribute('aria-describedby', erreurId);
    });
  }

  function effacerErreurChamp(champs, erreurId) {
    const liste = Array.isArray(champs) ? champs : [champs];
    const el = document.getElementById(erreurId);
    el.textContent = '';
    el.classList.add('hidden');
    liste.forEach(c => {
      c.removeAttribute('aria-invalid');
      c.removeAttribute('aria-describedby');
    });
  }

  function effacerToutesLesErreurs() {
    CHAMPS.forEach(({ el, erreurId }) => effacerErreurChamp(el, erreurId));
    effacerErreurChamp(lireInputs(), 'participants-erreur');
  }

  const lireInputs = () => Array.from(participantsListe.querySelectorAll('.participant-input'));

  function creerLigne() {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-2';

    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = 'Prénom du participant';
    input.className =
      'participant-input w-full rounded border border-daret-bordure px-3 py-2 focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert';

    const retirer = document.createElement('button');
    retirer.type = 'button';
    retirer.dataset.action = 'retirer';
    retirer.textContent = 'Retirer';
    retirer.className =
      'rounded border border-daret-erreur px-3 py-2 text-daret-erreur hover:bg-daret-erreur/10 focus:outline-2 focus:outline-offset-2 focus:outline-daret-vert disabled:cursor-not-allowed disabled:opacity-50';

    li.append(input, retirer);
    return li;
  }

  function mettreAJourCompteur() {
    const inputs = lireInputs();
    const n = inputs.length;

    compteur.textContent = `${n} participant${n > 1 ? 's' : ''}`;
    ajouterBtn.disabled = n >= MAX;

    inputs.forEach((input, i) => {
      input.setAttribute('aria-label', `Prénom du participant ${i + 1}`);
      const btn = input.closest('li').querySelector('[data-action="retirer"]');
      btn.disabled = n <= MIN;
      btn.setAttribute('aria-label', `Retirer le participant ${i + 1}`);
    });
  }

  function initialiserParticipants() {
    participantsListe.innerHTML = '';
    for (let i = 0; i < NB_PARTICIPANTS_DEPART; i++) {
      participantsListe.appendChild(creerLigne());
    }
    mettreAJourCompteur();
  }

  ajouterBtn.addEventListener('click', () => {
    if (lireInputs().length >= MAX) return;
    const li = creerLigne();
    participantsListe.appendChild(li);
    mettreAJourCompteur();
    revaliderParticipants();
    li.querySelector('input').focus();
  });


  participantsListe.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="retirer"]');
    if (!btn || lireInputs().length <= MIN) return;

    const li = btn.closest('li');
    const voisin = li.nextElementSibling || li.previousElementSibling;
    li.remove();
    mettreAJourCompteur();
    revaliderParticipants();
    if (voisin) voisin.querySelector('input').focus();
  });

  function validerParticipantsDom() {
    const inputs = lireInputs();
    effacerErreurChamp(inputs, 'participants-erreur');

    const { message, indices } = validerPrenoms(inputs.map(i => i.value), MIN);
    if (!message) return null;

    const invalides = indices.map(i => inputs[i]);
    afficherErreurChamp(invalides, 'participants-erreur', message);
    return invalides[0];
  }

  function revaliderParticipants() {
    if (participantsErreur.classList.contains('hidden')) return;
    validerParticipantsDom();
  }

  participantsListe.addEventListener('input', revaliderParticipants);


  function validerFormulaire() {
    let premier = null;

    CHAMPS.forEach(({ el, erreurId, valider }) => {
      const message = valider(el.value);
      if (message) {
        afficherErreurChamp(el, erreurId, message);
        if (!premier) premier = el;
      } else {
        effacerErreurChamp(el, erreurId);
      }
    });

    const premierParticipant = validerParticipantsDom();
    if (!premier) premier = premierParticipant;

    return premier;
  }

  CHAMPS.forEach(({ el, erreurId, valider }) => {
    const revalider = () => {
      if (el.getAttribute('aria-invalid') !== 'true') return;
      const message = valider(el.value);
      if (message) afficherErreurChamp(el, erreurId, message);
      else effacerErreurChamp(el, erreurId);
    };
    el.addEventListener('input', revalider);
    el.addEventListener('change', revalider);
  });

  function afficherResume(r) {
    resumeCagnotte.textContent = formaterMontant(r.montantRecu);
    resumeTotalCycle.textContent = formaterMontant(r.totalVerseParParticipant);
    resumeNbTours.textContent = r.nbTours;
    resumeDates.textContent = `${formaterDate(r.premierTour)} · ${formaterDate(r.dernierTour)}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const premierInvalide = validerFormulaire();
    if (premierInvalide) {
      premierInvalide.focus();
      return;
    }

    const prenoms = lireInputs().map(i => i.value.trim()).filter(v => v !== '');

    const resultat = calculerCercle({
      cotisation: Number(document.getElementById('cotisation').value),
      nbParticipants: prenoms.length,
      periodicite: document.getElementById('periodicite').value,
      dateDebut: document.getElementById('date-debut').value
    });

    afficherResume(resultat);

    etatVide.classList.add('hidden');
    contenuResultat.classList.remove('hidden');
    titreResultat.focus();
  });

  reinitialiserBtn.addEventListener('click', () => {
    form.reset();
    effacerToutesLesErreurs();
    initialiserParticipants();
    contenuResultat.classList.add('hidden');
    etatVide.classList.remove('hidden');
    document.getElementById('nom-cercle').focus();
  });

  initialiserParticipants();
});