# Utilisation d'une image Node.js officielle et légère
FROM node:20-alpine

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de dépendances depuis le dossier backend
COPY backend/package*.json ./backend/

# Installation des dépendances dans le dossier backend
WORKDIR /app/backend
RUN npm ci --only=production

# Revenir à la racine et copier l'intégralité du code
WORKDIR /app
COPY . .

# Déplacement dans le dossier backend pour l'exécution
WORKDIR /app/backend

# Exposition du port (Railway injectera dynamiquement la variable PORT)
EXPOSE 3000

# Commande de lancement de l'application
CMD ["npm", "start"]