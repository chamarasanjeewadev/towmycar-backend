#!/bin/bash

USER_POOL_ID=us-east-1_LWZQeja8g

# List all users
USERNAMES=$(aws cognito-idp list-users --user-pool-id $USER_POOL_ID --query "Users[].Username" --output text)

# Delete each user
for username in $USERNAMES
do
  echo "Deleting user: $username"
  aws cognito-idp admin-delete-user --user-pool-id $USER_POOL_ID --username $username
done

echo "All users deleted."
