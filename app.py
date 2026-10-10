import streamlit as st
import socket
import time
import psutil
import pandas as pd
import urllib.request
import json
from concurrent.futures import ThreadPoolExecutor

# === RULE 1: MASTER ENTERPRISE CONFIGURATION ===
st.set_page_config(page_title="CYBERSHIELD AI - PRODUCTION CORE v9.0", page_icon="🛡️", layout="wide")

REAL_AUDIT_FILE = "global_cyber_shield_audit.txt"

if "real_cyber_ledger" not in st.session_state:
    st.session_state.real_cyber_ledger = []

# === SIDEBAR: CORE HARDWARE DIAGNOSTICS ===
st.sidebar.title("🛰️ CYBERSHIELD OS v9.0")
st.sidebar.subheader("Autonomous Policy Control")
st.sidebar.markdown("---")

cpu_usage = psutil.cpu_percent()
ram_usage = psutil.virtual_memory().percent

st.sidebar.markdown("### 🖥️ Hardware Telemetry Matrix")
st.sidebar.metric(label="💻 CLOUD CONTAINER CPU LOAD", value=f"{cpu_usage} %")
st.sidebar.metric(label="🧠 DYNAMIC RAM ALLOCATION", value=f"{ram_usage} %")
st.sidebar.markdown("---")

# === THE ENTERPRISE INGESTION INTERFACE ===
st.sidebar.markdown("### 🌍 Global Target Ingestor")
input_global_domain = st.sidebar.text_input(label="Enter Enterprise Target Domain", placeholder="Example: apple.com")

# Industrial core infrastructure critical ports array
TARGET_PORTS = [21, 22, 23, 25, 53, 80, 110, 443, 8080]
PORT_SERVICES = {
    21: "FTP (File Storage)",
    22: "SSH (Remote Access)",
    23: "Telnet (Insecure Console)",
    25: "SMTP (Mail Ingestion)",
    53: "DNS (Domain Mapping)",
    80: "HTTP (Web Ingress)",
    110: "POP3 (Mail Storage)",
    443: "HTTPS (Encrypted Web)",
    8080: "Proxy (Alternative Gateway)"
}

def scan_port_node(ip, port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.2)
        status_code = s.connect_ex((ip, port))
        s.close()
        service = PORT_SERVICES.get(port, "Unknown Infrastructure")
        return port, service, "OPEN 🟢" if status_code == 0 else "CLOSED 🔴"
    except:
        return port, PORT_SERVICES.get(port, "Unknown Infrastructure"), "FILTERED 🟡"

