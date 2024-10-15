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

  docker build -t breakdown-service -f apps/breakdown_service/Dockerfile .
  docker tag breakdown-service:latest 211125761584.dkr.ecr.us-east-1.amazonaws.com/breakdown_service:latest
  docker push 211125761584.dkr.ecr.us-east-1.amazonaws.com/breakdown_service:latest

  docker build -t quotation-service -f apps/quotation_service/Dockerfile .
  docker tag quotation-service:latest 211125761584.dkr.ecr.us-east-1.amazonaws.com/quotation_service:latest
  docker push 211125761584.dkr.ecr.us-east-1.amazonaws.com/quotation_service:latest
  ##-------
  docker build -t tow-api -f apps/quotation_service/Dockerfile .
  docker tag tow-api:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/tow-api:latest
  docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/tow-api:latest

  docker build -t finder-service -f apps/quotation_service/Dockerfile .
  docker tag finder-service:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/finder-service:latest
  docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/finder-service:latest

  docker build -t notification-service -f apps/notification_service/Dockerfile .
  docker tag notification-service:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/towmycar/notification-service:latest
  docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/towmycar/notification-service:latest
