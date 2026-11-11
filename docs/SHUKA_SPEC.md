---
tags:
  - projets
  - code
aliases:
  - Furasshukado
  - Shuka
statut: "Référence de développement — version clarifiée"
source: "Shuka(2).md"
---

# Shuka — Cahier des charges fonctionnel

> **Objectif principal** : permettre de **créer** et de **réviser** des flashcards aussi vite et facilement que possible, dans une interface **sobre, neutre et minimaliste**, inspirée de l'efficacité d'Anki.
>
> **Nom de l'application** : Shuka (anciennement Furasshukado). Le renommage du dépôt GitHub n'est pas requis par ce document.

## 1. Principes transversaux

- Chaque fonction essentielle doit être **réellement opérationnelle**, pas seulement illustrée par une maquette.
- La navigation, l'ajout de cartes et la révision doivent demander peu d'actions et être utilisables au clavier.
- Les données de l'application restent persistantes sur l'appareil. Les évolutions du schéma de stockage **ne doivent pas effacer** les decks et cartes existants.
- Le tableau de bord est le premier écran affiché à l'ouverture de l'application.

## 2. Navigation générale

### 2.1. Écrans demandés

1. **Dashboard** — synthèse des révisions.
2. **Decks** — bibliothèque des decks et de leurs cartes.
3. **Fiches** — notes ou notions détaillées, associées ou non à un deck.
4. **Schéma** — notions regroupées hiérarchiquement par deck.
5. **Graphe** — visualisation des liens entre **toutes** les flashcards, les fiches et leurs decks.
6. **Lacunes** — difficultés identifiées à partir des résultats de révision.

La **révision** doit être immédiatement accessible depuis le Dashboard et depuis chaque deck. Les **paramètres**, sauvegardes et imports déjà existants restent accessibles ; ils ne remplacent aucun écran demandé.

### 2.2. Recherche globale façon Spotlight

- Une barre de recherche est accessible depuis les écrans principaux, avec le raccourci **Ctrl/Cmd + K**.
- Elle permet de retrouver rapidement un deck, une flashcard, une fiche, ou une action fréquente.
- Les résultats s'ouvrent au clic ou au clavier (**↑**, **↓**, **Entrée**, **Échap**).
- Les tags participent aux résultats de recherche.

### 2.3. Historique de navigation

- Une barre en haut de l'application présente **les trois emplacements précédemment visités au maximum** (menus ou decks), en plus de l'emplacement actuel si celui-ci est affiché ailleurs.
- Un clic revient directement à l'emplacement correspondant.
- Éviter les doublons consécutifs. L'historique peut rester limité à la session tant qu'aucune persistance n'est demandée.

## 3. Dashboard

Le Dashboard doit afficher :

- **Calendrier d'activité** mettant en évidence les jours où au moins une carte a été révisée, à partir du véritable historique des révisions.
- **Prochain deck à réviser**, avec son nom et sa **date/heure de prochaine échéance** ; si des cartes sont déjà dues, afficher « À réviser maintenant ».
- **Bouton « Réviser »** déclenchant une vraie session de révision.

En l'absence de deck ou de cartes dues, afficher un état vide clair, sans inventer de données.

## 4. Révision des flashcards

### 4.1. Disposition de l'écran

1. **Barre au-dessus de la carte** : nom du **deck** et **type de flashcard** sur une même ligne.
2. **Flashcard au centre** : question puis réponse ; un clic sur la carte la retourne.
3. **Boutons d'évaluation** : quatre choix de difficulté, correspondant à FSRS.
4. **Barre sous la carte et sous les boutons** : compteurs de la session courante pour **« Pas bien apprises »**, **« À réviser »**, **« Nouvelles »** ; les trois chiffres sont regroupés dans une même barre et calculés à partir des données réelles du périmètre choisi (deck ou ensemble de decks).

### 4.2. Raccourcis clavier

- **Espace** : afficher/masquer la réponse, sans faire défiler la page.
- **1** : À revoir (*Again*) ; **2** : Difficile (*Hard*) ; **3** : Bien (*Good*) ; **4** : Facile (*Easy*).
- Les touches **1–4** ne notent pas une carte tant que la réponse n'est pas affichée.
- Ces raccourcis sont désactivés pendant la saisie dans un champ de formulaire et pendant l'ouverture d'une fenêtre modale.

### 4.3. Déroulement

- Réviser un deck précis ou toutes les cartes dues.
- Avancer à la carte suivante uniquement **après** enregistrement effectif de l'évaluation.
- Afficher un état de fin de session ; éviter les doubles évaluations dues à des clics/touches rapides.

## 5. Modèle des flashcards

Chaque flashcard doit posséder :

- Un **identifiant technique unique stable**, et un **numéro d'affichage unique**.
- Un recto et un verso éditables.
- Zéro ou plusieurs **tags**.
- Un **type de carte** : recto → verso, verso → recto, deux sens, traduction (minimum demandé).
- Une **association facultative à une fiche**, et si nécessaire un **extrait précis de cette fiche**.
- Son deck parent et un état de planification de révision.

**Règles de fonctionnement** :

