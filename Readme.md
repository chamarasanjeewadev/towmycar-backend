## emails to be sent

## users

-- When user registers ( email verification)- sent email
-- User creates breakdown request
---email to each driver in the area
---email to user saying request has been created or not
-- User accepts breakdown request
-- user Rejects breakdown request

## drivers

-- When driver registers (email verification)
-- When driver gets a breakdown request
-- When driver quotes a breakdown request
-- When driver accepts a breakdown request
-- When driver rejects a breakdown request
-- When driver closes a breakdown request

## Managing Docker Containers

To manage your Docker containers and clear persisted data, you can use the provided `Makefile`.

- To stop the Docker containers:

  ```sh
  make down
  ```

- To clear the persisted data:

  ```sh
  make clear-data
  ```

- To start the Docker containers:

  ```sh
  make up
  ```

- To restart the Docker containers with clean data:

        ```sh
        make restart
        ```

## AWS SAM Development

The `.aws-sam` directory is not tracked in git. To build the SAM application:

```bash
cd infrastructure/sam
sam build
```

CREATE EXTENSION IF EXISTS postgis CASCADE;

CREATE EXTENSION IF NOT EXISTS postgis;

LJ06YXB- NO WEIGHT 
LY57HXU- NO WEIGHT 1075

S600ANU 2500
AD19LZN 1950
BD07XAA 1180

cdk bootstrap --profile tow-my-car-dev-account  

AWS_PROFILE=tow-my-car-dev-account yarn run deploy:dev 

## Environment Setup

1. Copy `.env.example` to `.env.dev`:

## Database Migrations

Migrations are not tracked in git. To set up your local database:

1. Run the initial migration:
```bash
yarn workspace @towmycar/database migrate:dev
```

2. To create new migrations:
```bash
yarn workspace @towmycar/database generate
```