; Windows installer for Seller Center - Fulfillment Mode (Inno Setup 6).
; Built by .github/workflows/release.yml:  ISCC /DAppVersion=1.2.3 installer.iss
;
; Chrome only lets users add a non-Web-Store extension themselves, so this
; installer puts the extension in a permanent folder, copies that folder's
; path to the clipboard, opens Chrome's extensions page and shows the
; remaining clicks.

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
#define AppName "Seller Center Fulfillment Mode"

[Setup]
AppId={{8C1F4C1E-5B7A-4E7B-9D0A-3F2B6C1D9E21}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
DefaultDirName={localappdata}\SellerCenterFulfillmentMode
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
PrivilegesRequired=lowest
OutputDir=..\..\dist
OutputBaseFilename=SellerCenterFulfillmentMode-Setup-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName={#AppName}

[Files]
Source: "..\..\manifest.json"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\..\config.js";     DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\..\content.js";    DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\..\SETUP.txt";     DestDir: "{app}";           Flags: ignoreversion

[Run]
; Put the extension folder's path on the clipboard for Chrome's folder picker.
Filename: "{cmd}"; Parameters: "/c echo|set /p=""{app}\extension""|clip"; Flags: runhidden skipifsilent
Filename: "{cmd}"; Parameters: "/c start """" chrome ""chrome://extensions"""; \
  Description: "Open Chrome's extensions page now"; Flags: postinstall runhidden nowait skipifsilent

[Code]
procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = wpFinished then
    WizardForm.FinishedLabel.Caption :=
      'Files installed. Finish in Chrome (one time):' + #13#10 + #13#10 +
      '1. On the Extensions page, turn on "Developer mode" (top right).' + #13#10 +
      '2. Click "Load unpacked".' + #13#10 +
      '3. Click the folder window''s address bar, press Ctrl+V, then Enter,' + #13#10 +
      '    then click "Select Folder".' + #13#10 + #13#10 +
      'Leave Developer mode on.' + #13#10 + #13#10 +
      'The folder is already copied to your clipboard:' + #13#10 +
      ExpandConstant('{app}\extension') + #13#10 + #13#10 +
      'Already set up and installing an update? Just click the reload ' +
      'arrow on the extension in chrome://extensions.' + #13#10 + #13#10 +
      'If the Extensions page did not open, type chrome://extensions ' +
      'into Chrome''s address bar.';
end;
