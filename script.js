(() => {
  "use strict";

  const CRITICAL_PORTS = [
    { port: 21, service: "FTP" }, { port: 22, service: "SSH" },
    { port: 23, service: "TELNET" }, { port: 25, service: "SMTP" },
    { port: 53, service: "DNS" }, { port: 80, service: "HTTP" },
    { port: 110, service: "POP3" }, { port: 135, service: "RPC" },
    { port: 139, service: "NETBIOS" }, { port: 443, service: "HTTPS" },
    { port: 445, service: "SMB" }, { port: 3306, service: "MYSQL" },
    { port: 3389, service: "RDP" }, { port: 5432, service: "POSTGRES" },
    { port: 8080, service: "HTTP-ALT" }, { port: 8443, service: "HTTPS-ALT" }
  ];

  const PROVIDER_BLOCKS = [
    { name: "Cloudflare", blocks: [[104, 16], [104, 17], [104, 21], [104, 244]] },
    { name: "AWS Backbone", blocks: [[3, 80], [13, 32], [52, 95], [54, 230]] },
    { name: "Akamai", blocks: [[23, 32], [23, 48], [104, 64]] },
    { name: "Google Front End", blocks: [[142, 250], [172, 217]] },
    { name: "Microsoft Azure Edge", blocks: [[20, 36], [40, 74]] },
    { name: "Fastly", blocks: [[151, 101], [199, 232]] }
  ];

  const NODE_LOCATIONS = [
    { country: "United States", flag: "🇺🇸" }, { country: "India", flag: "🇮🇳" },
    { country: "Germany", flag: "🇩🇪" }, { country: "Singapore", flag: "🇸🇬" },
    { country: "United Kingdom", flag: "🇬🇧" }, { country: "Japan", flag: "🇯🇵" }
  ];

  const HIGH_RISK_PORTS = new Set([21, 22, 23, 25, 110, 135, 139, 445, 3306, 3389, 5432, 8080]);
  const BASELINE_ACCEPT_PORTS =;

  const els = {
    clock: document.getElementById("simClock"),
    cpuValue: document.getElementById("cpuValue"), cpuFill: document.getElementById("cpuFill"),
    memValue: document.getElementById("memValue"), memFill: document.getElementById("memFill"),
    memDetail: document.getElementById("memDetail"), sockState: document.getElementById("sockState"),
    sockListen: document.getElementById("sockListen"), sockEst: document.getElementById("sockEst"),
    sockWait: document.getElementById("sockWait"), sockClosed: document.getElementById("sockClosed"),
    reportCount: document.getElementById("reportCount"), domainIngest: document.getElementById("domainIngest"),
    executeScan: document.getElementById("executeScan"), ingestStatus: document.getElementById("ingestStatus"),
    reportStream: document.getElementById("reportStream"), toast: document.getElementById("toast")
  };

  let reportTotal = 0;
  let toastTimer = 0;

  function cryptoByte() {
    const buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }

  function cryptoInt(maxExclusive) {
    if (maxExclusive <= 0) return 0;
    const limit = Math.floor(256 / maxExclusive) * maxExclusive;
    let value = cryptoByte();
    while (value >= limit) { value = cryptoByte(); }
    return value % maxExclusive;
  }

  function pick(list) { return list[cryptoInt(list.length)]; }

  function simulateIp(provider) {
    const pair = pick(provider.blocks);
    return `\({pair[0]}.\){pair[1]}.1 + cryptoInt(254).{1 + cryptoInt(254)}`;
  }

  function simulatePortStatus(port) {
    const roll = cryptoInt(100);
    if (port === 443) return roll < 88 ? "SECURE" : "OPEN";
    if (port === 80) return roll < 70 ? "OPEN" : "SECURE";
    if (HIGH_RISK_PORTS.has(port)) {
      return roll < 42 ? "OPEN" : (roll < 78 ? "CLOSED" : "SECURE");
    }
    return roll < 55 ? "SECURE" : (roll < 80 ? "CLOSED" : "OPEN");
  }

  function buildFirewallScript(domain, ip, mappings) {
    const lines = [
      `#!/bin/bash`,
      `# FUTURE-X Cyber Shield — Auto-Generated Firewall Policy`,
      `# Asset: domain | Resolved IP: {ip}`,
      `# -----------------------------------------------------------`,
      ``
    ];
    const vulnerable = mappings.filter(row => row.vulnerable);
    if (vulnerable.length === 0) {
      lines.push(`# Enforcing forced baseline protection rules for web host`);
      lines.push(`sudo iptables -A INPUT -p tcp --dport 22 -j DROP # Banning Default Remote Access`);
    } else {
      vulnerable.forEach(row => {
        lines.push(`sudo iptables -A INPUT -p tcp --dport \${row.port} -j DROP # Banning Exposed \${row.service}`);
      });
    }
    lines.push(``, `# Baseline secure accept parameters`);
    lines.push(`sudo iptables -A INPUT -i lo -j ACCEPT`);
    lines.push(`sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT`);
    BASELINE_ACCEPT_PORTS.forEach(port => lines.push(`sudo iptables -A INPUT -p tcp --dport ${port} -j ACCEPT`));
    lines.push(`sudo iptables -P INPUT DROP`, `sudo iptables-save`);
    return lines.join("\n");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  // --- REAL TELEMETRY SIMULATION LOOP ---
  function updateTelemetry() {
    const now = new Date();
    els.clock.textContent = now.toTimeString().split(" ")[0];
    
    const cpu = 20 + cryptoInt(45);
    els.cpuValue.textContent = `${cpu}%`;
    els.cpuFill.style.width = `${cpu}%`;
    
    const mem = 70 + cryptoInt(15);
    els.memValue.textContent = `${mem}%`;
    els.memFill.style.width = `${mem}%`;
    
    const usedMem = (8 * (mem / 100)).toFixed(2);
    els.memDetail.textContent = `${usedMem}GB / 8.00GB allocated`;

    els.sockListen.textContent = 10 + cryptoInt(5);
    els.sockEst.textContent = 25 + cryptoInt(15);
    els.sockWait.textContent = 5 + cryptoInt(10);
    els.sockClosed.textContent = cryptoInt(4);
  }
  window.setInterval(updateTelemetry, 1000);

  // --- CORE DEEP SCAN DISPATCHER ---
  els.executeScan.addEventListener("click", () => {
    const raw = els.domainIngest.value;
    if (!raw) return;

    const domains = raw.split(",").map(d => d.trim()).filter(d => d.length > 0);
    document.getElementById("analyticsSection").style.display = "none";
    els.reportStream.innerHTML = "";

    domains.forEach(domain => {
        const cleanDomain = domain.replace("https://", "").replace("http://", "");
        const provider = pick(PROVIDER_BLOCKS);
        const location = pick(NODE_LOCATIONS);
        const ip = simulateIp(provider);

        const mappings = CRITICAL_PORTS.map(entry => {
            const status = simulatePortStatus(entry.port);
            return {
                port: entry.port, service: entry.service, status,
                vulnerable: (status === "OPEN" && HIGH_RISK_PORTS.has(entry.port))
            };
        });

        const script = buildFirewallScript(cleanDomain, ip, mappings);
        const card = document.article || document.createElement("article");
        card.className = "enterprise-card";

        let portsHtml = "";
        mappings.forEach(row => {
            const color = row.status === "OPEN" ? "#39ff14" : (row.status === "SECURE" ? "#58a6ff" : "#ff3333");
            portsHtml += `<div style="color:${color}; margin-top:2px;">${row.port} [${row.service}] - ${row.status}</div>`;
        });

        card.innerHTML = `
            <h2 class="html-header" style="color: #58a6ff; font-family: inherit; font-weight: bold; margin-top:0; border-left: 5px solid #58a6ff; padding-left: 10px;">🌐 NEURAL ASSET REPORT: ${cleanDomain.toUpperCase()}</h2>
            <div class="grid-container">
                <div class="grid-left">
                    <h3 style="color:#ff3333;margin-top:10px;">📊 Network Ingestion Specs</h3>
                    <p style="margin:4px 0;"><strong>Resolved IP Address:</strong> <code>${ip}</code></p>
                    <p style="margin:4px 0;"><strong>Physical Node Location:</strong> ${location.country} ${location.flag}</p>
                    <p style="margin:4px 0;"><strong>Network Core Provider:</strong> ${provider.name}</p>
                    <p style="margin:4px 0;"><strong>Infrastructure Status:</strong> <span class="neon-text">ACTIVE INTERCEPT</span></p>
                    <h4 style="margin:10px 0 5px 0; color:#58a6ff;">🔍 Scanned Ports Mapping Matrix:</h4>
                    <div class="port-list">${portsHtml}</div>
                </div>
                <div class="grid-right">
                    <h3 style="color:#238636;margin-top:10px;">🛠️ Auto-Generated Firewall Policy Script</h3>
                    <p style="margin:4px 0; font-size:11px; color:#8b949e;">Deploy this rule inside the target server terminal:</p>
                    <pre id="code-${next_id = cryptoInt(99999)}">${script}</pre>
                    <button class="copy-btn" id="btn-${next_id}">📋 Copy Policy Script</button>
                </div>
            </div>
        `;
        els.reportStream.appendChild(card);
        reportTotal++;
        els.reportCount.textContent = reportTotal;

        document.getElementById(`btn-${next_id}`).addEventListener("click", function() {
            navigator.clipboard.writeText(script).then(() => {
                showToast(`🔒 Hardening rules for ${cleanDomain} copied!`);
            });
        });
    });
  });
})();
