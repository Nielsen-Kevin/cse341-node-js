# Build Project Steps
git init

npm init

npm install ejs --save

npm install express --save

npm install dotenv --save

npm install pg --save

heroku create

heroku addons:create heroku-postgresql:hobby-dev

heroku config -s

# Start database
heroku pg:psql

# Run Locally
heroku local web

# Push
git romte add heroku

git push heroku main

git push github main

# Files Created
server.js
README.md
.env
.gitignore
Procfile

# Checks
git remote -v