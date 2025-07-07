# -*- coding: utf-8 -*-
"""
啟動本地 HTTP 伺服器並自動開啟瀏覽器
適用於 Python 3
"""
import http.server
import socketserver
import webbrowser
import threading
import sys
import os

PORT = 8000

# 啟動伺服器的目錄（自動設為腳本所在目錄）
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}/index.html')

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # 開新執行緒自動開啟瀏覽器
    threading.Timer(1.0, open_browser).start()
    run_server() 