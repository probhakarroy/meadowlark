#!/usr/bin/env bash

touch lib/credentials.js;
cat > lib/credentials.js << EOL
module.exports = {
    cookie_secret: '${cookie_secret}',
    gmail : {
        user : '${gmail_user}',
        password : '${gmail_password}',
    },
    gcs : {
        project_id : '${gcs_pid}',
        key: '${gcs_key}',
    },
    mongo : {
        development : {
            connection_string: '${mongo_dev}'
        },
        production : {
            connection_string: '${mongo_production}'
        },
    }
};
EOL