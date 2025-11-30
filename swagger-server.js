const http = require('http');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PORT = 3000;

// Read and parse the YAML file
let swaggerDoc;
try {
    swaggerDoc = yaml.load(fs.readFileSync('./portainer.yaml', 'utf8'));
    console.log('Swagger YAML loaded successfully');
} catch (error) {
    console.error('Error loading YAML:', error.message);
    process.exit(1);
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/api-docs') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Portainer API Docs</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js"></script>
    <script>
        const ui = SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: 'StandaloneLayout',
            deepLinking: true
        });
    </script>
</body>
</html>
        `;
        res.end(html);
        return;
    }

    if (req.url === '/swagger.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(swaggerDoc, null, 2));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
