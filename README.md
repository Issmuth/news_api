# 📰 News API & Analytics Engine

A production-grade News Management API built with **Node.js**, **TypeScript**, and **Drizzle ORM**. This system features a robust engagement tracking engine, background analytics aggregation, and a Redis-backed protection layer to ensure data integrity.

---

## 🚀 Key Features

* **Article Management**: Full CRUD with Role-Based Access Control (RBAC) and Soft Deletes.
* **Non-Blocking Engagement**: Real-time view tracking using `setImmediate` to ensure zero latency for the end-user.
* **Analytics Engine**: Daily stats aggregation powered by **BullMQ** and **Redis**.
* **Refresh Protection**: Redis-based cooldown middleware to prevent view-count spam from both Guests (IP-based) and Authenticated users.
* **GMT Normalization**: Analytics are aggregated using GMT time zones for consistent daily reporting.

---

## 🛠️ Technology Stack

| Technology | Choice Reason |
| :--- | :--- |
| **Drizzle ORM** | Type-safe, lightweight, and provides excellent SQL-like control for complex aggregations. |
| **PostgreSQL** | Relational integrity for articles, logs, and analytics. |
| **Redis** | Used for high-speed "view-locks" (cooldowns) and as a message broker for BullMQ. |
| **BullMQ** | Reliable background job processing with retry logic for the analytics engine. |
| **Jest & Supertest** | Comprehensive integration testing with advanced DB and Redis mocking. |

---

## 📋 Prerequisites

* **Node.js** (v18+)
* **Docker & Docker Compose or local installation of postgres & Redis** 
* **npm** or **yarn**

---

## ⚙️ Installation & Setup

#### A. Local Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd news-api/backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3. **Create the database**:
    ```bash
    # connect to PostgreSQL Shell
    psql -U postgres
    ```
    ```sql
    -- create the database
    CREATE DATABASE news_api;
    ```
3.  **Environment Variables**:
    Create a `.env` file in the /backend directory. Use the following values:
    <br>
    ```env
    PORT=3000
    DATABASE_URL=postgresql://postgres:postdbadmin@localhost:5432/news_api
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=your_super_secret_key
    NODE_ENV=development
    ```

5.  **Database Migration**:
    ```bash
    npm run db:push
    ```

<br>

#### B. Docker Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd news-api/backend
    ```

3.  **Environment Variables**:
    Create a `.env` file in the /backend directory. Use the following values:
    <br>
    ```env
    PORT=3000
    DATABASE_URL=postgresql://postgres:postdbadmin@localhost:5433/news_api
    REDIS_URL=redis://localhost:6378
    JWT_SECRET=your_super_secret_key
    NODE_ENV=development
    ```

3. **Spin up Infrastructure**:
    ```bash
    docker-compose up -d
    ```

4.  **Database Migration**:
    ```bash
    # Run this from your host machine to prepare the Docker database
    npm run db:push
    ```

---

## 🧪 Running & Tests

Running the app is straight forward if using docker spinning up the infrastructure will automatically initiate a build and run ```npm start```. However, for local installation, you will need to start the server locally as follows:

##### Development

```bash
# just start the app after installation steps
npm run dev
```

##### Production build

```bash
# run build
npm run build

# start the server once build completes
npm start
```

---

The test suite covers Auth, Article CRUD, Engagement Tracking, and Analytics logic. 

```bash
# Run all tests
npm test
```

### 🧰 Troubleshooting

if encountering errors make sure to check the following:

- make sure your Redis is running or you will encounter errors once the server starts.
- Make sure there isn't another app running on the same port.
- to avoid conflict with local installation one to one port mapping has been changed for Redis and PostgreSQL to 6378 and 5433 respectively, make sure these ports are not being used by any process.


## ➡️ Next Steps and Reccomendations

- Additonal trigger for the analytics engine to sync data on author dashboard request, to avoid displaying stale data.

- Email verification steps to avoid invalid, non-existent fradulent email sign-ups.

- Advances performance metrics beyond just reader count such as, read time aggregation, unique versus new readers stat etc...

- make sure you're in the /backend directory when running or testing the app
