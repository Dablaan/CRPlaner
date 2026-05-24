import http.server
import socketserver
import urllib.parse
import urllib.request
import urllib.error
import os
import json

PORT = 8000

class DevRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Silenciar los logs de peticiones estáticas estándar para mantener la consola limpia
        if len(args) > 0:
            arg_str = str(args[0])
            if "GET /api/" in arg_str or "404" in arg_str:
                super().log_message(format, *args)
        else:
            pass

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/player':
            # Extraer parámetros de consulta
            query_params = urllib.parse.parse_qs(parsed_url.query)
            tag = query_params.get('tag', [None])[0]
            
            # Cabeceras CORS y de tipo de contenido
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            # 1. Intentar hacer petición real a la API de Supercell si la API Key está configurada
            api_key = os.environ.get('CLASH_ROYALE_API_KEY')
            if api_key and tag:
                # Formatear el tag para la API
                tag_formatted = tag.upper().strip()
                if not tag_formatted.startswith('#'):
                    tag_formatted = '#' + tag_formatted
                api_tag = tag_formatted.replace('#', '%23')
                
                req_url = f"https://api.clashroyale.com/v1/players/{api_tag}"
                req = urllib.request.Request(req_url)
                req.add_header('Authorization', f'Bearer {api_key}')
                req.add_header('Accept', 'application/json')
                
                try:
                    print(f"📡 Realizando consulta real a Supercell para el jugador: {tag_formatted}")
                    with urllib.request.urlopen(req) as response:
                        res_data = json.loads(response.read().decode('utf-8'))
                        # Forzar la impresión inmediata del log
                        print(f"✅ Éxito al obtener los datos reales de {tag_formatted} (Jugador: {res_data.get('name')})")
                        self.wfile.write(json.dumps(res_data, ensure_ascii=False).encode('utf-8'))
                        return
                except urllib.error.HTTPError as he:
                    print(f"⚠️ Error HTTP al consultar la API real: {he.code} - {he.reason}")
                    if he.code == 403:
                        print("❌ [403 Forbidden] La IP desde la que corre el servidor local no está autorizada para esta API Key.")
                        print("👉 PISTA: Entra a https://developer.clashroyale.com/, busca tu API Key y asegúrate de que la IP permitida coincida con tu IP pública actual.")
                    elif he.code == 404:
                        print(f"❌ [404 Not Found] El jugador con tag {tag_formatted} no existe.")
                except Exception as e:
                    print(f"⚠️ Error inesperado al consultar la API real ({e}).")

            # 2. Cargar el perfil mockeado desde ejemplojson.json (Fallback)
            print("💾 Cargando datos simulados de ejemplojson.json (Fallback)...")
            json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'documentacion', 'ejemplojson.json')
            try:
                if os.path.exists(json_path):
                    with open(json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    if tag:
                        tag_formatted = tag.upper().strip()
                        if not tag_formatted.startswith('#'):
                            tag_formatted = '#' + tag_formatted
                        data['tag'] = tag_formatted
                        
                    self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({
                        'error': f'Archivo de base de datos mock ({json_path}) no encontrado.'
                    }, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({'error': f'Error al leer base de datos mock: {str(e)}'}, ensure_ascii=False).encode('utf-8'))
        else:
            # Servir archivos estáticos del directorio actual
            super().do_GET()

# Cambiar el directorio de ejecución al directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Permitir reutilización de puerto
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), DevRequestHandler) as httpd:
    print("\n" + "="*50)
    print(f"🚀 Clash Royale Tracker - Servidor de Desarrollo (Diagnóstico Activo)")
    print(f"📍 URL Local: http://localhost:{PORT}")
    print(f"📂 Sirviendo directorio: {os.getcwd()}")
    print(f"📡 Mock/Real API activa en: http://localhost:{PORT}/api/player")
    print("="*50)
    print("Para detener el servidor, presiona Ctrl+C\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor de desarrollo detenido.")
