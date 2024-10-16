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
