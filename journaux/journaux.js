// journaux.js -- moteur de la page « Journaux de bord compares », commun aux sites French Place Names et
// Flinders Place Names (depot toponymes-commun). La page declare
// window.JOURNAUX_CONFIG (voir README.md) puis charge ce script, qui construit
// l'interface dans <div id="journaux-ui"></div>.
(() => {
    const CFG = window.JOURNAUX_CONFIG;
    const place = document.getElementById('journaux-ui');
    place.insertAdjacentHTML('beforebegin', `<main class="container">
    <section class="content-section">
        <h2><span data-t="titre">Journaux de bord comparés</span></h2>

        <div class="filtres">
            <div class="etape">
                <h3><span class="num">1</span><span data-t="etape1">Expéditions</span></h3>
                <div id="expeditions"></div>
            </div>
            <div class="etape">
                <h3><span class="num">2</span><span data-t="etape2">Période</span></h3>
                <div class="periode-grille">
                <div class="periode-dates">
                <div class="ligne-date">
                    <label data-t="du">Du</label>
                    <div class="champ-date"><span id="debut-txt">—</span>
                        <button type="button" class="cal-btn" data-borne="debut" aria-haspopup="dialog">
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.7" y="3" width="12.6" height="11.3" rx="1.6"/><path d="M1.7 6.4h12.6M5.2 1.7v2.6M10.8 1.7v2.6"/><rect x="4.2" y="8.6" width="2.2" height="2.2" rx="0.5" fill="currentColor" stroke="none"/></svg>
                        </button>
                    </div>
                </div>
                <div class="ligne-date">
                    <label data-t="au">Au</label>
                    <div class="champ-date"><span id="fin-txt">—</span>
                        <button type="button" class="cal-btn" data-borne="fin" aria-haspopup="dialog">
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.7" y="3" width="12.6" height="11.3" rx="1.6"/><path d="M1.7 6.4h12.6M5.2 1.7v2.6M10.8 1.7v2.6"/><rect x="4.2" y="8.6" width="2.2" height="2.2" rx="0.5" fill="currentColor" stroke="none"/></svg>
                        </button>
                    </div>
                    <div class="timeline-calendar" id="calendrier" hidden role="dialog">
                        <div class="cal-head">
                            <button type="button" class="cal-nav" id="cal-prev">&lsaquo;</button>
                            <select id="cal-mois"></select>
                            <select id="cal-annee" class="cal-annee"></select>
                            <button type="button" class="cal-nav" id="cal-next">&rsaquo;</button>
                        </div>
                        <div class="cal-dows" id="cal-dows"></div>
                        <div class="cal-grid" id="cal-grid"></div>
                    </div>
                </div>
                </div>
                <!-- Jour precedent / suivant, comme les boutons de point de la
                     carte ; actifs quand la periode tient en un seul jour. -->
                <div class="jour-boutons">
                    <button type="button" id="jour-prec" class="timeline-btn"><span class="timeline-icon-prev"></span></button>
                    <button type="button" id="jour-suiv" class="timeline-btn"><span class="timeline-icon-next"></span></button>
                </div>
                </div>
                <select class="remarquables-select" id="remarquables"></select>
            </div>
            <div class="etape">
                <div class="journaux-grille" id="journaux"></div>
            </div>
        </div>

        <div class="cadre" id="cadre"><div class="etat" data-t="attente">Chargement…</div></div>
    </section>
</main>`);
    place.remove();

    // ------------------------------------------------------------------
    //  Donnees : les memes fichiers que la carte (data/journaux/*.json).
    //  Deux champs qui se relaient dans le temps (volumes d'un meme journal,
    //  ou changement de navire) forment une seule colonne.
    // ------------------------------------------------------------------
    // Catalogue des expeditions connues des deux sites ; la configuration
    // du site choisit les siennes (JOURNAUX_CONFIG.expeditions).
    const EXPEDITIONS_CATALOGUE = [
        { cle: 'entre', couleur: '#238b45', debut: '1791-09-10', fin: '1793-10-20',
          nom: { fr: "d'Entrecasteaux", en: "d'Entrecasteaux" },
          fichiers: { fr: 'data/journaux/entrecasteaux_fr.json', en: 'data/journaux/entrecasteaux_en.json' } },
        { cle: 'baudin', couleur: '#0b63d1', debut: '1800-10-19', fin: '1803-08-07',
          nom: { fr: 'Baudin', en: 'Baudin' },
          fichiers: { fr: 'data/journaux/baudin_fr.json', en: 'data/journaux/baudin_en.json' } },
        { cle: 'flinders', couleur: '#c2255c', debut: '1801-07-18', fin: '1803-12-17',
          nom: { fr: 'Flinders', en: 'Flinders' },
          fichiers: { fr: 'data/journaux/flinders_fr.json', en: 'data/journaux/flinders_en.json' } }
    ];
    const EXPEDITIONS = CFG.expeditions.map((cle) => EXPEDITIONS_CATALOGUE.find((e) => e.cle === cle));
    // Les journaux des expeditions retenues par le site.
    const JOURNAUX = [
        { id: 'labillardiere', exp: 'entre', champs: ['journal_labillardiere'], forme: 'paras',
          nom: { fr: 'Labillardière', en: 'Labillardière' },
          sous: { fr: 'Relation du voyage', en: 'Account of the voyage' }, navire: 'la Recherche' },
        { id: 'baudin', exp: 'baudin', champs: ['journal_baudin', 'journal_baudin_autographe'],
          nom: { fr: 'Nicolas Baudin', en: 'Nicolas Baudin' },
          sous: { fr: 'Journal de mer', en: 'Sea journal' }, navire: 'le Géographe' },
        { id: 'hamelin', exp: 'baudin', champs: ['journal_hamelin', 'journal_hamelin_manuscrit'], forme: 'lignes',
          nom: { fr: 'Hamelin', en: 'Hamelin' },
          sous: { fr: 'Journal du commandant', en: "Commander's journal" }, navire: 'le Naturaliste' },
        { id: 'breton', exp: 'baudin', champs: ['journal_breton_geographe', 'journal_breton_naturaliste'],
          nom: { fr: 'Breton', en: 'Breton' },
          sous: { fr: 'Journal d’aspirant', en: "Midshipman's journal" }, navire: 'Géographe, puis Naturaliste' },
        { id: 'charles', exp: 'baudin', champs: ['journal_charles_baudin'], forme: 'paras',
          nom: { fr: 'Charles Baudin', en: 'Charles Baudin' },
          sous: { fr: 'Souvenirs de jeunesse', en: 'Memories of My Youth' }, navire: 'le Géographe' },
        { id: 'anon-nat', exp: 'baudin', champs: ['journal_anonyme'],
          nom: { fr: 'Anonyme', en: 'Anonymous' },
          sous: { fr: 'Journal du Naturaliste', en: 'Naturaliste logbook' }, navire: 'le Naturaliste' },
        { id: 'anon-geo', exp: 'baudin', champs: ['journal_geographe'],
          nom: { fr: 'Anonyme', en: 'Anonymous' },
          sous: { fr: 'Journal du Géographe', en: 'Géographe logbook' }, navire: 'le Géographe' },
        { id: 'flinders', exp: 'flinders', champs: ['journal_flinders'],
          nom: { fr: 'Flinders', en: 'Flinders' },
          sous: { fr: 'A Voyage to Terra Australis', en: 'A Voyage to Terra Australis' }, navire: "l'Investigator" },
        { id: 'flinders-nav', exp: 'flinders', champs: ['journal_flinders_navigation'], forme: 'lignes',
          nom: { fr: 'Flinders', en: 'Flinders' },
          sous: { fr: 'Journal de navigation', en: 'Logbook' }, navire: "l'Investigator" }
    ].filter((j) => CFG.expeditions.includes(j.exp));

    // Le navire de chaque champ, pour les cases Geographe / Naturaliste.
    const NAVIRES = ['le Géographe', 'le Naturaliste'];
    const CHAMP_NAVIRE = {
        journal_baudin: 'le Géographe', journal_baudin_autographe: 'le Géographe',
        journal_charles_baudin: 'le Géographe', journal_geographe: 'le Géographe',
        journal_breton_geographe: 'le Géographe',
        journal_hamelin: 'le Naturaliste', journal_hamelin_manuscrit: 'le Naturaliste',
        journal_anonyme: 'le Naturaliste', journal_breton_naturaliste: 'le Naturaliste'
    };
    // Un repere du Casuarina suit le Geographe, qu'il accompagne.
    const NAVIRE_REPERE = { 'le Casuarina': 'le Géographe' };

    const T = {
        fr: { titre: 'Journaux de bord comparés',
              etape1: 'Expéditions', etape2: 'Période', etape3: 'Journaux', du: 'Du', au: 'Au',
              tout: 'tout cocher', rien: 'tout décocher', attente: 'Chargement…',
              aucuneExp: 'Cochez au moins une expédition.', aucunJournal: 'Cochez au moins un journal.',
              aucunJour: 'Aucune entrée pour ces journaux sur la période.',
              jours: (n) => `${n} jour${n > 1 ? 's' : ''}`, date: 'Date', suite: 'Lire la suite', moins: 'Replier',
              choisir: 'Choisir une date', jourPrec: 'Jour précédent', jourSuiv: 'Jour suivant',
              unJour: 'Disponible quand la période tient en un seul jour', moisPrec: 'Mois précédent', moisSuiv: 'Mois suivant',
              remarquables: 'Choisir une date remarquable…',
              navires: { 'le Géographe': 'le Géographe', 'le Naturaliste': 'le Naturaliste' } },
        en: { titre: 'Ships’ journals compared',
              etape1: 'Expeditions', etape2: 'Period', etape3: 'Journals', du: 'From', au: 'To',
              tout: 'select all', rien: 'clear all', attente: 'Loading…',
              aucuneExp: 'Tick at least one expedition.', aucunJournal: 'Tick at least one journal.',
              aucunJour: 'No entries in these journals for this period.',
              jours: (n) => `${n} day${n === 1 ? '' : 's'}`, date: 'Date', suite: 'Read more', moins: 'Collapse',
              choisir: 'Choose a date', jourPrec: 'Previous day', jourSuiv: 'Next day',
              unJour: 'Available when the period is a single day', moisPrec: 'Previous month', moisSuiv: 'Next month',
              remarquables: 'Choose a notable date…',
              navires: { 'le Géographe': 'the Géographe', 'le Naturaliste': 'the Naturaliste' } }
    };
    const MOIS = {
        fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    const JOURS_COURTS = { fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] };

    // Etat de la page : l'exemple de depart vient de la configuration.
    const etat = {
        exps: new Set(CFG.depart.expeditions),
        debut: CFG.depart.date, fin: CFG.depart.date,
        navires: new Set(CFG.depart.navires || []),
        journaux: new Set(CFG.depart.journaux),
        deplies: new Set()
    };
    // Une periode peut venir de l'adresse : journaux.html?du=1801-09-05&au=1801-09-07
    const params = new URLSearchParams(location.search);
    const dateValide = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
    if (dateValide(params.get('du'))) etat.debut = params.get('du');
    if (dateValide(params.get('au'))) etat.fin = params.get('au');
    if (etat.fin < etat.debut) etat.fin = etat.debut;
    const donnees = {};      // `${exp}:${lang}` -> { date: { champ: texte } }
    let remarquables = [];

    const lang = () => (document.documentElement.lang || 'fr').startsWith('en') ? 'en' : 'fr';
    const t = (k) => T[lang()][k];
    const echappe = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
    const ms = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
    const dateLongue = (d) => {
        const j = +d.slice(8, 10);
        return lang() === 'fr'
            ? `${j === 1 ? '1er' : j} ${MOIS.fr[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`
            : `${j} ${MOIS.en[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
    };
    const jourSemaine = (d) => new Date(ms(d)).toLocaleDateString(lang() === 'fr' ? 'fr-FR' : 'en-AU', { weekday: 'long', timeZone: 'UTC' });

    const charge = (exp) => {
        const cle = `${exp.cle}:${lang()}`;
        if (!donnees[cle]) {
            donnees[cle] = fetch(exp.fichiers[lang()]).then((r) => r.json());
        }
        return donnees[cle];
    };

    // Bornes : du debut de la premiere expedition cochee a la fin de la derniere.
    const bornes = () => {
        const choisies = EXPEDITIONS.filter((e) => etat.exps.has(e.cle));
        if (!choisies.length) return null;
        return [choisies.map((e) => e.debut).sort()[0], choisies.map((e) => e.fin).sort().pop()];
    };

    // Une expedition qu'on coche arrive avec tous ses journaux coches : on
    // decoche ensuite ceux qu'on ne veut pas lire.
    const ajouteExpedition = (cle) => {
        if (etat.exps.has(cle)) return;
        etat.exps.add(cle);
        JOURNAUX.filter((j) => j.exp === cle).forEach((j) => etat.journaux.add(j.id));
    };

    // ------------------------------------------------------------------
    //  Etape 1 : expeditions
    // ------------------------------------------------------------------
    const rendExpeditions = () => {
        const box = document.getElementById('expeditions');
        box.innerHTML = EXPEDITIONS.map((e) => `
            <label class="choix"><input type="checkbox" value="${e.cle}" ${etat.exps.has(e.cle) ? 'checked' : ''}>
                <span class="pastille-exp" style="background:${e.couleur}"></span>${echappe(e.nom[lang()])}
                <span class="periode">${e.debut.slice(0, 4)}–${e.fin.slice(0, 4)}</span></label>`
            + (e.cle !== 'baudin' ? '' : NAVIRES.map((n) => `
            <label class="choix sous-choix${etat.exps.has('baudin') ? '' : ' eteint'}">
                <input type="checkbox" data-navire="${n}" ${etat.navires.has(n) ? 'checked' : ''}
                       ${etat.exps.has('baudin') ? '' : 'disabled'}>${echappe(t('navires')[n])}</label>`).join(''))).join('');
        // Cocher les deux navires, c'est lire les deux ; il en reste toujours un.
        box.querySelectorAll('input[data-navire]').forEach((c) => c.addEventListener('change', () => {
            const n = c.dataset.navire;
            if (c.checked) etat.navires.add(n);
            else if (etat.navires.size > 1) etat.navires.delete(n);
            else c.checked = true;
            majTout();
        }));
        box.querySelectorAll('input:not([data-navire])').forEach((c) => c.addEventListener('change', () => {
            c.checked ? ajouteExpedition(c.value) : etat.exps.delete(c.value);
            // La periode reste dans les bornes des expeditions retenues.
            const b = bornes();
            if (b) {
                if (etat.debut < b[0] || etat.debut > b[1]) etat.debut = b[0];
                if (etat.fin > b[1] || etat.fin < b[0]) etat.fin = b[1];
                if (etat.fin < etat.debut) etat.fin = etat.debut;
            }
            majTout();
        }));
    };

    // ------------------------------------------------------------------
    //  Etape 2 : periode, avec le calendrier de la carte
    // ------------------------------------------------------------------
    const cal = document.getElementById('calendrier');
    const calMois = document.getElementById('cal-mois');
    const calAnnee = document.getElementById('cal-annee');
    let calBorne = null, calA = null, calM = null;
    let joursAvecTexte = new Set();

    const EXP_REPERE = { B: 'baudin', F: 'flinders', E: 'entre' };
    const remarquablesRetenues = () => remarquables.filter((r) => {
        const exp = EXP_REPERE[r.expedition];
        if (!etat.exps.has(exp)) return false;
        if (exp !== 'baudin') return true;
        return etat.navires.has(NAVIRE_REPERE[r.navire] || r.navire);
    });

    // Jour precedent / suivant : on saute au jour voisin qui a un texte dans
    // l'un des journaux coches, comme le point voisin sur la carte.
    const jourVoisin = (sens) => {
        const b = bornes();
        if (!b || etat.debut !== etat.fin) return null;
        const jours = [...joursAvecTexte].filter((d) => d >= b[0] && d <= b[1]).sort();
        return sens > 0 ? jours.find((d) => d > etat.debut) || null
                        : jours.filter((d) => d < etat.debut).pop() || null;
    };
    const majJourBoutons = () => {
        [['jour-prec', -1, 'jourPrec'], ['jour-suiv', 1, 'jourSuiv']].forEach(([id, sens, cle]) => {
            const btn = document.getElementById(id);
            btn.disabled = !jourVoisin(sens);
            btn.title = etat.debut === etat.fin ? t(cle) : `${t(cle)} — ${t('unJour')}`;
            btn.setAttribute('aria-label', t(cle));
        });
    };
    [['jour-prec', -1], ['jour-suiv', 1]].forEach(([id, sens]) =>
        document.getElementById(id).addEventListener('click', () => {
            const d = jourVoisin(sens);
            if (d) { etat.debut = etat.fin = d; majTout(); }
        }));

    const rendPeriode = () => {
        document.getElementById('debut-txt').textContent = dateLongue(etat.debut);
        document.getElementById('fin-txt').textContent = dateLongue(etat.fin);
        document.querySelectorAll('.cal-btn').forEach((b) => { b.title = t('choisir'); });
        document.getElementById('cal-prev').title = t('moisPrec');
        document.getElementById('cal-next').title = t('moisSuiv');
        // Dates remarquables des expeditions et navires coches ; en choisir une
        // ramene la periode a ce seul jour.
        const sel = document.getElementById('remarquables');
        const liste = remarquablesRetenues();
        sel.innerHTML = `<option value="">${echappe(t('remarquables'))}</option>` + liste.map((r) =>
            `<option value="${r.date}">${r.date.slice(8, 10)}-${r.date.slice(5, 7)}-${r.date.slice(0, 4)}\u00a0 ${echappe(r.libelle[lang()] || r.libelle.fr)}</option>`).join('');
        sel.value = etat.debut === etat.fin && liste.some((r) => r.date === etat.debut) ? etat.debut : '';
        sel.onchange = () => { if (sel.value) { etat.debut = etat.fin = sel.value; majTout(); } };
    };

    const calRend = () => {
        const b = bornes();
        if (!b) return;
        const min = ms(b[0]), max = ms(b[1]);
        const l = lang();
        calAnnee.innerHTML = '';
        for (let a = +b[0].slice(0, 4); a <= +b[1].slice(0, 4); a += 1) calAnnee.add(new Option(a, a));
        calMois.innerHTML = '';
        MOIS[l].forEach((nom, i) => {
            const o = new Option(nom, i);
            o.disabled = Date.UTC(calA, i + 1, 0) < min || Date.UTC(calA, i, 1) > max;
            calMois.add(o);
        });
        calMois.value = calM; calAnnee.value = calA;
        document.getElementById('cal-dows').innerHTML = JOURS_COURTS[l].map((j) => `<div class="cal-dow">${j}</div>`).join('');
        const grille = document.getElementById('cal-grid');
        grille.innerHTML = '';
        const premier = Date.UTC(calA, calM, 1);
        const decalage = (new Date(premier).getUTCDay() + 6) % 7;
        for (let i = 0; i < decalage; i += 1) grille.insertAdjacentHTML('beforeend', '<button class="cal-jour is-vide" disabled></button>');
        const nb = new Date(Date.UTC(calA, calM + 1, 0)).getUTCDate();
        const choisi = etat[calBorne];
        for (let j = 1; j <= nb; j += 1) {
            const d = iso(Date.UTC(calA, calM, j));
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'cal-jour'; btn.textContent = j;
            // On ne peut pas finir avant le debut, ni commencer apres la fin.
            const horsBornes = ms(d) < min || ms(d) > max
                || (calBorne === 'fin' && d < etat.debut) || (calBorne === 'debut' && d > etat.fin);
            if (horsBornes) btn.disabled = true;
            else {
                if (joursAvecTexte.has(d)) btn.classList.add('a-releve');
                if (d === choisi) btn.classList.add('is-choisi');
                else if (d >= etat.debut && d <= etat.fin) btn.classList.add('dans-periode');
                btn.title = dateLongue(d);
                btn.addEventListener('click', () => { etat[calBorne] = d; cal.hidden = true; majTout(); });
            }
            grille.appendChild(btn);
        }
        document.getElementById('cal-prev').disabled = Date.UTC(calA, calM, 0) < min;
        document.getElementById('cal-next').disabled = Date.UTC(calA, calM + 1, 1) > max;
    };

    document.querySelectorAll('.cal-btn').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const borne = btn.dataset.borne;
        if (!cal.hidden && calBorne === borne) { cal.hidden = true; return; }
        calBorne = borne;
        const d = etat[borne];
        calA = +d.slice(0, 4); calM = +d.slice(5, 7) - 1;
        // Le calendrier se pose sous le champ qui l'a ouvert.
        btn.closest('.ligne-date').appendChild(cal);
        cal.hidden = false;
        calRend();
    }));
    document.getElementById('cal-prev').addEventListener('click', () => { calM -= 1; if (calM < 0) { calM = 11; calA -= 1; } calRend(); });
    document.getElementById('cal-next').addEventListener('click', () => { calM += 1; if (calM > 11) { calM = 0; calA += 1; } calRend(); });
    calMois.addEventListener('change', () => { calM = +calMois.value; calRend(); });
    calAnnee.addEventListener('change', () => { calA = +calAnnee.value; calRend(); });
    cal.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => { cal.hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cal.hidden = true; });

    // ------------------------------------------------------------------
    //  Etape 3 : journaux ayant du contenu pour ces expeditions
    // ------------------------------------------------------------------
    const champRetenu = (c) => !CHAMP_NAVIRE[c] || etat.navires.has(CHAMP_NAVIRE[c]);
    const texteDe = (jr, jour) => jr.champs.filter(champRetenu).map((c) => jour?.[c]).filter(Boolean).join('\n\n');
    const journalVisible = (jr) => etat.exps.has(jr.exp) && jr.champs.some(champRetenu);

    const rendJournaux = (sources) => {
        const box = document.getElementById('journaux');
        const exps = EXPEDITIONS.filter((e) => etat.exps.has(e.cle));
        const titre = `<h3><span class="num">3</span><span>${echappe(t('etape3'))}</span></h3>`;
        const bouton = `<button type="button" class="tout" id="tout"></button>`;
        if (!exps.length) {
            box.style.gridTemplateColumns = '1fr';
            box.innerHTML = `<div class="entete">${titre}</div><p class="aucun">${t('aucuneExp')}</p>`;
            return;
        }
        box.style.gridTemplateColumns = `repeat(${exps.length}, minmax(0, 1fr))`;
        // Premiere rangee : le titre de l'etape devant le nom de la premiere
        // expedition, puis le nom des autres, le bouton au bout.
        const entetes = exps.map((e, i) => `<div class="entete">${i === 0 ? titre : ''}
            <span class="groupe-titre" style="color:${e.couleur}">${echappe(e.nom[lang()])}</span>
            ${i === exps.length - 1 ? bouton : ''}</div>`).join('');
        box.innerHTML = entetes + exps.map((e) => {
            const items = JOURNAUX.filter((j) => j.exp === e.cle && journalVisible(j)).map((j) => {
                const data = sources[e.cle] || {};
                const n = Object.keys(data).filter((d) => d >= etat.debut && d <= etat.fin && texteDe(j, data[d])).length;
                return `<label class="choix${n ? '' : ' vide'}"><input type="checkbox" value="${j.id}"
                            ${etat.journaux.has(j.id) ? 'checked' : ''} ${n ? '' : 'disabled'}>
                        <span>${echappe(j.nom[lang()])} <span class="navire">— ${echappe(j.sous[lang()])}</span></span>
                        <span class="nb">${t('jours')(n)}</span></label>`;
            }).join('');
            return `<div class="groupe">${items}</div>`;
        }).join('');
        box.querySelectorAll('input').forEach((c) => c.addEventListener('change', () => {
            c.checked ? etat.journaux.add(c.value) : etat.journaux.delete(c.value);
            majTout();
        }));
        const actifs = [...box.querySelectorAll('input:not(:disabled)')];
        const tous = actifs.length && actifs.every((c) => c.checked);
        const bt = document.getElementById('tout');
        bt.textContent = tous ? t('rien') : t('tout');
        bt.onclick = () => { actifs.forEach((c) => (tous ? etat.journaux.delete(c.value) : etat.journaux.add(c.value))); majTout(); };
    };

    // ------------------------------------------------------------------
    //  Le tableau : une colonne de dates, une colonne par journal coche
    // ------------------------------------------------------------------
    const texteJournalHtml = (v) => echappe(v).replace(/⟦([^⟦⟧]*)⟧/g, '<del class="journal-rature">$1</del>');
    // Journal lu ligne a ligne (Hamelin) : meme traitement que la fiche
    // parcours de map.html. Un bloc de lignes a barres (« 1 | SSE | … ») devient
    // un tableau, dont la premiere ligne est l'en-tete si elle ne commence pas
    // par un chiffre.
    const estLigneTableau = (l) => (l.match(/\|/g) || []).length >= 2;
    const tableauJournalHtml = (lignes) => {
        const rangees = lignes.map((l) => l.split('|').map((c) => c.trim()));
        const largeur = Math.max(...rangees.map((r) => r.length));
        const entete = !/^\d/.test(rangees[0][0] || '') ? rangees.shift() : null;
        const cellules = (r, balise) => Array.from({ length: largeur },
            (_, i) => `<${balise}>${texteJournalHtml(r[i] || '')}</${balise}>`).join('');
        return `<div class="journal-tableau-cadre"><table class="journal-tableau">`
            + (entete ? `<thead><tr>${cellules(entete, 'th')}</tr></thead>` : '')
            + `<tbody>${rangees.map((r) => `<tr>${cellules(r, 'td')}</tr>`).join('')}</tbody>`
            + `</table></div>`;
    };
    const texteLignesHtml = (value) => {
        const blocs = [];
        String(value).split('\n').forEach((l) => {
            const tableau = estLigneTableau(l);
            const dernier = blocs[blocs.length - 1];
            if (dernier && dernier.tableau === tableau) dernier.lignes.push(l);
            else blocs.push({ tableau, lignes: [l] });
        });
        return blocs.map((b) => (b.tableau
            ? tableauJournalHtml(b.lignes)
            : `<div class="lignes">${texteJournalHtml(b.lignes.join('\n'))}</div>`)).join('');
    };

    const rendTexte = (jr, texte) => {
        if (jr.forme === 'lignes') return texteLignesHtml(texte);
        const s = texteJournalHtml(texte);
        if (jr.forme === 'paras') {
            return s.split(/\n{2,}/).map((p) => `<p class="journal-para">${p.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')}</p>`).join('');
        }
        return `<div class="${jr.forme === 'lignes' ? 'lignes' : ''}">${s.replace(/\n{2,}/g, '\n\n')}</div>`;
    };

    const rendTableau = (sources) => {
        const cadre = document.getElementById('cadre');
        const cols = JOURNAUX.filter((j) => journalVisible(j) && etat.journaux.has(j.id));
        const dates = new Set();
        cols.forEach((j) => Object.entries(sources[j.exp] || {}).forEach(([d, v]) => {
            if (d >= etat.debut && d <= etat.fin && texteDe(j, v)) dates.add(d);
        }));
        // Une colonne sans aucun texte sur la periode ne s'affiche pas.
        const pleines = cols.filter((j) => [...dates].some((d) => texteDe(j, sources[j.exp]?.[d])));
        const liste = [...dates].sort();
        if (!etat.exps.size) { cadre.innerHTML = `<div class="etat">${t('aucuneExp')}</div>`; return; }
        if (!pleines.length) { cadre.innerHTML = `<div class="etat">${t(cols.length ? 'aucunJour' : 'aucunJournal')}</div>`; return; }
        const couleur = (j) => EXPEDITIONS.find((e) => e.cle === j.exp).couleur;
        const tete = `<tr><th class="col-date">${t('date')}</th>${pleines.map((j) => `
            <th><span class="bande" style="background:${couleur(j)}"></span>
                <span class="auteur">${echappe(j.nom[lang()])}</span>
                <span class="sous">${echappe(j.sous[lang()])} · ${echappe(j.navire)}</span></th>`).join('')}</tr>`;
        const corps = liste.map((d) => {
            const rem = remarquablesRetenues().filter((r) => r.date === d);
            const cellules = pleines.map((j) => {
                const texte = texteDe(j, sources[j.exp]?.[d]);
                if (!texte) return '<td class="texte vide"></td>';
                const cle = `${j.id}:${d}`;
                // Un seul jour a l'ecran : tout se lit deplie, sans bouton.
                const long = etat.debut !== etat.fin && texte.length > 900;
                const ouvert = etat.deplies.has(cle);
                return `<td class="texte"><div class="${long && !ouvert ? 'replie' : ''}">${rendTexte(j, texte)}</div>`
                    + (long ? `<button type="button" class="deplie" data-cle="${cle}">${ouvert ? t('moins') : t('suite')}</button>` : '')
                    + '</td>';
            }).join('');
            return `<tr><td class="col-date"><div class="jour">${echappe(dateLongue(d))}</div>
                <div class="semaine">${echappe(jourSemaine(d))}</div>
                ${rem.map((r) => `<div class="remarquable">${echappe(r.libelle[lang()] || r.libelle.fr)}</div>`).join('')}</td>${cellules}</tr>`;
        }).join('');
        const defilement = cadre.scrollTop;
        cadre.innerHTML = `<table class="comparaison"><thead>${tete}</thead><tbody>${corps}</tbody></table>`;
        cadre.scrollTop = defilement;
        cadre.querySelectorAll('.deplie').forEach((b) => b.addEventListener('click', () => {
            const c = b.dataset.cle;
            etat.deplies.has(c) ? etat.deplies.delete(c) : etat.deplies.add(c);
            rendTableau(sources);
        }));
    };

    // ------------------------------------------------------------------
    const majTout = async () => {
        document.querySelectorAll('[data-t]').forEach((el) => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
        rendExpeditions();
        rendPeriode();
        const exps = EXPEDITIONS.filter((e) => etat.exps.has(e.cle));
        if (exps.some((e) => !donnees[`${e.cle}:${lang()}`])) {
            document.getElementById('cadre').innerHTML = `<div class="etat">${t('attente')}</div>`;
        }
        const sources = {};
        await Promise.all(exps.map(async (e) => { sources[e.cle] = await charge(e); }));
        // Pastilles du calendrier : jours ou l'un des journaux retenus a un texte.
        joursAvecTexte = new Set();
        JOURNAUX.filter((j) => journalVisible(j) && etat.journaux.has(j.id)).forEach((j) =>
            Object.entries(sources[j.exp] || {}).forEach(([d, v]) => { if (texteDe(j, v)) joursAvecTexte.add(d); }));
        rendJournaux(sources);
        rendTableau(sources);
        majJourBoutons();
        if (!cal.hidden) calRend();
    };

    fetch('data/dates_remarquables.json').then((r) => r.json()).then((d) => { remarquables = d || []; majTout(); });
    // Le site change de langue en reecrivant <html lang> : la page suit.
    new MutationObserver(() => majTout()).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