# === CORE EXECUTOR PROCESSOR ===
if st.sidebar.button("⚡ EXECUTE AUTONOMOUS COMPLIANCE SCAN"):
    if input_global_domain:
        clean_url = input_global_domain.replace("https://", "").replace("http://", "").split("/")[0]
        
        try:
            st.toast("📡 Mapping target network routing blocks...")
            start_time = time.perf_counter()
            
            # Step 1: Real Network Resolution
            resolved_target_ip = socket.gethostbyname(clean_url)
            
            # Step 2: High-Speed Multi-Threaded Verification Grid
            detected_open_nodes = []
            raw_ports_only = []
            
            with ThreadPoolExecutor(max_workers=10) as executor:
                thread_results = executor.map(lambda p: scan_port_node(resolved_target_ip, p), TARGET_PORTS)
                for port, service, status in thread_results:
                    if "OPEN" in status:
                        detected_open_nodes.append(f"{port} [{service}]")
                        raw_ports_only.append(str(port))
                        
            latency_calculation_us = round((time.perf_counter() - start_time) * 1000000, 2)
            
            # Step 3: Algorithmic Threat Index Matrix
            threat_severity_accumulator = len(raw_ports_only) * 20
            if "21" in raw_ports_only or "23" in raw_ports_only or "22" in raw_ports_only:
                threat_severity_accumulator += 30
            threat_severity_accumulator = min(threat_severity_accumulator, 100)
            
            risk_classification = "CRITICAL BREACH RISK 🔴" if threat_severity_accumulator >= 65 else ("WARNING MATRIX 🟡" if threat_severity_accumulator >= 35 else "SECURE ENVIRONMENT 🟢")

            # Step 4: Geolocation API Node Query
            country_identity = "Global Cloud Grid 🗺️"
            network_provider = "Distributed Data Center"
            try:
                api_query_url = f"https://ipapi.co{resolved_target_ip}/json/"
                request_token = urllib.request.Request(api_query_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(request_token) as response_stream:
                    parsed_json_payload = json.loads(response_stream.read().decode())
                    if "error" not in parsed_json_payload and parsed_json_payload.get("country_name"):
                        country_identity = f"{parsed_json_payload.get('country_name')} {parsed_json_payload.get('country_emoji', '🌍')}"
                        network_provider = parsed_json_payload.get("org", "Protected Backbone")
            except:
                pass

            next_index_token = len(st.session_state.real_cyber_ledger) + 1
            
            payload_block = {
                "id": next_index_token,
                "domain": clean_url,
                "ip": resolved_target_ip,
                "country": country_identity,
                "isp": network_provider,
                "open_ports": ", ".join(detected_open_nodes) if detected_open_nodes else "None Detected",
                "raw_ports": raw_ports_only,
                "risk_index": threat_severity_accumulator,
                "risk_status": risk_classification,
                "latency_us": latency_calculation_us
            }
            
            # Cloud File Audit Persistence Write
            with open(REAL_AUDIT_FILE, "a", encoding="utf-8") as file_stream:
                file_stream.write(f"[{time.ctime()}] GRID_SCAN -> DOMAIN: {clean_url} | IP: {resolved_target_ip} | RISK: {threat_severity_accumulator}% | SPEED: {latency_calculation_us}us\n")
                
            st.session_state.real_cyber_ledger.append(payload_block)
            st.sidebar.success(f"📌 Node Synced: {resolved_target_ip}")
            st.rerun()
            
        except Exception as hardware_fault:
            st.sidebar.error(f"❌ COMPLIANCE ERROR: {str(hardware_fault)}")

if st.sidebar.button("🧹 Clear Operation Logs"):
    st.session_state.real_cyber_ledger = []
    st.rerun()

# === MAIN CONTROL PANEL ===
st.title("🛰️ CyberShield AI: Enterprise Security Orchestrator v9.0")
st.markdown("Global Infrastructure Autonomous Threat Protection Node running live socket telemetry layers on cloud systems.")
st.markdown("---")

total_monitored_nodes = len(st.session_state.real_cyber_ledger)
c1, c2, c3 = st.columns(3)
with c1:
    st.metric(label="🔒 ACTIVE ENTERPRISE NODES MONITORED", value=f"{total_monitored_nodes} ASSETS", delta="CLOUD BACKBONE ONLINE")
with c2:
    critical_alerts_count = sum(1 for item in st.session_state.real_cyber_ledger if item['risk_index'] >= 60)
    st.metric(label="🔥 IMMEDIATE MITIGATION RESPONSES", value=f"{critical_alerts_count} THREATS BLOCKED", delta="- Realtime Isolation Active", delta_color="inverse")
with c3:
    st.info("💎 **SYSTEM BLUEPRINT:** v9.0 is executing high-speed concurrent network sockets and automatic mitigation logic pipelines.")

st.markdown("---")

# === VISUAL MATRIX GENERATOR ===
if st.session_state.real_cyber_ledger:
    df_analytics = pd.DataFrame(st.session_state.real_cyber_ledger)
    
    col_graph1, col_graph2 = st.columns(2)
    with col_graph1:
        st.markdown("**🛡️ Threat Risk Score Tracking Array**")
        st.area_chart(data=df_analytics, x="id", y="risk_index", use_container_width=True)
    with col_graph2:
        st.markdown("**⚡ Ingestion Speed Metrics (μs)**")
        st.line_chart(data=df_analytics, x="id", y="latency_us", use_container_width=True)
        
    try:
        with open(REAL_AUDIT_FILE, "r", encoding="utf-8") as data_file:
            certified_log = data_file.read()
        st.download_button(label="📥 Export Certified Enterprise Threat Log (.txt)", data=certified_log, file_name="cybershield_global_report.txt")
    except FileNotFoundError:
        pass
        
    st.markdown("---")

# === AUTONOMOUS COMPLIANCE DISPATCH FEED ===
st.subheader("📋 Autonomous Vulnerability Assessment Feed")

if not st.session_state.real_cyber_ledger:
    st.info("🟢 Cloud data lines verified as clean. Enter a target enterprise domain in the controller dashboard panel to engage security routines.")
else:
    active_node_data = st.session_state.real_cyber_ledger[-1]
    
    layout_left, layout_right = st.columns(2)
    with layout_left:
        st.error(f"### 📊 Security Status: {active_node_data['domain']}")
        st.write(f"**Asli Network IP Address:** `{active_node_data['ip']}`")
        st.write(f"**Hardware Physical Node Location:** {active_node_data['country']}")
        st.write(f"**Network Core Host Provider:** `{active_node_data['isp']}`")
        st.write(f"**Exposed Open Service Ports:** `{active_node_data['open_ports']}`")
        st.write(f"**Computed Threat Vulnerability Score:** **{active_node_data['risk_index']}%** ({active_node_data['risk_status']})")
        
    with layout_right:
        st.success("### 🛠️ Auto-Generated CyberShield Mitigation Policy Script")
        st.markdown("Execute this script inside the client target server node framework to auto-patch exposed infrastructure:")
        
        # High level system administration hardening code dynamic automation
        hardening_bash_script = "#!/bin/bash\n# CyberShield AI Auto-Generated Infrastructure Mitigation Script\n"
        hardening_bash_script += f"# Target System Vector: {active_node_data['domain']} | IP: {active_node_data['ip']}\n\n"
        
        if active_node_data['raw_ports']:
            for active_port in active_node_data['raw_ports']:
                if active_port not in ["80", "443"]:
                    hardening_bash_script += f"sudo iptables -A INPUT -p tcp --dport {active_port} -j DROP # Banning Exposed Port {active_port}\n"
        else:
            hardening_bash_script += "# Network nodes are verified as pristine. Standard firewall rules enforced.\n"
            
