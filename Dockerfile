# Utilisation d'une image Node.js officielle et légère
FROM node:20-alpine

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de dépendances et du schéma Prisma
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Installation des dépendances dans le dossier backend
WORKDIR /app/backend
RUN npm ci --omit=dev

# Revenir à la racine et copier l'intégralité du code
WORKDIR /app
COPY . .

# Déplacement dans le dossier backend pour l'exécution
WORKDIR /app/backend

# Exposition du port (Railway injectera dynamiquement la variable PORT)
EXPOSE 3000

# Commande de lancement de l'application
CMD ["npm", "start"]