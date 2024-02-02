# Nom du Projet
ELM: GUESS IT!

## Introduction

Bienvenue dans "Guess it!", un jeu interactif où votre défi est de deviner le mot caché basé sur les définitions fournies. 

## Prérequis
Avant de lancer ce projet Elm, assurez-vous que Elm est installé sur votre système. Vous pouvez trouver le guide d'installation et d'autres ressources sur le [site officiel d'Elm](https://elm-lang.org/).

## Dépendances
Ce projet utilise uniquement les bibliothèques de base d'Elm, il n'est donc pas nécessaire d'installer des bibliothèques tierces supplémentaires. Elm fournit un ensemble complet de bibliothèques standard pour gérer les interfaces web (`Html`), les requêtes réseau (`Http`), et autres tâches courantes, ce qui rend inutile les dépendances externes pour la plupart des projets.

## Exécution du Projet
Pour exécuter ce projet, suivez les étapes ci-dessous :

1. Ouvrez l'interface de ligne de commande.
2. Naviguez vers le répertoire du projet.
3. Exécutez la commande `elm reactor`.
4. Ouvrez votre navigateur et visitez [http://localhost:8000](http://localhost:8000).
5. Dans votre navigateur, trouvez et cliquez sur le fichier `Main.elm`. Le projet sera compilé et affiché dans le navigateur.

## Instructions d'utilisation
1. **Commencer le Jeu**:
   - Cliquez sur le bouton "Start the Game!" pour commencer à jouer.

2. **Obtenir un Nouveau Mot**:
   - Pour générer un nouveau mot à deviner, cliquez sur le bouton "Get a new word to guess!".

3. **Faire une Supposition**:
   - Tapez votre supposition dans la zone de texte sous l'intitulé "Type in to guess".
   - Si votre supposition est complètement incorrecte, elle sera affichée en rouge.
   - Si vous devinez le mot correctement, il apparaîtra en vert.
   - Une indication en bleu apparaîtra si la première lettre de votre supposition est correcte.

4. **Révéler le Mot**:
   - Si vous souhaitez voir la réponse sans continuer à deviner, cliquez sur le bouton "show it". Cela révélera le mot que vous essayiez de deviner.

5. **Continuer à Jouer**:
   - Après chaque tentative, vous pouvez soit essayer de deviner un nouveau mot en cliquant de nouveau sur "Get a new word to guess!", soit continuer à deviner le mot actuel.

Amusez-vous bien et testez votre vocabulaire avec "Guess it!"!

