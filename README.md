# ELP
##  Introduction
Le projet ELP est composé de trois sous-projets, qui sont respectivement Golang, Elm et JavaScript. Pour une meilleure organisation et maintenance, nous avons placé le code de chaque langage de programmation dans des dossiers séparés.

## Table of Contents
1. [Partie Golang](#partie-golang)
2. [Partie Elm](#partie-elm)
3. [Partie JavaScript](#partie-javascript)

## Structure du Projet
- **Partie Golang :** Utilisation de goroutines pour calculer de grandes matrices de multiplication
- **Partie Elm :** Intégrer dans une page web une fonctionnalité qui sélectionne aléatoirement des mots d'un dictionnaire, affiche leurs définitions, et invite les utilisateurs à deviner les mots correspondants.
- **Partie JavaScript :** coming soon

## Projet Go

### multiplication matricielle à grande échelle

### I.Description du projet
L'algorithme de Strassen est une méthode efficace pour la multiplication de matrices, proposée par Volker Strassen en 1969. Cet algorithme est parfois plus performant que la méthode traditionnelle de multiplication matricielle.  
La méthode traditionnelle nécessite $n^3$ multiplications pour deux matrices de taille $n \times n$. L'algorithme de Strassen réduit le nombre de multiplications à environ $n^2.81$ en décomposant la matrice en sous-matrices plus petites et en appliquant des opérations spécifiques d'addition et de soustraction, ainsi qu'un nombre réduit de multiplications.  
Bien que l'algorithme de Strassen puisse théoriquement accélérer la multiplication des matrices, sa nature récursive et les opérations complexes d'addition et de soustraction peuvent rendre ses performances inférieures à celles des méthodes traditionnelles pour les petites matrices. Par conséquent, il est principalement utilisé pour les matrices de grande taille.  

### II.Comment utiliser
**Avant utilisation, vous devez vous assurer des choses suivantes :**  
1. Le programme go est installé sur votre ordinateur  
2. Vous êtes déjà connecté à Internet et l'adresse ipv4 du programme doit être remplacée par l'adresse ipv4 de votre réseau.  
3. Téléchargez tout dans le dossier go_final  (dans le dosser go)

**Si vous avez rempli les prérequis, （prenez le système Linux comme exemple） saisissez les code sur le terminal:**  
```
go run TCP_server.go generate_matrix.go strassen.go  
```
Si la connexion réussit, le message suivant s'affichera : Server is listening on port 20000  
Ensuite, ouvrez un autre terminal et entrez  
```
go run TCP_client.go  
```
Entrez un multiple de 4 et le programme renverra deux matrices aléatoires de ce nombre et leur produit.  
Généralement très rapide !  

### III.principes fondamentaux
1. **Division de la matrice** : Chaque matrice $n \times n$ est divisée en quatre sous-matrices $(n\2) \times (n\2)$. Cela signifie que chaque matrice originale A et B est divisée en A11, A12, A21, A22 et B11, B12, B21, B22.  
2. **Création de 7 nouvelles matrices** : Ces matrices sont les produits des sommes ou des différences des sous-matrices originales. L'algorithme calcule les sept matrices suivantes :  
   -  M1 = $(A11 + A22) \times (B11 + B22)$ 
   -  M2 = $(A21 + A22) \times B11$ 
   -  M3 = $A11 \times (B12 - B22)$ 
   -  M4 = $A22 \times (B21 - B11)$ 
   -  M5 = $(A11 + A12) \times B22$ 
   -  M6 = $(A21 - A11) \times (B11 + B12)$ 
   -  M7 = $(A12 - A22) \times (B21 + B22)$ 

3. **Construction de la matrice finale à partir de M1 à M7** : Les quatre sous-matrices C11, C12, C21, C22 de la matrice résultante C sont calculées à partir de M1 à M7. Par exemple :  
   - C11 = M1 + M4 - M5 + M7 
   - C12 = M3 + M5 
   - C21 = M2 + M4 
   - C22 = M1 - M2 + M3 + M6 

4. **Application récursive** : Sur cette base, Python peut également garantir ses opérations récursives pour augmenter la vitesse de l'algorithme.

### IV.Accélération goroutine et ses effets
#### Qu'est-ce qu'une Goroutine ?

Dans le langage de programmation Go, une goroutine est un fil d'exécution léger géré par le runtime de Go. Les goroutines sont au cœur de la programmation concurrente en Go. Comparées aux threads traditionnels, les goroutines sont plus efficaces en termes d'utilisation et de gestion, principalement parce qu'elles utilisent moins de mémoire et que le coût de commutation entre les threads du système d'exploitation est plus faible.

#### Application dans le Code Précédent

Dans notre implémentation de l'algorithme de Strassen, les goroutines sont utilisées pour calculer parallèlement plusieurs parties de la matrice. Cela est réalisé en créant une goroutine différente pour chaque opération matricielle indépendante. Plus précisément, la partie clé de l'algorithme consiste à calculer 7 produits matriciels (marqués M1, M2, ..., M7), qui sont au cœur de l'algorithme de Strassen.

Dans le code, chacun de ces produits est calculé dans une goroutine séparée. Par exemple :

```go
go func() {
    defer wg.Done()
    results[0] = last_strassen(addMatrix(A11, A22), addMatrix(B11, B22)) 
}()
```

Ici, le mot-clé `go` est utilisé pour démarrer une nouvelle goroutine. `wg.Done()` est utilisé pour notifier un groupe d'attente (`sync.WaitGroup`) qu'une opération est terminée, ce qui est un moyen de coordonner la fin de l'exécution des différentes goroutines. Une fois que toutes les goroutines ont terminé leurs calculs, le programme principal continue et combine ces résultats pour former la matrice de produit final.

Afin d'augmenter la tolérance aux pannes et la vitesse du programme, nous limitons les calculs de strassen et de goroutine à deux fois, c'est-à-dire découper une matrice en 16 morceaux, puis utiliser les opérations normales de multiplication matricielle. De cette manière, l'implémentation de l'algorithme de Strassen tire parti des avantages de l'exécution concurrente, permettant un calcul matriciel plus efficace. Cela est particulièrement utile pour le traitement de grandes matrices, car cela peut réduire considérablement le temps de calcul.

### V.Fonctionnement du protocole TCP
Le protocole TCP (Transmission Control Protocol) est un protocole de communication fiable, ordonné et sans perte utilisé fréquemment dans les applications réseau. 

Dans cette application TCP, le client transmet la dimension d'une matrice au serveur. Le serveur, après réception, crée des matrices correspondantes de manière aléatoire, réalise leur multiplication et renvoie ensuite le résultat au client pour affichage.

#### Établissement de la Connexion TCP

-  **Client** :
```go
conn, err := net.Dial("tcp", "192.168.0.101:20000")
```
Le client établit une connexion TCP avec le serveur.

-  **Serveur** :
```go
listener, err := net.Listen("tcp", "192.168.0.101:20000")
```
Le serveur écoute les connexions entrantes sur le port TCP spécifié.

#### Communication et Traitement

- **Envoi de Données (Client) :**
```go
_, err = conn.Write([]byte(data))
```
Le client envoie la taille d'une matrice souhaitée au serveur, qui est utilisée comme base pour les calculs de matrices.

- **Réception et Traitement (Serveur) :**
```go
n, err := conn.Read(buffer)
```
Le serveur reçoit la taille de la matrice, génère des matrices de cette taille, effectue des opérations (comme la multiplication), et envoie les résultats au client.

-   **Génération et Multiplication des Matrices :**
    
    -   Le serveur génère deux matrices de la taille reçue.
    -   Il effectue la multiplication de ces matrices.
  
-   **Envoi des Résultats au Client :**
```go
sendMatrix(conn, resultMatrix)
```
Le serveur envoie les matrices générées et le résultat de la multiplication au client.

#### Clôture de la Connexion :**
```go
defer conn.Close()
```
Une fois la communication terminée, la connexion est fermée des deux côtés pour libérer les ressources réseau


