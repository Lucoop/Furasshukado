# Shuka (anciennement Furasshukado)

Plateforme de flashcards **100 % locale**, sans compte ni serveur. Les decks, cartes, révisions et statistiques sont enregistrés dans IndexedDB via Dexie.

## Démarrage

Node.js 20+ recommandé.

```bash
npm install
npm run dev
```

Ouvrir l'adresse indiquée par Vite. Vérifier la compilation avec `npm run build`.

## Fonctionnalités

- Créer, modifier, supprimer et rechercher des decks et des cartes.
- Organiser les decks dans des dossiers.
- Éditer les cartes en Markdown et LaTeX (`$...$`, `$$...$$`) avec aperçu.
- Réviser un deck ou tous les decks et noter chaque réponse.
- Planification simple des prochaines révisions (pas FSRS pour l'instant).
- Tableau de bord et statistiques issues de l'historique.
- Export/import de sauvegarde JSON complète (remplacement après confirmation).
- Export/import CSV des cartes d'un deck (en-têtes `front,back`).
- Thème sombre par défaut, préférence conservée dans localStorage.

## Cahier des charges Shuka — version actuelle

- Interface discrète et minimaliste, thème sombre par défaut.
- Recherche universelle type Spotlight dans les decks, les cartes et les tags : **Ctrl/Cmd + K**, flèches et Entrée.
- Historique de navigation en haut de la page pour revenir à un deck ou menu récent (conservé pendant la session d'application).
- Dashboard : calendrier de 12 semaines basé sur les réponses de révision, prochain deck à réviser et accès immédiat aux révisions.
- Révisions : deck et type affichés, carte retournable au clic, compteurs de nouvelles cartes / apprentissage / révisions, quatre évaluations.
- Flashcards : tags, numéro unique attribué à la création, types **recto→verso**, **verso→recto**, **deux sens** et **traduction**.
- Decks : tags et filtrage via la recherche globale.
- Création rapide : depuis un deck, **N** ouvre la création de carte ; **Ctrl/Cmd + Entrée** enregistre le formulaire.

Les cartes « deux sens » présentent les deux orientations dans la même session ; elles partagent actuellement une seule échéance de révision. La traduction utilise les champs recto/verso, sans correction automatique de texte. Le calendrier représente l'historique local, pas une synchronisation multi-appareils.

**Évolution de stockage :** le nom interne IndexedDB `furasshukado` est volontairement conservé pour ne pas perdre les données déjà enregistrées. Les anciennes cartes et decks sont enrichis lors de la migration de schéma vers la version 2.

## Stockage et confidentialité

Les données sont conservées **dans ce navigateur et ce profil**. Elles ne sont pas synchronisées. Pensez à exporter une sauvegarde JSON régulièrement. Supprimer les données du site peut supprimer les cartes. L'import JSON remplace la bibliothèque actuelle. Pas de compte ni de publication publique.

## Déploiement

`npm run build` produit `dist/`, déployable sur un hébergement statique. La configuration Vite utilise une base relative pour fonctionner dans un sous-répertoire.


## Importer une collection Anki (.colpkg / .apkg)

Dans **Paramètres → Importer une collection Anki**, sélectionne un fichier, vérifie l'aperçu puis confirme l'importation. L'analyse est effectuée localement dans le navigateur avec fflate, fzstd et sql.js (WebAssembly). Les decks et cartes existants ne sont pas supprimés. Réimporter le même fichier ignore les cartes portant le même identifiant Anki.

Formats pris en charge : collections SQLite `collection.anki2`, `collection.anki21` et `collection.anki21b` (Zstandard). Modèles basiques et cloze, images courantes et audio pris en charge dans la mesure du possible. Les exports modernes au schéma 18 sont lus via les tables SQLite et les configurations Protobuf ; les anciens exports restent pris en charge. Les modèles personnalisés complexes, le CSS des modèles, certains médias et l'historique de révision Anki ne sont pas conservés. Taille maximale de l'archive : 250 Mo ; les médias individuels de plus de 12 Mo sont ignorés. Les médias intégrés augmentent l'espace utilisé par IndexedDB : exporte régulièrement une sauvegarde JSON.

Après avoir récupéré la branche, exécute `npm install` pour actualiser les dépendances et le fichier `package-lock.json`, puis `npm run build`. L'importeur n'a pas encore été validé avec une batterie de fichiers Anki réels.
