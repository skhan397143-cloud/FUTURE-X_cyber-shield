(() => {
  "use strict";

  const CRITICAL_PORTS = [
    { port: 21, service: "FTP" },
    { port: 22, service: "SSH" },
    { port: 23, service: "TELNET" },
    { port: 25, service: "SMTP" },
    { port: 53, service: "DNS" },
    { port: 80, service: "HTTP" },
    { port: 110, service: "POP3" },
    { port: 135, service: "RPC" },
    { port: 139, service: "NETBIOS" },
    { port: 443, service: "HTTPS" },
    { port: 445, service: "SMB" },
    { port: 3306, service: "MYSQL" },
    { port: 3389, service: "RDP" },
    { port: 5432, service: "POSTGRES" },
    { port: 8080, service: "HTTP-ALT" },
    { port: 8443, service: "HTTPS-ALT" }
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
    { country: "United States", flag: "🇺🇸" },
    { country: "India", flag: "🇮🇳" },
    { country: "Germany", flag: "🇩🇪" },
    { country: "Singapore", flag: "🇸🇬" },
    { country: "United Kingdom", flag: "🇬🇧" },
    { country: "Japan", flag: "🇯🇵" },
    { country: "Netherlands", flag: "🇳🇱" },
    { country: "Ireland", flag: "🇮🇪" },
    { country: "Australia", flag: "🇦🇺" },
    { country: "Brazil", flag: "🇧🇷" }
  ];

  const HIGH_RISK_PORTS = new Set([21, 22, 23, 25, 110, 135, 139, 445, 3306, 3389, 5432, 8080]);
  const BASELINE_ACCEPT_PORTS = [80, 443];

  const els = {
    clock: document.getElementById("simClock"),
    cpuValue: document.getElementById("cpuValue"),
    cpuFill: document.getElementById("cpuFill"),
    cpuMeter: document.getElementById("cpuMeter"),
    memValue: document.getElementById("memValue"),
    memFill: document.getElementById("memFill"),
    memMeter: document.getElementById("memMeter"),
    memDetail: document.getElementById("memDetail"),
    sockState: document.getElementById("sockState"),
    sockListen: document.getElementById("sockListen"),
    sockEst: document.getElementById("sockEst"),
    sockWait: document.getElementById("sockWait"),
    sockClosed: document.getElementById("sockClosed"),
    reportCount: document.getElementById("reportCount"),
    domainIngest: document.getElementById("domainIngest"),
    executeScan: document.getElementById("executeScan"),
    ingestStatus: document.getElementById("ingestStatus"),
    reportStream: document.getElementById("reportStream"),
    toast: document.getElementById("toast")
  };

  let reportTotal = 0;
  let toastTimer = 0;

  function cryptoByte() {
    const buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }

  function cryptoInt(maxExclusive) {
    if (maxExclusive <= 0) {
      return 0;
    }
    const limit = Math.floor(256 / maxExclusive) * maxExclusive;
    let value = cryptoByte();
    while (value >= limit) {
      value = cryptoByte();
    }
    return value % maxExclusive;
  }

  function pick(list) {
    return list[cryptoInt(list.length)];
  }

  function simulateIp(provider) {
    const pair = pick(provider.blocks);
    const third = 1 + cryptoInt(254);
    const fourth = 1 + cryptoInt(254);
    return `${pair[0]}.${pair[1]}.${third}.${fourth}`;
  }

  function simulatePortStatus(port) {
    const roll = cryptoInt(100);
    if (port === 443) {
      return roll < 88 ? "SECURE" : "OPEN";
    }
    if (port === 80) {
      return roll < 70 ? "OPEN" : "SECURE";
    }
    if (HIGH_RISK_PORTS.has(port)) {
      if (roll < 42) {
        return "OPEN";
      }
      if (roll < 78) {
        return "CLOSED";
      }
      return "SECURE";
    }
    if (roll < 55) {
      return "SECURE";
    }
    if (roll < 80) {
      return "CLOSED";
    }
    return "OPEN";
  }

  function statusLabel(entry, status) {
    const base = `${entry.port} [${entry.service}]`;
    if (status === "OPEN") {
      return `${base} - OPEN 🟢`;
    }
    if (status === "SECURE") {
      return `${base} - SECURE ✅`;
    }
    return `${base} - CLOSED 🔒`;
  }

  function isVulnerable(entry, status) {
    return status === "OPEN" && HIGH_RISK_PORTS.has(entry.port);
  }

  function buildFirewallScript(domain, mappings) {
    const lines = [];
    lines.push(`# FUTURE-X Cyber Shield — Auto-Generated Firewall Policy`);
    lines.push(`# Asset: ${domain}`);
    lines.push(`# Mode: local simulated assessment (no live probe)`);
    lines.push(`# Flushing is intentionally omitted. Append-only hardening.`);
    lines.push(``);

    const vulnerable = mappings.filter((row) => row.vulnerable);
    if (vulnerable.length === 0) {
      lines.push(`# No high-risk OPEN ports in this simulated map.`);
      lines.push(`# DROP stanzas still emitted as a fail-closed template.`);
      const fallback = HIGH_RISK_PORTS.values().next().value;
      lines.push(`sudo iptables -A INPUT -p tcp --dport ${fallback} -j DROP`);
    } else {
      lines.push(`# DROP every simulated high-risk OPEN port`);
      vulnerable.forEach((row) => {
        lines.push(`sudo iptables -A INPUT -p tcp --dport ${row.port} -j DROP`);
      });
    }

    lines.push(``);
    lines.push(`# Baseline secure accept parameters`);
    lines.push(`sudo iptables -A INPUT -i lo -j ACCEPT`);
    lines.push(`sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT`);
    BASELINE_ACCEPT_PORTS.forEach((port) => {
      lines.push(`sudo iptables -A INPUT -p tcp --dport ${port} -j ACCEPT`);
    });
    lines.push(`sudo iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 2/s -j ACCEPT`);
    lines.push(`sudo iptables -P INPUT DROP`);
    lines.push(`sudo iptables -P FORWARD DROP`);
    lines.push(`sudo iptables -P OUTPUT ACCEPT`);
    lines.push(`sudo iptables-save`);
    return lines.join("\n");
  }

  function parseDomains(raw) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("show");
    }, 2200);
  }

  async function copyScript(script, button) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(script);
      } else {
        const helper = document.createElement("textarea");
        helper.value = script;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      button.textContent = "COPIED";
      showToast("Firewall policy copied to clipboard");
      window.setTimeout(() => {
        button.textContent = "Copy Script";
      }, 1400);
    } catch (err) {
      showToast("Clipboard unavailable in this context");
    }
  }

  function createReportCard(domain) {
    const provider = pick(PROVIDER_BLOCKS);
    const location = pick(NODE_LOCATIONS);
    const ip = simulateIp(provider);
    const mappings = CRITICAL_PORTS.map((entry) => {
      const status = simulatePortStatus(entry.port);
      return {
        port: entry.port,
        service: entry.service,
        status,
        label: statusLabel(entry, status),
        vulnerable: isVulnerable(entry, status)
      };
    });

    const script = buildFirewallScript(domain, mappings);
    const card = document.createElement("article");
    card.className = "asset-card";

    const head = document.createElement("div");
    head.className = "asset-card-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = domain.toUpperCase();
    const sub = document.createElement("p");
    sub.className = "asset-meta";
    sub.textContent = "Standalone Asset Perimeter Report — simulated mapping";
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    head.appendChild(titleWrap);

    const body = document.createElement("div");
    body.className = "asset-body";

    const meta = document.createElement("div");
    meta.className = "meta-grid";
    const tiles = [
      ["Target Enterprise Domain", domain.toUpperCase()],
      ["Real-World Resolved IP Address", ip],
      ["Global Physical Node Location", `${location.country} ${location.flag}`],
      ["Discovered Network Host Provider / ISP", provider.name]
    ];
    tiles.forEach(([label, value]) => {
      const tile = document.createElement("div");
      tile.className = "meta-tile";
      const span = document.createElement("span");
      span.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      tile.appendChild(span);
      tile.appendChild(strong);
      meta.appendChild(tile);
    });

    const portMap = document.createElement("div");
    portMap.className = "port-map";
    mappings.forEach((row) => {
      const line = document.createElement("div");
      line.className = `port-row ${row.status.toLowerCase()}`;
      line.textContent = row.label;
      portMap.appendChild(line);
    });

    const policyWrap = document.createElement("div");
    policyWrap.className = "policy-wrap";
    const policyBar = document.createElement("div");
    policyBar.className = "policy-bar";
    const policyTitle = document.createElement("h4");
    policyTitle.textContent = "Auto-Generated Firewall Policy Script";
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy Script";
    copyBtn.addEventListener("click", () => {
      copyScript(script, copyBtn);
    });
    policyBar.appendChild(policyTitle);
    policyBar.appendChild(copyBtn);

    const pre = document.createElement("pre");
    pre.className = "policy-script";
    pre.textContent = script;

    policyWrap.appendChild(policyBar);
    policyWrap.appendChild(pre);

    body.appendChild(meta);
    body.appendChild(portMap);
    body.appendChild(policyWrap);
    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function updateClock() {
    const now = new Date();
    els.clock.textContent = now.toISOString().slice(11, 19) + "Z";
  }

  function updateTelemetry() {
    const cpu = 12 + cryptoInt(68);
    const mem = 28 + cryptoInt(52);
    const usedGb = ((mem / 100) * 64).toFixed(1);
    els.cpuValue.textContent = `${cpu}%`;
    els.cpuFill.style.width = `${cpu}%`;
    els.cpuMeter.setAttribute("aria-valuenow", String(cpu));
    els.memValue.textContent = `${mem}%`;
    els.memFill.style.width = `${mem}%`;
    els.memMeter.setAttribute("aria-valuenow", String(mem));
    els.memDetail.textContent = `${usedGb} / 64 GB`;

    const listen = 18 + cryptoInt(40);
    const est = 40 + cryptoInt(180);
    const wait = cryptoInt(30);
    const closed = 200 + cryptoInt(400);
    els.sockListen.textContent = String(listen);
    els.sockEst.textContent = String(est);
    els.sockWait.textContent = String(wait);
    els.sockClosed.textContent = String(closed);
    els.sockState.textContent = cpu > 72 ? "ELEVATED" : "NOMINAL";
  }

  function executeBulkScan() {
    const domains = parseDomains(els.domainIngest.value);
    if (domains.length === 0) {
      els.ingestStatus.textContent = "Ingestor empty. Provide comma-separated domains.";
      return;
    }

    els.executeScan.disabled = true;
    els.ingestStatus.textContent = `Generating ${domains.length} simulated perimeter report(s)…`;

    domains.forEach((domain) => {
      const card = createReportCard(domain);
      els.reportStream.appendChild(card);
      reportTotal += 1;
    });

    els.reportCount.textContent = String(reportTotal);
    els.ingestStatus.textContent = `Appended ${domains.length} report(s). Session total: ${reportTotal}.`;
    els.executeScan.disabled = false;
  }

  els.executeScan.addEventListener("click", executeBulkScan);
  els.domainIngest.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      executeBulkScan();
    }
  });

  updateClock();
  updateTelemetry();
  window.setInterval(updateClock, 1000);
  window.setInterval(updateTelemetry, 1800);
})();

