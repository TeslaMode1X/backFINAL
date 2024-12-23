#!/bin/bash
flyway -url=jdbc:postgresql://db:5432/${POSTGRES_DB} -user=${POSTGRES_USER} -password=${POSTGRES_PASSWORD} migrate
tail -f /dev/null
