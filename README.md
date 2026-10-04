# toponymes-commun

Code partagé par les sites [French Place Names](https://www.frenchplacenames.au/)
(dépôt `FrenchNamesAustralia`) et [Flinders Place Names](https://flindersplacenames.au/)
(dépôt `FlindersPlaceNames`). Chaque site l'inclut comme **sous-module git** dans
son dossier `commun/`.

## Contenu

- `carte/carte.js` : le moteur de la carte interactive (lieux, routes jour par jour,
  frise, calendrier, dates remarquables, cartes anciennes, fiches, journaux, mobile).
- `carte/carte.css` : ses styles.
- `journaux/` : la page « Journaux de bord comparés » (`JOURNAUX_CONFIG` : `expeditions`, `depart`).
- `visionneuse/` : la visionneuse des cartes anciennes (`VISIONNEUSE_CONFIG` : `site`, `carteParDefaut`).
- `assistant/` : l'assistant Q&R (`ASSISTANT_CONFIG` : `ici`, `sites`, `questions`). Chaque lieu et chaque
  journée s'ouvrent sur la carte du site qui les porte (Flinders → Flinders Place Names, Baudin et
  d'Entrecasteaux → French Place Names).
- `js/main.js` : navigation, changement de langue, pied de page, aperçus AVIF (toutes les pages).
- `js/resource-modals.js`, `css/resource-features.css` : fenêtres et mises en page des pages Ressources.
- `css/nav.css` : la barre de navigation.
- `lib/` : bibliothèques tierces (Leaflet, Esri Leaflet, PolylineDecorator, OpenSeadragon, Mirador).
- `video/` : le film « Naissance de l’Australie sur les cartes » (FR et EN).
- `js/traductions-communes.js` : les textes partagés (menus, carte, recherche, fiches, journaux,
  assistant…). Chaque page le charge **avant** le `js/translations.js` du site, qui complète ou
  remplace ces textes par les siens (`Object.assign(translations.fr, {…})`).
- `api/` : les fonctions Vercel communes — `responses-chat.js` (assistant), `contact.js` (formulaire,
  l'objet du courriel nomme le site d'origine), `instructions.js` (consignes du modèle, lues aussi par
  les scripts `rag/` du site French). Chaque site les réexporte depuis son `api/` :
  `export { default } from '../commun/api/responses-chat.js';`
- `scripts/` : à lancer depuis la racine du site (chaque outil traite les données du dossier courant et
  ignore les fichiers que ce site n'a pas) — `serveur_local.mjs` (`npm run dev`), `littoral.py`,
  `controle_littoral.py`, `contournements.py`, `renfloue.py` (routes et trait de côte), `traduit_journaux.py`,
  `generate_avif_previews.sh`, `encode_pngs_to_jpg_mozjpeg.sh`, et `Toponyms_update.gs`, le script Apps Script
  du classeur Toponymes : il publie l'onglet Source dans FrenchNamesAustralia et l'onglet Flinders dans
  FlindersPlaceNames, chacun avec une copie dans l'autre dépôt. Toute modification doit être recollée dans
  l'éditeur Apps Script du classeur.
- `docs/glossaire-nautique.en.md` : le relevé anglais des termes de Flinders, lu par le
  `scripts/glossaire_nautique.py` de chaque site.

Ordre de chargement d'une page : `commun/js/traductions-communes.js`, `js/translations.js`
(puis `js/translations-flinders.js` sur le site Flinders), `commun/js/main.js`, puis le moteur
de la page.

Rien de propre à un site ne doit figurer ici : ce qui diffère d'un site à l'autre
passe par la configuration `window.CARTE_CONFIG`, que chaque site déclare dans son
`js/carte-config.js`.

## Utilisation dans une page

```html
<link rel="stylesheet" href="commun/carte/carte.css">
…
<div id="map"></div>
<div id="carte-ui"></div>   <!-- le moteur y construit l'interface -->
<script src="js/translations.js"></script>
<script src="js/main.js"></script>
<script src="js/carte-config.js"></script>
<script src="commun/carte/carte.js"></script>
```

## La configuration (`window.CARTE_CONFIG`)

| Clé | Rôle |
|---|---|
| `expeditions` | Jeux de lieux affichés, choisis dans `EXPEDITIONS_CATALOGUE` (`baudin`, `entre`, `flinders`). Chaque entrée peut surcharger le catalogue : `label`, `filtre: (lieu) => booléen`, `masqueAuDepart: true`… |
| `parcours` | Routes affichées, choisies dans `PARCOURS_CATALOGUE`, avec les mêmes surcharges possibles. |
| `cartesSelecteur` | Cartes anciennes proposées dans le sélecteur du fond sur mobile : `{ nom, libelle }`. |
| `remarquables` | Lettre du fichier `data/dates_remarquables.json` → `{ couche, route }` (couche de traces et id de la case de route). |
| `panneauAria` | Libellé accessible du panneau des expéditions. |
| `lignes` | Lignes du panneau, dans l'ordre. Voir ci-dessous. |

Une ligne :

```js
{
    cle: 'flinders',                 // clé de l'expédition (lieux)
    classe: 'toggle-flinders', couleur: '#c2255c',
    nom: 'Investigator', nomI18n: 'map-layer-investigator',
    lieux: { id: 'toggle-flinders', coche: true, aria: '…', ariaI18n: '…' },
    route: { id: 'toggle-flinders-parcours', parcours: 'flinders', nomFrise: 'Investigator', aria: '…', ariaI18n: '…' },
    carte: { id: 'toggle-flinders-carte', nom: 'flinders', aria: '…', ariaI18n: '…' },
    navires: { bloc: 'ship-block-flinders', liste: 'ship-list-flinders', titre: 'Navires', titreI18n: 'map-ships-title' }
}
```

Une ligne `{ avenir: true, classe, couleur, nom, nomI18n }` reste visible, cases grisées.
Ajouter un jeu de données (par exemple les campagnes du *Norfolk*) se fait donc en deux
temps : l'entrée dans le catalogue ici, puis sa ligne dans la configuration du site.

## Modifier le moteur

1. Faire la modification dans le dossier `commun/` de l'un des deux sites (c'est un
   dépôt git à part entière), la tester sur ce site, puis :
   ```bash
   cd commun && git checkout main && git pull   # un sous-module est en « HEAD détachée »
   # … modifier, tester …
   git commit -am "…" && git push
   cd .. && git add commun && git commit -m "Met à jour le moteur commun" && git push
   ```
2. Dans l'autre site :
   ```bash
   git submodule update --remote commun
   git add commun && git commit -m "Met à jour le moteur commun" && git push
   ```

Le script `scripts/maj_commun.sh` de chaque site fait l'étape 2.

Vercel récupère les sous-modules publics à chaque déploiement.
