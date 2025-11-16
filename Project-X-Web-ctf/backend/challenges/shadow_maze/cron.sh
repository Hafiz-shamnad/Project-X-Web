#!/bin/bash

# vulnerable cron task (runs as root)
echo "[CRON] Running at $(date)" >> /tmp/cron.log
