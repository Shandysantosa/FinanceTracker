#!/usr/bin/env python3
"""
Simple HTTP server for testing the Finance Tracker application locally.
Run this script to start a local web server at http://localhost:3000
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 3000
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Redirect root to index.html
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def main():
    # Change to the directory containing this script
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    print(f"Starting Finance Tracker Server...")
    print(f"Server will run at: http://{HOST}:{PORT}")
    print(f"Serving files from: {script_dir}")
    print("\nAvailable pages:")
    print(f"  - Dashboard: http://{HOST}:{PORT}/")
    print(f"  - Login: http://{HOST}:{PORT}/login.html")
    print(f"  - Register: http://{HOST}:{PORT}/register.html")
    print(f"  - Add Transaction: http://{HOST}:{PORT}/add.html")
    print(f"  - History: http://{HOST}:{PORT}/history.html")
    print(f"  - Insights: http://{HOST}:{PORT}/insights.html")
    print(f"  - Tips: http://{HOST}:{PORT}/tips.html")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)

    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            # Try to open the browser automatically
            try:
                webbrowser.open(f'http://{HOST}:{PORT}/login.html')
            except:
                pass
            
            print(f"Server started successfully!")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Error: Port {PORT} is already in use.")
            print("Please close other applications using this port or change the PORT variable in this script.")
        else:
            print(f"Error starting server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main() 