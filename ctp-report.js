<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTP Report Module</title>
    <style>
        /* --- REPORT MODULE STYLES (Copy this block) --- */
        
        /* Floating Button */
        #ctp-report-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981; /* Default Emerald, override as needed */
            color: #000;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 8px;
            border: 2px solid #000;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 4px 4px 0px #000;
            transition: transform 0.1s, box-shadow 0.1s;
            text-transform: uppercase;
            font-size: 12px;
        }
        #ctp-report-btn:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px #000;
        }

        /* Report Modal Overlay */
        #ctp-report-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 10000;
            display: none;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(5px);
        }

        /* Report Paper */
        #ctp-report-paper {
            background: #fff;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
            position: relative;
        }

        /* Report Sections */
        .ctp-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .ctp-logo { font-weight: 900; font-size: 24px; letter-spacing: -1px; }
        .ctp-meta { text-align: right; font-size: 11px; line-height: 1.4; color: #555; }
        
        .ctp-section { margin-bottom: 30px; page-break-inside: avoid; }
        .ctp-sec-title { font-weight: 700; border-bottom: 1px solid #ccc; margin-bottom: 10px; padding-bottom: 5px; text-transform: uppercase; font-size: 14px; }
        
        .ctp-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dotted #eee; }
        .ctp-row:last-child { border-bottom: none; }
        .ctp-label { color: #444; }
        .ctp-val { font-weight: 700; }

        /* Actions */
        .ctp-actions { margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; text-align: center; display: flex; gap: 10px; justify-content: center; }
        .ctp-act-btn {
            background: #000; color: #fff; border: none; padding: 10px 20px; font-family: 'JetBrains Mono', monospace; 
            cursor: pointer; font-size: 12px; text-transform: uppercase;
        }
        .ctp-act-btn.close { background: #ccc; color: #000; }

        /* Print Specifics */
        @media print {
            body * { visibility: hidden; }
            #ctp-report-overlay, #ctp-report-paper, #ctp-report-paper * { visibility: visible; }
            #ctp-report-overlay { position: absolute; left: 0; top: 0; background: none; padding: 0; }
            #ctp-report-paper { box-shadow: none; padding: 0; margin: 0; width: 100%; max-width: 100%; }
            .ctp-actions, #ctp-report-btn { display: none !important; }
        }
    </style>
</head>
<body>

    <div id="ctp-report-root">
        <button id="ctp-report-btn" onclick="CTP_Manager.openReport()">View Full Report</button>

        <div id="ctp-report-overlay">
            <div id="ctp-report-paper">
                
                <div class="ctp-header">
                    <div class="ctp-logo">CheckThisPhone<span style="color:#555">.com</span></div>
                    <div class="ctp-meta" id="ctp-meta">
                        </div>
                </div>

                <div id="ctp-report-content">
                    <div style="text-align: center; padding: 40px; color: #888;">
                        No tests run yet. Interact with the page to generate data.
                    </div>
                </div>

                <div class="ctp-actions">
                    <button class="ctp-act-btn close" onclick="CTP_Manager.closeReport()">Close</button>
                    <button class="ctp-act-btn" onclick="window.print()">Print / Save PDF</button>
                </div>

            </div>
        </div>
    </div>

    <script>
        // --- CTP REPORT MANAGER ---
        
        // 1. Global Store
        window.CTP_Report = {
            battery: {},
            display: {},
            audio: {},
            camera: {},
            sensors: {},
            wireless: {},
            vibration: {},
            performance: {},
            network: {},
            software: {},
            hardware: {},
            ux: {},
            meta: {
                startTime: new Date().toLocaleString()
            }
        };

        // 2. System Logic
        const CTP_Manager = {
            
            // Core: Save a result
            saveResult: function(category, testName, result) {
                if (!window.CTP_Report[category]) {
                    window.CTP_Report[category] = {}; // Create cat if missing
                }
                window.CTP_Report[category][testName] = result;
                
                // Optional: Flash button to show activity
                const btn = document.getElementById('ctp-report-btn');
                if(btn) {
                    const originalText = btn.innerText;
                    btn.innerText = "Data Saved!";
                    setTimeout(() => btn.innerText = originalText, 1000);
                }
            },

            // Generate HTML for the report
            generateHTML: function() {
                let html = '';
                const cats = Object.keys(window.CTP_Report).filter(k => k !== 'meta');
                let hasData = false;

                cats.forEach(cat => {
                    const tests = window.CTP_Report[cat];
                    const testNames = Object.keys(tests);
                    
                    if (testNames.length > 0) {
                        hasData = true;
                        html += `<div class="ctp-section">`;
                        html += `<div class="ctp-sec-title">${cat.toUpperCase()} DIAGNOSTICS</div>`;
                        
                        testNames.forEach(name => {
                            let val = tests[name];
                            // Color coding for Pass/Fail
                            let style = '';
                            if(String(val).toLowerCase().includes('pass') || String(val).toLowerCase().includes('good')) style = 'color:green';
                            if(String(val).toLowerCase().includes('fail') || String(val).toLowerCase().includes('bad') || String(val).toLowerCase().includes('error')) style = 'color:red';
                            
                            html += `
                                <div class="ctp-row">
                                    <span class="ctp-label">${name}</span>
                                    <span class="ctp-val" style="${style}">${val}</span>
                                </div>
                            `;
                        });
                        html += `</div>`;
                    }
                });

                if (!hasData) return `<div style="text-align: center; padding: 40px; color: #888;">No tests run yet. Run tests to populate report.</div>`;
                return html;
            },

            // Generate Device Meta Data
            getMeta: function() {
                return `
                    Date: ${new Date().toLocaleString()}<br>
                    UA: ${navigator.userAgent.substring(0, 40)}...<br>
                    Screen: ${window.screen.width}x${window.screen.height} | DPR: ${window.devicePixelRatio}<br>
                    Platform: ${navigator.platform} | Cores: ${navigator.hardwareConcurrency || '?'}
                `;
            },

            // UI Actions
            openReport: function() {
                document.getElementById('ctp-report-content').innerHTML = this.generateHTML();
                document.getElementById('ctp-meta').innerHTML = this.getMeta();
                document.getElementById('ctp-report-overlay').style.display = 'block';
                document.body.style.overflow = 'hidden'; // Lock scroll
            },

            closeReport: function() {
                document.getElementById('ctp-report-overlay').style.display = 'none';
                document.body.style.overflow = 'auto'; // Unlock scroll
            }
        };

        // 3. Global Helper Alias (for easier use in other scripts)
        window.saveResult = CTP_Manager.saveResult;

    </script>

</body>
</html>
