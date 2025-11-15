import http.server
import socketserver
import webbrowser
import threading
import os
import sys


def run_server(port: int = 8000):
    """Запускает простой HTTP-сервер для текущей директории."""
    handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Сайт доступен по адресу: http://localhost:{port}/")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nОстанавливаем сервер...")


def open_browser(port: int = 8000, page: str = "index.html"):
    url = f"http://localhost:{port}/{page}"
    # Небольшая задержка, чтобы сервер успел подняться
    import time
    time.sleep(1.0)
    webbrowser.open(url)


if __name__ == "__main__":
    # Порт можно передать первым аргументом: python run_dev.py 8080
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[0 if False else 1])
        except ValueError:
            print("Некорректный порт, используется 8000 по умолчанию")
            port = 8000

    # Меняем директорию на папку скрипта (на всякий случай)
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Запускаем сервер в отдельном потоке, чтобы можно было открыть браузер
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    open_browser(port, "new-year.html")

    # Держим основной поток, пока жив сервер
    try:
        while server_thread.is_alive():
            server_thread.join(0.5)
    except KeyboardInterrupt:
        print("\nЗавершение работы.")
