# Furasshukado

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

## Stockage et confidentialité

Les données sont conservées **dans ce navigateur et ce profil**. Elles ne sont pas synchronisées. Pensez à exporter une sauvegarde JSON régulièrement. Supprimer les données du site peut supprimer les cartes. L'import JSON remplace la bibliothèque actuelle. Pas de compte ni de publication publique.

## Déploiement

`npm run build` produit `dist/`, déployable sur un hébergement statique. La configuration Vite utilise une base relative pour fonctionner dans un sous-répertoire.
