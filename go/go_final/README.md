#Projet Go  
##multiplication matricielle à grande échelle  

##I.Description du projet  
L'algorithme de Strassen est une méthode efficace pour la multiplication de matrices, proposée par Volker Strassen en 1969. Cet algorithme est parfois plus performant que la méthode traditionnelle de multiplication matricielle.  
La méthode traditionnelle nécessite $n^3$ multiplications pour deux matrices de taille $n \times n$. L'algorithme de Strassen réduit le nombre de multiplications à environ $n^2.81$ en décomposant la matrice en sous-matrices plus petites et en appliquant des opérations spécifiques d'addition et de soustraction, ainsi qu'un nombre réduit de multiplications.  
Bien que l'algorithme de Strassen puisse théoriquement accélérer la multiplication des matrices, sa nature récursive et les opérations complexes d'addition et de soustraction peuvent rendre ses performances inférieures à celles des méthodes traditionnelles pour les petites matrices. Par conséquent, il est principalement utilisé pour les matrices de grande taille.  

##II.Comment utiliser  
**Avant utilisation, vous devez vous assurer des choses suivantes :**  
1. Le programme go est installé sur votre ordinateur  
2. Vous êtes déjà connecté à Internet et l'adresse ipv4 du programme doit être remplacée par l'adresse ipv4 de votre réseau.  
3. Téléchargez tout dans le dossier go_final  

**Si vous avez rempli les prérequis, （prenez le système Linux comme exemple） saisissez les code sur le terminal:**  
```
go run TCP_server.go generate_matrix.go strassen.go  
```
Si la connexion réussit, le message suivant s'affichera : Server is listening on port 20000  
Ensuite, ouvrez un autre terminal et entrez  
```
go run TCP_client.go  
```
Entrez un multiple de 4 et le programme renverra deux matrices aléatoires de ce nombre et leur produit.  
Généralement très rapide !  

##III.principes fondamentaux

##IV.Accélération goroutine et ses effets

##V.Fonctionnement du protocole TCP
