To set up the project, follow these steps:

1. Connect mongo database with the connection string below:
     ```
     mongodb+srv://Allie:allie4926@cluster0.x0dwxnq.mongodb.net/
     ```

2. Initialize the project by running the following command:
     ```
     npm init -y
     ```

3. Add the following line to the "scripts" section in your package.json file:
     ```
     "start": "nodemon --inspect app.js"
     ```

4. Install the required dependencies by running the following command:
     ```
     npm install uuid node-cron
     ```

5. Start project by running the following command:
     ```
     npm start
     ```
     
6. Account for testing:
   ```
   assistant account: 
      email: assistanteconomics@gmail.com
      password: password123

      email: assistantforeignlanguages@gmail.com
      password: securepassword

   student account:
      email: 001001@gmail.com
      password: password1

      email: 008001@gmail.com
      password: password8
   ```