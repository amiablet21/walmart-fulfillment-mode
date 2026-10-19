#!/bin/bash
# Builds the macOS .dmg for Seller Center - Fulfillment Mode.
# Run on a Mac from the repo root:  bash installer/macos/build-dmg.sh 1.2.3
#
# The disk image holds no app (so macOS Gatekeeper has nothing to block):
# just the extension folder, a shortcut to Applications to drag it onto,
# and the install steps.
set -euo pipefail

VERSION="${1:?usage: build-dmg.sh <version>}"
NAME="Seller Center Fulfillment Mode"
EXT_DIR="Fulfillment Mode Extension"

STAGE="$(mktemp -d)/$NAME"
mkdir -p "$STAGE/$EXT_DIR" dist
cp manifest.json config.js content.js "$STAGE/$EXT_DIR/"
ln -s /Applications "$STAGE/Applications"

cat > "$STAGE/INSTALL - read me first.txt" <<EOF
SELLER CENTER - FULFILLMENT MODE  (version $VERSION)

INSTALL (one time, about 2 minutes)
1. Drag the "$EXT_DIR" folder onto the "Applications" shortcut
   in this window. It must stay there, so don't delete it later.
2. Open Chrome and go to:  chrome://extensions
3. Turn on "Developer mode" (top right). Leave it on.
4. Click "Load unpacked".
5. Press Cmd+Shift+G, type  /Applications/$EXT_DIR
   press Return, then click "Select".

UPDATING
Drag the new "$EXT_DIR" folder onto Applications and choose Replace,
then click the reload arrow on the extension in chrome://extensions.

WHAT IT DOES
Hides the GMV graph, the Current Balance tile and dollar amounts on the
Seller Center homepage, and blocks Payments and Analytics.
Install it only on employee computers.
EOF

OUT="dist/SellerCenterFulfillmentMode-$VERSION.dmg"
hdiutil create -volname "$NAME" -srcfolder "$STAGE" -ov -format UDZO "$OUT"
echo "Built $OUT"
