#!/bin/bash
for file in app/admin/pools/page.tsx app/admin/audit/page.tsx app/admin/setup/page.tsx app/admin/users/create/page.tsx app/investor/wallet/page.tsx app/investor/pools/page.tsx app/investor/pools/\[id\]/page.tsx app/sme/applications/new/page.tsx app/sme/applications/\[id\]/page.tsx; do
  if [ -f "$file" ]; then
    # Check if it already has the export
    if ! grep -q "export const dynamic = " "$file"; then
      # Add after 'use client'
      sed -i "/'use client';/a \\nexport const dynamic = 'force-dynamic';" "$file"
    fi
  fi
done
