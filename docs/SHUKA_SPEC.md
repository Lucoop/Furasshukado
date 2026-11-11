---
tags:
  - projets
  - code
aliases:
  - Furasshukado
  - Shuka
statut: "Référence de développement — version clarifiée"
source: "Shuka(3).md"
version: "3.0"
mode: "Mise à jour cumulative : les exigences antérieures restent applicables sauf modification explicite"
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

1. **Dashboard** — synthèse des révisions et des lacunes.
2. **Decks** — bibliothèque des decks et de leurs cartes.
3. **Fiches** — notes ou notions détaillées, associées ou non à un deck.
4. **Schéma** — notions regroupées hiérarchiquement par deck.
5. **Graphe** — visualisation des liens entre **toutes** les flashcards, les fiches et leurs decks.
6. **Lacunes** — difficultés identifiées à partir des résultats de révision.
7. **Devoirs** — liste de devoirs avec échéances, états et liens vers les fiches ou les decks.

### 2.1.1. Barre latérale flottante — exigence de Shuka(3).md

- La barre latérale est **détachée du bord gauche**, de largeur compacte, et flotte **au milieu de la hauteur** sur ordinateur.
- Les **seules entrées de navigation directement visibles** dans cette barre sont : **Dashboard, Decks, Devoirs, Graphe, Paramètres** (dans cet ordre).
- Les écrans **Fiches, Schéma, Lacunes, Révisions et Statistiques** restent disponibles via la recherche Spotlight et des liens contextuels pertinents (Dashboard/Decks/Devoirs). Ils ne disparaissent pas.
- En mode mobile, un accès compact et utilisable remplace cette barre sans masquer le contenu.

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
- **Lacunes** : synthèse des cartes réellement difficiles, avec accès au détail. Pas de faux chiffres.

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

### 7.3. Graphe — restriction explicite de Shuka(3).md

- Le graphe présente **uniquement les fiches/notes qui disposent d’au moins une relation explicite**, ainsi que **les devoirs** ; il ne représente pas les decks, cartes ou vidéos comme des nœuds ordinaires.
- Il affiche les liens **fiche ↔ fiche** et **fiche ↔ devoir**. Les relations vers une carte ou une vidéo rendent la fiche « liée », mais l’objet carte/vidéo est consultable dans la fiche plutôt que dans le graphe.
- Les devoirs sans lien restent visibles en tant que nœuds indépendants.
- Les grandes collections sont toutes accessibles (recherche, filtrage, navigation par pages/chargement progressif autorisés) ; aucun plafond fixe masquant des notes n’est acceptable.
- Un clic ouvre la **fiche ou le devoir exact**.

### 7.4. Liens entre connaissances (inspiration Obsidian)

- Une fiche peut pointer vers une ou plusieurs autres fiches, vers des flashcards, vers un devoir et vers des **liens de vidéos externes**.
- Les relations sont enregistrées **explicitement** en base locale, avec des identifiants stables ; le contenu ne dépend pas uniquement d’une mise en forme Markdown.
- Dans une fiche, afficher et ouvrir les éléments liés ; la suppression d'un élément nettoie ses liens sans supprimer les autres contenus.
- V1 : ajout/suppression de liens via une interface simple, sans obligation d'implémenter toute la syntaxe `[[wikilink]]` d’Obsidian.
- V1 : URL de vidéo HTTP(S) enregistrée comme référence ; **pas de copie de la vidéo ni d’hébergement**.

### 7.5. Devoirs

- Créer, modifier et supprimer un devoir possédant un **titre**, une description facultative, une **échéance facultative**, un **statut** (à faire, en cours, terminé) et éventuellement un deck associé.
- Associer une ou plusieurs fiches à un devoir pour les retrouver et pour afficher ces liens dans le graphe.
- Les modifications de devoirs et de liens sont persistées dans IndexedDB ; suppression d'un devoir sans suppression des fiches liées.
- Un devoir terminé reste consultable. L'interface doit permettre d'ouvrir un devoir depuis son nœud dans le graphe.

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
- [ ] Le Schéma permet d’atteindre toutes les notions. Le Graphe affiche **uniquement les fiches liées et les devoirs**, sans coupure arbitraire, et chaque nœud ouvre l’élément exact.
- [ ] Les liens fiche ↔ fiche, fiche ↔ carte, fiche ↔ vidéo externe et fiche ↔ devoir sont créés et conservés après rechargement.
- [ ] Un devoir peut être créé, modifié, terminé, relié à une fiche et supprimé sans perte des fiches associées.
- [ ] La barre latérale flottante montre exactement les 5 entrées demandées ; les autres pages restent accessibles.
- [ ] La page Lacunes montre de véritables difficultés issues des révisions.
- [ ] Un import/export JSON conserve ces informations ; les anciennes sauvegardes restent importables.
- [ ] La commande `npm run build` réussit sur la branche de développement.

## 12. Fonctions assistées par IA — besoin exprimé dans Shuka(3).md

- **Objectif confirmé** : pouvoir bénéficier de fonctions d’aide à l’étude par IA.
- **Non encore défini par l’utilisateur** : fournisseur/modèle, connexion et gestion des clés, consentement à l’envoi de contenus, coût, actions exactes (génération de cartes, résumé, détection de lacunes...), mode hors ligne.
- **Décision d’implémentation prudente** : garder une architecture permettant de brancher ultérieurement une fonction d’assistance IA, **sans affirmer qu’une IA est active** et sans envoyer silencieusement les notes privées vers un service distant. Les outils d’étude déjà disponibles continuent de fonctionner sans IA.
- Des propositions d’actions envisageables (non validées) : créer des cartes à partir d’une fiche, résumer une vidéo transcrite ou proposer des pistes pour les lacunes. Elles nécessitent une décision explicite avant activation.

## 13. Points à préciser ultérieurement (non spécifiés dans la note d'origine)

Ces sujets ne sont **pas des exigences supplémentaires déjà décidées** :

- Algorithme exact de classement des lacunes et seuils de difficulté.
- Représentation visuelle exacte du graphe (force dirigée, arborescence, etc.).
- Modes avancés de traduction (saisie, correction automatique, langues).
- Paramètres personnels FSRS (rétention cible, optimisation des poids).
- Synchronisation multi-appareils, comptes et partage de decks.

---

*Ce document reprend intégralement les exigences de la version précédente et intègre les évolutions de `Shuka(3).md`. Les choix nécessaires à une V1 testable sont signalés ; les choix de fournisseur IA restent ouverts.*