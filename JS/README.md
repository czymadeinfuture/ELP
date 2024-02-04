# Jeu Jarnac

Ceci est une implémentation en JavaScript du jeu Jarnac, un jeu de stratégie basé sur les mots où les joueurs s'affrontent en plaçant et en modifiant des mots sur un plateau de jeu.

## Installation

1. Assurez-vous que Node.js est installé sur votre ordinateur. Si ce n'est pas le cas, vous pouvez le télécharger et l'installer depuis le site officiel de [Node.js](https://nodejs.org/).
2. Téléchargez ce dépôt de code sur votre ordinateur local.
3. Connectez bien avec l'Internet car la détection de la présence de mots nécessite une connexion avec le site https://1mot.net

## Lancement du jeu

（Pour Windows/Linux) Dans le dossier contenant le code du jeu, lancez le jeu en exécutant la commande suivante :

```
node JarnacGame.js
```

## Règles du jeu

Jarnac est un jeu de stratégie basé sur les mots qui comprend les règles de base suivantes :

- Au début du jeu, chaque joueur tire 6 lettres d'un sac de lettres.
- Pendant son tour, un joueur peut choisir de placer un nouveau mot, de modifier un mot existant, de modifier et d'obtenir un mot d'un adversaire(jarnac), d'échanger 3 lettres(depuis le second tour) ou de terminer son tour.
- À chaque tour, le joueur obtient régulièrement une lettre.
- Chaque mot doit comporter au moins 3 lettres.
- Les joueurs doivent placer ou modifier des mots sur le plateau de jeu, qui est une grille de taille spécifique.
- L'objectif du jeu est de former des mots valides sur le plateau de jeu et d'obtenir le score le plus élevé en plaçant stratégiquement des mots.
- Le jeu se termine lorsqu'un joueur a rempli les sept premières lignes de son plateau de jeu avec des mots valides et a mis un mot sur la dernière ligne. Quand il termine son tour et pass vers le joueur suivant, le jeu se termine. Le joueur avec un score plus élevé gagne le jeu.

Hint: 
- Réfléchissez bien avant chaque action! C'est important pour ne pas bloquer le jeu!
- Suivez les instructions à chaque étape de la saisie. Il est préférable de saisir les mots en majuscules et sans espace.
- Bien que les instructions soient en anglais, les mots saisis doivent être des mots français.

Pour mieux comprendre le jeu, vous pouvez savoir plus par ce lien: 
[Règles du jeu](https://github.com/sfrenot/javascript/blob/master/projet2/RegleJarnac.pdf)

---

Amusez-vous bien !
