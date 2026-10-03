# toponymes-commun

Code partagé par les sites [French Place Names](https://www.frenchplacenames.au/)
(dépôt `FrenchNamesAustralia`) et [Flinders Place Names](https://flindersplacenames.au/)
(dépôt `FlindersPlaceNames`). Chaque site l'inclut comme **sous-module git** dans
son dossier `commun/`.

## Contenu

- `carte/carte.js` : le moteur de la carte interactive (lieux, routes jour par jour,
  frise, calendrier, dates remarquables, cartes anciennes, fiches, journaux, mobile).
- `carte/carte.css` : ses styles.

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
