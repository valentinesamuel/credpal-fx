#!/bin/bash
set -e

# If you need additional users beyond the initial POSTGRES_USER
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER ${DATABASE_USER} WITH PASSWORD '${DATABASE_PASSWORD}' SUPERUSER;
EOSQL