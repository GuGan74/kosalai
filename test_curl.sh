#!/bin/bash
curl -s -X POST 'https://ulbrlhcelwoojwnvznrd.supabase.co/rest/v1/listings' \
-H "apikey: sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i" \
-H "Authorization: Bearer sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i" \
-H "Content-Type: application/json" \
-H "Prefer: return=representation" \
-d '{
  "title": "Curl Test",
  "category": "cow",
  "status": "active"
}'
