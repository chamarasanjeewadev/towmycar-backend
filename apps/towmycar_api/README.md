### Responsibilities
## hanlde authentication and authorizations
## handle user requests and save to db
## notify quotation service to process notification requests (based on the range)

##apis
## user apis
- create user
- update user
- delete user
- request quotations based on locations
- view all requests sent
- view quotations related
- confirm a quotation

## query  drivers the request history
- query potential quotations to users
- query 


user created

{
  data: {
    backup_code_enabled: false,
    banned: false,
    create_organization_enabled: true,
    created_at: 1727120124892,
    delete_self_enabled: true,
    email_addresses: [ [Object] ],
    external_accounts: [ [Object] ],
    external_id: null,
    first_name: 'chamara',
    has_image: true,
    id: 'user_2mU982C9mn5okl9Kx6qH9gCy9dd',
    image_url: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybVU5N3pCWUtuSGV2NWdyQkNXMms1eUxBY0EifQ',
    last_active_at: 1727120124889,
    last_name: 'sanjeewa',
    last_sign_in_at: null,
    locked: false,
    lockout_expires_in_seconds: null,
    mfa_disabled_at: null,
    mfa_enabled_at: null,
    object: 'user',
    passkeys: [],
    password_enabled: false,
    phone_numbers: [],
    primary_email_address_id: 'idn_2mU986cdbRZQZUJbjGdpXxemwsJ',
    primary_phone_number_id: null,
    primary_web3_wallet_id: null,
    private_metadata: {},
    profile_image_url: 'https://images.clerk.dev/oauth_google/img_2mU97zBYKnHev5grBCW2k5yLAcA',
    public_metadata: {},
    saml_accounts: [],
    totp_enabled: false,
    two_factor_enabled: false,
    unsafe_metadata: { role: 'driver' },
    updated_at: 1727120124961,
    username: null,
    verification_attempts_remaining: 100,
    web3_wallets: []
  },
  event_attributes: {
    http_request: {
      client_ip: '',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    }
  },
  object: 'event',
  timestamp: 1727120125024,
  type: 'user.created'
}

#user session created
data.... {
  data: {
    abandon_at: 1729712124903,
    actor: null,
    client_id: 'client_2mU97iquP0Wk3uOG1Azx2BtCmj8',
    created_at: 1727120124903,
    expire_at: 1727724924903,
    id: 'sess_2mU985GRFieYIjr7L2ZaBXgyG5q',
    last_active_at: 1727120124903,
    object: 'session',
    status: 'active',
    updated_at: 1727120125035,
    user_id: 'user_2mU982C9mn5okl9Kx6qH9gCy9dd'
  },
  event_attributes: {
    http_request: {
      client_ip: '',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    }
  },
  object: 'event',
  timestamp: 1727120125040,
  type: 'session.created'
}


payload recieves different type of events, create a factory function to check the type of the payload object, if type is user.created it should create new user via @user.repository.ts and @db-schema.ts  and update role based on unsafe_metadata. Also if role is user needs to add record to customer table in the same transaction in @user.repository.ts else if role is driver add a record to driver. 
{
  data: {
    backup_code_enabled: false,
    banned: false,
    create_organization_enabled: true,
    created_at: 1727120124892,
    delete_self_enabled: true,
    email_addresses: [ [Object] ],
    external_accounts: [ [Object] ],
    external_id: null,
    first_name: 'chamara',
    has_image: true,
    id: 'user_2mU982C9mn5okl9Kx6qH9gCy9dd',
    image_url: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybVU5N3pCWUtuSGV2NWdyQkNXMms1eUxBY0EifQ',
    last_active_at: 1727120124889,
    last_name: 'sanjeewa',
    last_sign_in_at: null,
    locked: false,
    lockout_expires_in_seconds: null,
    mfa_disabled_at: null,
    mfa_enabled_at: null,
    object: 'user',
    passkeys: [],
    password_enabled: false,
    phone_numbers: [],
    primary_email_address_id: 'idn_2mU986cdbRZQZUJbjGdpXxemwsJ',
    primary_phone_number_id: null,
    primary_web3_wallet_id: null,
    private_metadata: {},
    profile_image_url: 'https://images.clerk.dev/oauth_google/img_2mU97zBYKnHev5grBCW2k5yLAcA',
    public_metadata: {},
    saml_accounts: [],
    totp_enabled: false,
    two_factor_enabled: false,
    unsafe_metadata: { role: 'driver' },
    updated_at: 1727120124961,
    username: null,
    verification_attempts_remaining: 100,
    web3_wallets: []
  },
  event_attributes: {
    http_request: {
      client_ip: '',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    }
  },
  object: 'event',
  timestamp: 1727120125024,
  type: 'user.created'
}