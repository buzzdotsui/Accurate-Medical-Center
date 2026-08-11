#!/bin/bash
# Accurate Medical Center - DB Backup Script
# This script should be run via cron, e.g., daily at 2AM
# 0 2 * * * /path/to/backup-db.sh >> /var/log/db_backup.log 2>&1

set -e

# Configuration
DB_NAME="accurate_medical"
DB_USER="postgres"
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="db_backup_${DATE}.sql.gz"
S3_BUCKET="s3://accurate-medical-backups"

echo "Starting database backup at ${DATE}..."

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Run pg_dump (Assumes .pgpass is configured for authentication)
pg_dump -U ${DB_USER} ${DB_NAME} | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Backup created: ${BACKUP_DIR}/${FILENAME}"

# Optional: Upload to AWS S3
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp "${BACKUP_DIR}/${FILENAME}" "${S3_BUCKET}/${FILENAME}"
    echo "Upload complete."
else
    echo "AWS CLI not installed. Skipping S3 upload."
fi

# Cleanup old backups (keep last 7 days locally)
echo "Cleaning up local backups older than 7 days..."
find "${BACKUP_DIR}" -type f -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup process completed successfully."
