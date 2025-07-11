# -*- coding: utf-8 -*-
"""
啟動本地 HTTP 伺服器並自動開啟瀏覽器
適用於 Python 3
解決 CORS 政策問題，讓音訊檔案能正常載入
"""
import http.server
import socketserver
import webbrowser
import threading
import sys
import os
import time

PORT = 8000
MAX_PORT = 8100

# 啟動伺服器的目錄（自動設為腳本所在目錄）
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加 CORS 標頭，允許跨域請求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 處理預檢請求
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/shutdown':
            self.send_response(200)
            self.end_headers()
            threading.Thread(target=os._exit, args=(0,)).start()
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/shutdown':
            self.send_response(200)
            self.end_headers()
            threading.Thread(target=os._exit, args=(0,)).start()
        else:
            super().do_GET()

def open_browser(port):
    """延遲開啟瀏覽器，確保伺服器已啟動"""
    time.sleep(1.5)
    try:
        webbrowser.open(f'http://localhost:{port}/index.html')
        print(f"✅ 瀏覽器已自動開啟：http://localhost:{port}/index.html")
    except Exception as e:
        print(f"⚠️  無法自動開啟瀏覽器：{e}")
        print(f"請手動開啟：http://localhost:{port}/index.html")

def run_server():
    """啟動 HTTP 伺服器，若 PORT 被佔用則自動遞增"""
    global PORT
    while PORT <= MAX_PORT:
        try:
            with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
                print(f"🚀 伺服器已啟動：http://localhost:{PORT}")
                print(f"📁 服務目錄：{os.getcwd()}")
                print("=" * 50)
                print("🎮 命運節奏遊戲伺服器")
                print("=" * 50)
                print("按 Ctrl+C 停止伺服器")
                print("=" * 50)
                threading.Timer(1.0, open_browser, args=(PORT,)).start()
                httpd.serve_forever()
                break
        except OSError as e:
            if hasattr(e, 'errno') and e.errno == 48 or 'Address already in use' in str(e):
                print(f"❌ 錯誤：端口 {PORT} 已被佔用，嘗試下一個...")
                PORT += 1
                continue
            else:
                print(f"❌ 伺服器啟動失敗：{e}")
                break
        except KeyboardInterrupt:
            print("\n🛑 伺服器已停止")
            break
        except Exception as e:
            print(f"❌ 未知錯誤：{e}")
            break

if __name__ == "__main__":
    run_server() 