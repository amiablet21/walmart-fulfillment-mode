# Seller Center - Fulfillment Mode

A Chrome/Edge extension that keeps employees focused on order fulfillment in
Walmart Seller Center.

With it installed:

- **Homepage** is still there, but the GMV sales graph and the Current Balance
  tile are hidden, and every dollar amount shows as `$•••`.
- **Payments and Analytics** are removed from the sidebar. Opening them by
  address or bookmark redirects to Manage Orders.

Install it only on employee computers or Chrome profiles.

## Files

| File | What it is |
|---|---|
| `config.js` | The only file you should need to edit: blocked pages and homepage options |
| `content.js` | The extension logic |
| `manifest.json` | Chrome extension manifest (Manifest V3, no special permissions) |
| `SETUP.txt` | Step-by-step install and update instructions |
| `installer/` | Windows installer and Mac disk image build scripts |

## Install

Download the Windows `.exe` or Mac `.dmg` from the
[latest release](../../releases/latest) and follow its steps. Or by hand:

1. Download the `.zip` from the release and unzip it somewhere permanent.
2. Open `chrome://extensions` and turn on **Developer mode**. Leave it on.
3. Click **Load unpacked** and pick the folder.

See [SETUP.txt](SETUP.txt) for details, updating, and limits.

## Releasing a new version

1. Bump `version` in `manifest.json` and commit.
2. `git tag v1.2.3 && git push origin main v1.2.3`

GitHub Actions ([release.yml](.github/workflows/release.yml)) then builds the
Windows installer ([Inno Setup script](installer/windows/installer.iss)), the
Mac disk image ([build script](installer/macos/build-dmg.sh)) and the zip, and
publishes them as a release.

## Design

It works from page addresses and on-screen labels ("GMV", "$"), never from
Walmart's page layout, so Walmart redesigns rarely affect it. If something
does change, the worst case is that a number shows again. Order
fulfillment is never affected.
