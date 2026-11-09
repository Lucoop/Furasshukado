# Furasshukado

Application de flashcards personnelle : apprendre, réviser et progresser.

## État du projet

La première maquette React + TypeScript est en place. Elle contient une interface de démonstration avec des données fictives :
- tableau de bord et indicateurs ;
- bibliothèque de decks ;
- session de révision interactive ;
- navigation et thème clair/sombre ;
- vues provisoires pour les autres sections.

Aucune donnée n'est encore persistée : IndexedDB, Dexie, import/export et synchronisation seront ajoutés dans les prochaines étapes.

## Démarrage

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
```

Pour vérifier la compilation :

```bash
npm run build
```

## Technologies

- React 18
- TypeScript
- Vite
- Lucide React

## Déploiement

Le projet utilise `base: "./"` dans Vite pour rester compatible avec un déploiement sous un chemin de sous-répertoire, notamment GitHub Pages.