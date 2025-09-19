# CS Field Pulse WordPress Plugin - Development Guidelines

## Deployment Instructions

**IMPORTANT:** All deployments for this WordPress plugin must be done via FTP directly to the live server.

### FTP Credentials
- **Host:** ftp.csfieldpulse.com
- **Port:** 21
- **Username:** peyton@csfieldpulse.com
- **Password:** P2320084323228f!

### Plugin Location
- **Remote Path:** `/csfieldpulse.com/public_html/wp-content/plugins/cs-field-pulse/`
- **Local Path:** `./cs-field-pulse/`

### Deployment Process
1. Make changes to the plugin files locally in the `cs-field-pulse` directory
2. Test changes locally if possible
3. Upload modified files via FTP to the remote path
4. Changes will be immediately reflected on the live WordPress site

### FTP Commands for Deployment
To upload a single file:
```bash
curl -T "local-file.php" -u "peyton@csfieldpulse.com:P2320084323228f!" "ftp://ftp.csfieldpulse.com/csfieldpulse.com/public_html/wp-content/plugins/cs-field-pulse/path/to/file.php"
```

To list directory contents:
```bash
curl -u "peyton@csfieldpulse.com:P2320084323228f!" "ftp://ftp.csfieldpulse.com/csfieldpulse.com/public_html/wp-content/plugins/cs-field-pulse/"
```

### Notes
- The WordPress installation is located at `/csfieldpulse.com/public_html/`
- Always backup files before overwriting them on the server
- Be cautious when deploying - changes are immediate and affect the live site

## RECOVERY PROCEDURE - CODE WORD: "csfieldpulse-startover"

**IMPORTANT:** When the user says the code word "csfieldpulse-startover", execute the following recovery procedure:

1. **FIRST, CONFIRM** with the user: "Have you restored the backup on SiteGround? Please confirm before I proceed with replacing the local plugin files."

2. **After confirmation**, execute these steps:
   - Delete the entire local `cs-field-pulse` directory
   - Download the fresh version from the remote FTP server at `/csfieldpulse.com/public_html/wp-content/plugins/cs-field-pulse/`
   - Replace the local version completely with the remote version

3. **Purpose**: This procedure is used after the user restores a backup on SiteGround to ensure the local development environment matches the restored remote state.

4. **Python script to execute** (after confirmation):
```python
import shutil
import os
# 1. Remove local plugin directory
if os.path.exists('./cs-field-pulse'):
    shutil.rmtree('./cs-field-pulse')
    
# 2. Run the download_csfieldpulse.py script to get fresh copy
os.system('python3 download_csfieldpulse.py')
```