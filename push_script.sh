#!/bin/bash
echo "Starting git push sequence..." > push_log.txt
git add . >> push_log.txt 2>&1
git commit -m "Feat: Complete schema update, Admin Dashboard, and Tracking page" >> push_log.txt 2>&1
git push origin main >> push_log.txt 2>&1
echo "Done." >> push_log.txt
