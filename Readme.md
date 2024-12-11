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


CREATE EXTENSION IF EXISTS postgis CASCADE;

CREATE EXTENSION IF NOT EXISTS postgis;

LJ06YXB- NO WEIGHT 
LY57HXU- NO WEIGHT 1075

S600ANU 2500
AD19LZN 1950
BD07XAA 1180

cdk bootstrap --profile tow-my-car-dev-account  

AWS_PROFILE=tow-my-car-dev-account yarn run deploy:dev 


CREATE EXTENSION IF NOT EXISTS postgis;

to turn off rds ssl 
Go to the Amazon RDS Console.
Navigate to Databases > Your RDS Instance.
Under Configuration, note the Parameter Group.
Edit the parameter group:
Search for rds.force_ssl.
Set it to 0 (if you want to allow non-SSL connections).
After changing the parameter group, reboot your RDS instance to apply the changes.

 if experienced parameter group issue
 https://stackoverflow.com/questions/76899023/rds-while-connection-error-no-pg-hba-conf-entry-for-host

 https://www.checkcardetails.co.uk/api/vehicledata


 deploy to cdk
 production
 yarn deploy:prod for production
 cdk will pick all .env.prod files to publish
 need to have aws profile named tow-my-car-prod


 development
 yarn deploy:dev for development
 cdk will pick all .env.dev files to publish
 need to have aws profile named tow-my-car-dev (todo)