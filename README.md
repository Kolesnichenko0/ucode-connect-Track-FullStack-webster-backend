## ⚙️ Requirements and Dependencies

Before starting, ensure the required technologies are installed.

- **Node.JS** >= v22
- **NPM** >= v10
- **MySQL** >= 8.0

## 🚀 How to Run the Solution

In the examples of all commands in the text `<env>` is the name of the environment to perform the migration, e.g. `dev`,
`test` or `prod`.

1. Clone this repository and move to the project directory:
   ```bash
   git clone <repository-url>
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. For development purposes, use the `dev` environment. Configure the database connection by copying the `.env.development.example` file to a new file `.env.development`. After that, put your MySQL credentials for the root user in the `.env.database.root` file:
    ```
    # Database Root Configuration
    DB_ROOT_HOST=localhost
    DB_ROOT_PORT=3306
    DB_ROOT_USER=root
    DB_ROOT_PASSWORD=root
    ```
   A new database user `webster_sql` will be created after executing the next command. You can change the credentials for the `webster_sql` user in `.env.development`:
    ```
    # Database App Configuration
    DB_APP_HOST=localhost
    DB_APP_PORT=3306
    DB_APP_USER=uevent_sql
    DB_APP_PASSWORD=securepass
    DB_APP_DATABASE=uevent
    ```
   For test purposes use `test` environment: create `.env.test` file by copying the `.env.test.example` file.
4. Run script for create databases and user:
   ```bash
   npm run setup:db
   ```
5. Run command to apply necessary migrations.
   ```bash
   npm run migrate:dev
   ```
   **Note:**  Alternatively, you can run:
    ```bash
    npm run migrate:reset:dev
    ```
   to reset the database and apply all migrations. If you use this command, you can skip steps 6-8.
6. Run command to create prisma client:
   ```bash
   npm run migrate:generate:dev
   ```
7. Run command to build the project:
   ```bash
   npm run build
   ```
8. Seeds help you fill your database with initial data for a presentation or project launch. To start creating test data, run the command:
    ```bash
    npm run migrate:seed:dev
    ```
9. Start the server:
    ```bash
    npm run start:dev
    ```
10. Application will be launched on [http://localhost:8080/](http://localhost:8080/).

## 📫 Mailing Service

[Ethereal](https://ethereal.email/) is a fake SMTP service, mostly aimed at Nodemailer and EmailEngine users (but not
limited to). It's a completely free anti-transactional email service where messages never get delivered.
To view the letter that the user will receive, you need to log in to this service using a test login and password.
Default credentials you can find in `.env.development.example` file or:

* login:
    ```text
    ricky43@ethereal.email
    ```
* password:
    ```text
    4e1zbM2nxsMu2d823E
    ```

## 🔁 REST API documentation

The documentation of all available endpoints can be found [http://localhost:8080/api](http://localhost:8080/api).
The [Swagger](https://swagger.io/) library is used.

## Migrations

1. To create new migration run command:
    ```bash
    npm run migrate:create:dev --name <migration_name>
    ```
2. To refresh all data at the database run command:
    ```bash
    npm run migrate:reset:dev
    ```

## 🪲 Testing

For all commands in the text below, the environment is a `test` that uses the variables of the `.env.test.example` file.

1. Unit tests
    * Run all unit tests with a detailed report:
    ```bash
    npm run test:unit
    ```
    * Run one specific unit test file with a detailed report:
    ```bash
    npm run test:unit -- <file_name>
    ```
2. End-to-end (e2e) testing
    * Run all e2e tests with detailed report:
    ```bash
    npm run test:e2e
    ```
    * Run one specific e2e test file with a detailed report:
    ```bash
    npm run test:e2e -- <file_name>
    ```
3. All testing
    * Run all e2e and unit tests with detailed report:
   ```bash
   npm run test
   ```

## 👤 Fake Data
To fill the database with demo data of users, companies, events and tickets, run the following command:
```bash
npm run migarte:seed:dev
```
Here is the fake data for presentations.

User data for testing:
* full name:
   ```text
   Test User
   ```
* email:
  ```text
  test.user@uevent.com
  ```
All users have a password:
```text
Password123!$
```


## 🏞 Unsplash
**Unsplash** is the internet’s source of freely usable images.

To connect to the Unsplash, follow these steps:
1. Sign up for an account with Unsplash:
   Go to (Unsplash Developers)[https://unsplash.com/developers] and sign in to your Unsplash account (or create a new one).
2. Create an app:
   In the `Your Applications` section, click `New Application`.
   Fill in the fields: name of the app (for example, `Webster App`), description (for example, `Get images for projects`). Accept the terms and conditions.
3. Get the API key:
   After creating the app, you will see the Access Key (and Secret Key if you need OAuth). The Access Key is your API key.
   Copy the key and save it in a safe place.
4. After put your access key to the `.env.development` file:
    ```bash
    # Upsplash Configuration
    UNSPLASH_ACCESS_KEY=<API_key>
    ```
In Development Mode, you have **50 requests per hour**. To increase the limit (up to 5000 requests/hour), apply for production access via the Unsplash dashboard, providing use cases with attribution.

More information can be found in the [Unsplash documentation](https://unsplash.com/documentation).
