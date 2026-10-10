### Database disaster recovery

Backups are created automatically and stored in the `postgres_backups`
Docker volume.

Test a backup restore without touching the live database:

```bash
docker compose exec backup \
  /usr/local/bin/restore.sh /backups/<backup-file>