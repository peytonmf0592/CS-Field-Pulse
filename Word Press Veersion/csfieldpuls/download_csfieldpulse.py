#!/usr/bin/env python3

import os
import ftplib
from pathlib import Path

# FTP credentials
FTP_HOST = "ftp.csfieldpulse.com"
FTP_USER = "peyton@csfieldpulse.com"
FTP_PASS = "P2320084323228f!"
FTP_PORT = 21

def download_file(ftp, remote_file, local_file):
    """Download a single file from FTP"""
    Path(os.path.dirname(local_file)).mkdir(parents=True, exist_ok=True)
    with open(local_file, 'wb') as f:
        ftp.retrbinary(f'RETR {remote_file}', f.write)
    print(f"Downloaded: {remote_file}")

def download_directory(ftp, remote_dir, local_dir):
    """Recursively download a directory from FTP server"""
    Path(local_dir).mkdir(parents=True, exist_ok=True)
    
    # Save current directory
    original_dir = ftp.pwd()
    
    # Change to remote directory
    ftp.cwd(remote_dir)
    
    # Get list of files and directories
    items = []
    ftp.dir(items.append)
    
    for item in items:
        parts = item.split(None, 8)
        if len(parts) >= 9:
            name = parts[8]
            if parts[0][0] == 'd':  # Directory
                if name not in ['.', '..']:
                    local_path = os.path.join(local_dir, name)
                    print(f"Entering directory: {name}")
                    download_directory(ftp, name, local_path)
            else:  # File
                local_path = os.path.join(local_dir, name)
                download_file(ftp, name, local_path)
    
    # Go back to original directory
    ftp.cwd(original_dir)

def main():
    try:
        # Connect to FTP server
        print(f"Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        
        # Login
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully")
        
        # Navigate to the cs-field-pulse directory in WordPress plugins
        remote_path = "/csfieldpulse.com/public_html/wp-content/plugins/cs-field-pulse"
        local_path = "./cs-field-pulse"
        
        print(f"\nDownloading CS Field Pulse plugin from: {remote_path}")
        print(f"To local directory: {local_path}\n")
        
        # Download the entire directory
        download_directory(ftp, remote_path, local_path)
        
        ftp.quit()
        print(f"\n✓ Successfully downloaded CS Field Pulse plugin to {local_path}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()