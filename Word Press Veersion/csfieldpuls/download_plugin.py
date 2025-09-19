#!/usr/bin/env python3

import os
import ftplib
from pathlib import Path

# FTP credentials
FTP_HOST = "ftp.csfieldpulse.com"
# Try different username formats
FTP_USERS = ["peyton@csfieldpulse.com", "peyton", "csfieldpulse.com|peyton", "peyton@csfieldpulse"]
FTP_PASS = "P2320084323228f!"
FTP_PORT = 21

def download_directory(ftp, remote_dir, local_dir):
    """Recursively download a directory from FTP server"""
    Path(local_dir).mkdir(parents=True, exist_ok=True)
    
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
                    print(f"Creating directory: {local_path}")
                    download_directory(ftp, name, local_path)
                    ftp.cwd('..')  # Go back to parent directory
            else:  # File
                local_path = os.path.join(local_dir, name)
                print(f"Downloading: {name} -> {local_path}")
                with open(local_path, 'wb') as f:
                    ftp.retrbinary(f'RETR {name}', f.write)

def main():
    try:
        # Connect to FTP server
        print(f"Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        
        # Login
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully")
        
        # List root directory
        print("\nListing root directory:")
        ftp.dir()
        
        # Navigate to WordPress plugins directory
        # Common WordPress paths
        wp_plugin_paths = [
            '/public_html/wp-content/plugins',
            '/wp-content/plugins',
            '/httpdocs/wp-content/plugins',
            '/www/wp-content/plugins',
            '/plugins'
        ]
        
        plugin_found = False
        for path in wp_plugin_paths:
            try:
                ftp.cwd(path)
                print(f"\nFound plugins directory at: {path}")
                
                # List plugins
                print("\nAvailable plugins:")
                plugins = []
                ftp.dir(plugins.append)
                
                for plugin in plugins:
                    print(plugin)
                    # Look for CS Field Pulse plugin
                    if 'csfield' in plugin.lower() or 'pulse' in plugin.lower():
                        parts = plugin.split(None, 8)
                        if len(parts) >= 9:
                            plugin_name = parts[8]
                            if parts[0][0] == 'd':  # It's a directory
                                print(f"\nFound CS Field Pulse plugin: {plugin_name}")
                                
                                # Download the plugin
                                local_dir = f"./csfieldpulse-plugin"
                                print(f"Downloading to: {local_dir}")
                                download_directory(ftp, plugin_name, local_dir)
                                plugin_found = True
                                break
                
                if plugin_found:
                    break
                    
            except ftplib.error_perm:
                continue
        
        if not plugin_found:
            print("\nCS Field Pulse plugin not found in standard locations.")
            print("Listing all directories from root to help locate it...")
            ftp.cwd('/')
            ftp.dir()
        
        ftp.quit()
        print("\nFTP session closed.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()