- Les cartes « deux sens » doivent pouvoir être révisées dans les deux orientations. **Idéalement, leurs deux orientations disposent d'un suivi FSRS séparé**, pour éviter qu'une bonne réponse dans un sens valide automatiquement l'autre.
- Le mode « traduction » utilise pour l'instant recto/verso et l'auto-évaluation, sauf cahier des charges ultérieur précisant une correction automatique.
- Les numéros ne changent pas lors de l'édition et ne sont pas réattribués à une autre carte après suppression.

## 6. Modèle des decks

Chaque deck doit posséder :

- Un **identifiant technique stable** et un **numéro unique d'affichage**.
- Un nom, des **tags**, sa collection de cartes.
- Zéro ou plusieurs **fiches associées**.
- Une prochaine échéance calculée sur les cartes qu'il contient.

La création, l'édition et la suppression des decks et des cartes doivent rester utilisables et rapides.

## 7. Fiches, Schéma et Graphe

### 7.1. Fiches

- Créer, modifier, lire et supprimer une fiche contenant une notion ou des notes.
- Associer une fiche à un deck, ou la laisser indépendante.
- Associer une carte à une fiche précise et, en option, à un passage de son contenu.
- La suppression d'une fiche ne doit pas supprimer les cartes : elle retire seulement les associations.

### 7.2. Schéma

- Présenter les notions **groupées par deck**, sous forme de structure hiérarchique lisible.
- Montrer les fiches associées et les cartes qui s'y rattachent.
- Permettre de retrouver/ouvrir rapidement le deck concerné.

### 7.3. Graphe

- Représenter les liens **deck ↔ fiche ↔ flashcard**.
- Toutes les données doivent être **accessibles**, y compris dans les grandes bibliothèques (filtrage, zoom, déplacement, développement progressif ou pagination autorisés).
- Un graphe limité arbitrairement aux seuls premiers decks/cartes **ne satisfait pas** le besoin.
- Un clic sur un élément doit permettre d'atteindre son contenu.

## 8. Lacunes

- Identifier les cartes difficiles à partir des **véritables évaluations de révision** (par exemple les réponses « À revoir » et « Difficile »).
- Afficher les cartes à renforcer, leur deck et un indicateur de difficulté.
- Permettre de naviguer vers le deck ou la carte pour retravailler la notion.
- Un historique vide doit produire un écran vide explicatif, et non des statistiques fictives.

## 9. Planification des révisions : FSRS

- Utiliser **FSRS — Free Spaced Repetition Scheduler** pour calculer les prochaines échéances.
- Les quatre évaluations alimentent réellement FSRS et son état doit être conservé localement.
- Une carte jamais révisée doit être considérée comme nouvelle.
- Les états de révision existants doivent être **migrés de façon sûre**, sans supprimer l'historique ni les cartes.
- Un changement de planification doit se refléter dans le Dashboard, les compteurs et les prochaines sessions.

## 10. Conservation des fonctionnalités existantes

- **IndexedDB** pour la persistance locale, avec migrations de schéma non destructives.
- Export/import des sauvegardes JSON, incluant les nouvelles fiches, associations et états FSRS ; prise en charge des anciennes sauvegardes.
- Import Anki `.colpkg` / `.apkg`, import/export CSV, Markdown et LaTeX, thème sombre par défaut et mémorisation du thème.
- Pas de synchronisation serveur obligatoire pour cette version.

## 11. Critères de validation (tests d'acceptation)

- [ ] Après rechargement, les decks, cartes, tags, fiches, associations et états de révision existent toujours.
- [ ] La recherche `Ctrl/Cmd + K` retrouve un deck, une fiche et une flashcard ; Entrée ouvre le résultat.
- [ ] La barre affiche **au plus trois destinations précédentes**, et toutes sont cliquables.
- [ ] Le Dashboard affiche une date réelle de prochaine révision et le calendrier des jours actifs.
- [ ] En révision, la barre supérieure regroupe deck + type ; la barre inférieure regroupe les trois compteurs.
- [ ] Un clic ou **Espace** retourne la carte ; les touches **1–4** n'agissent qu'après révélation.
- [ ] Une évaluation FSRS change la date d'échéance de façon persistante.
- [ ] Les types de cartes, les tags et les numéros uniques fonctionnent sur les créations et modifications.
- [ ] Une fiche peut être associée à un deck et à une carte ; une suppression de fiche conserve la carte.
- [ ] Le Schéma et le Graphe permettent d'atteindre toutes les notions, sans coupure arbitraire.
- [ ] La page Lacunes montre de véritables difficultés issues des révisions.
- [ ] Un import/export JSON conserve ces informations ; les anciennes sauvegardes restent importables.
- [ ] La commande `npm run build` réussit sur la branche de développement.

## 12. Points à préciser ultérieurement (non spécifiés dans la note d'origine)

Ces sujets ne sont **pas des exigences supplémentaires déjà décidées** :

- Algorithme exact de classement des lacunes et seuils de difficulté.
- Représentation visuelle exacte du graphe (force dirigée, arborescence, etc.).
- Modes avancés de traduction (saisie, correction automatique, langues).
- Paramètres personnels FSRS (rétention cible, optimisation des poids).
- Synchronisation multi-appareils, comptes et partage de decks.

---

*Ce document reformule `Shuka(2).md` en exigences vérifiables. Les précisions ajoutées pour l'implémentation (comportements par défaut, tests, migration) sont explicitées pour éviter les interprétations silencieuses.*