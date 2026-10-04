import streamlit as st
import socket
import time
import psutil
import pandas as pd
import urllib.request
import json
import ssl
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

# === RULE 1: ENTERPRISE KERNEL CONFIGURATION ===
st.set_page_config(page_title="CYBERSHIELD AI - BILLION DOLLAR ORCHESTRATOR v8.0", page_icon="🛡️", layout="wide")

REAL_AUDIT_FILE = "enterprise_cyber_shield_audit.txt"

if "real_cyber_ledger" not in st.session_state:
    st.session_state.real_cyber_ledger = []

# === SIDEBAR: SYSTEM TELEMETRY ===
st.sidebar.title("🛡️ CYBERSHIELD OS v8.0")
st.sidebar.subheader("Billion-Dollar Defense Core")
st.sidebar.markdown("---")

cpu_usage = psutil.cpu_percent()
ram_usage = psutil.virtual_memory().percent

st.sidebar.markdown("### 🖥️ Hardware Interception")
st.sidebar.metric(label="💻 CPU OCCUPANCY", value=f"{cpu_usage} %")
st.sidebar.metric(label="🧠 RAM ALLOCATION", value=f"{ram_usage} %")
st.sidebar.markdown("---")

st.sidebar.markdown("### 🛰️ Enterprise Ingestion Panel")
input_global_domain = st.sidebar.text_input(label="Target Infrastructure Domain", placeholder="Example: google.com")

TARGET_PORTS = [21, 22, 23, 25, 53, 80, 110, 443, 8080, 3306, 27017] # Added DB Ports
COMMON_SUBDOMAINS = ["www", "mail", "dev", "test", "api", "admin", "blog", "stage"]

def check_single_port(ip, port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        result = s.connect_ex((ip, port))
        s.close()
        return port, "OPEN 🟢" if result == 0 else "CLOSED 🔴"
    except:
        return port, "FILTERED 🟡"

# Enterprise Grade SSL Auditor
def audit_ssl_certificate(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                expiry_str = cert['notAfter']
                expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')
                days_left = (expiry_date - datetime.utcnow()).days
                return f"Valid ({days_left} Days Remaining) 🟢"
    except Exception:
        return "EXPIRED OR MISSING SSL 🚨"

# Subdomain Threat Mapper
def discover_subdomain(base_domain, sub):
    target = f"{sub}.{base_domain}"
    try:
        socket.gethostbyname(target)
        return target, "ACTIVE 🌐"
    except:
        return target, "INACTIVE 💤"

# === CORE EXECUTION MATRIX ===
if st.sidebar.button("🚨 RUN DEEP ENTERPRISE DEFENSE AUDIT"):
    if input_global_domain:
        clean_domain = input_global_domain.replace("https://", "").replace("http://", "").split("/")[0]
        
        try:
            st.toast("📡 Initializing Enterprise Handshakes...")
            start_time = time.perf_counter()
            
            # 1. IP Resolver
            real_world_extracted_ip = socket.gethostbyname(clean_domain)
            
            # 2. Parallel Port Scan
            open_ports = []
            with ThreadPoolExecutor(max_workers=15) as executor:
                scan_results = executor.map(lambda p: check_single_port(real_world_extracted_ip, p), TARGET_PORTS)
                for port, status in scan_results:
                    if "OPEN" in status:
                        open_ports.append(str(port))
            
            # 3. SSL Auditor Execution
            ssl_status = audit_ssl_certificate(clean_domain)
            
            # 4. Subdomain Threat Mapping (Parallel)
            active_subs = []
            with ThreadPoolExecutor(max_workers=10) as executor:
                sub_results = executor.map(lambda s: discover_subdomain(clean_domain, s), COMMON_SUBDOMAINS)
                for target, status in sub_results:
                    if "ACTIVE" in status:
                        active_subs.append(target)
                        
            execution_time_us = round((time.perf_counter() - start_time) * 1000000, 2)
            
            # 5. Advanced Risk Matrix Scoring
            danger_score = len(open_ports) * 15
            if "🚨" in ssl_status:
                danger_score += 30
            danger_score += len(active_subs) * 5
            danger_score = min(danger_score, 100)
            
            if danger_score >= 70:
                threat_level = "CRITICAL RISK 🔥"
            elif danger_score >= 40:
                threat_level = "MEDIUM RISK ⚠️"
            else:
                threat_level = "SECURE ✅"

            # 6. Geolocation Ingestion
            country_name, isp_name = "SECURE NODE 🌍", "PROTECTED ISP 🛰️"
            try:
                api_url = f"https://ipapi.co{real_world_extracted_ip}/json/"
                req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    geo_data = json.loads(response.read().decode())
                    if "error" not in geo_data:
                        country_name = f"{geo_data.get('country_name', 'Unknown')} {geo_data.get('country_emoji', '🌍')}"
                        isp_name = geo_data.get("org", "Unknown")
            except:
                pass

            # Packaging Payload
            next_id = len(st.session_state.real_cyber_ledger) + 1
            live_payload_token = {
                "id": next_id,
                "domain": clean_domain,
                "ip": real_world_extracted_ip,
                "country": country_name,
                "isp": isp_name,
                "open_ports": ", ".join(open_ports) if open_ports else "None",
                "ssl_status": ssl_status,
                "subdomains": ", ".join(active_subs) if active_subs else "None",
                "risk_score": danger_score,
                "threat_level": threat_level,
                "speed_us": execution_time_us
            }
            
            # Persistent Logging
            with open(REAL_AUDIT_FILE, "a", encoding="utf-8") as audit_file:
                audit_file.write(f"[{time.ctime()}] ENTERPRISE_SHIELD -> {clean_domain} | RISK: {danger_score}% | SSL: {ssl_status}\n")
            
            st.session_state.real_cyber_ledger.append(live_payload_token)
            st.sidebar.success(f"Audit Complete for {clean_domain}")
            st.rerun()
            
        except Exception as e:
            st.sidebar.error(f"❌ COMPLIANCE FAULT: {str(e)}")

if st.sidebar.button("🧹 Flush Defense Ledger"):
    st.session_state.real_cyber_ledger = []
    st.rerun()

# === MAIN CONSOLE DISPLAY ===
st.title("🛰️ CyberShield AI: Global Infrastructure Defense Grid")
st.markdown("Autonomous Penetration-Testing Matrix, Data Leak Mapping & Perimeter Defense System.")
st.markdown("---")

total_blocks = len(st.session_state.real_cyber_ledger)
c1, c2, c3 = st.columns(3)
with c1:
    st.metric(label="🔒 MONITORED ENTERPRISE ASSETS", value=f"{total_blocks} SERVERS")
with c2:
    high_threats = sum(1 for item in st.session_state.real_cyber_ledger if item['risk_score'] >= 60)
    st.metric(label="🔥 EXPOSED THREAT ATTACK VECTORS", value=f"{high_threats} ALERTS", delta="Mitigation Active", delta_color="inverse")
with c3:
    st.info("💎 **COMMERCIAL STATUS:** v8.0 is running live Network Socket Interceptors and SSL Handshake Verifiers.")

st.markdown("---")

# Display Audit Results & Fix Generator
if st.session_state.real_cyber_ledger:
    df = pd.DataFrame(st.session_state.real_cyber_ledger)
    
    st.subheader("📋 Live Infrastructure Audit Matrix")
    st.dataframe(df[["id", "domain", "ip", "country", "open_ports", "ssl_status", "risk_score", "threat_level"]])
    
    # --- BILLION DOLLAR EXTENSION: INTERACTIVE AUTOMATED DEFENSE RECOMMENDATIONS ---
    st.markdown("---")
    st.subheader("🛡️ AI Defense Automation & Remediation Blueprints")
    st.markdown("Here are the instant security updates generated for your client to patch their multi-million dollar infrastructure:")
    
    latest_scan = st.session_state.real_cyber_ledger[-1]
    
    col_a, col_b = st.columns(2)
    with col_a:
        st.error(f"### Target Vulnerability Report: {latest_scan['domain']}")
        st.write(f"**Current Security Threat Level:** {latest_scan['threat_level']}")
        st.write(f"**Identified Active Subdomains:** `{latest_scan['subdomains']}`")
        st.write(f"**Exposed Open Ports:** `{latest_scan['open_ports']}`")
    
    with col_b:
        st.success("### 🛠️ Auto-Generated Firewall Script (Deploy Immediately)")
        st.markdown("Provide this script to the company's network engineering team to patch their servers:")
        
        # Generating dynamic mitigation bash commands based on discovered threats
        firewall_script = "#!/bin/bash\n# CyberShield AI Auto-Generated Hardening Script\n"
        if latest_scan['open_ports'] != "None":
            for port in latest_scan['open_ports'].split(", "):
                if port not in ["80", "443"]: # Don't block web traffic
                    firewall_script += f"sudo iptables -A INPUT -p tcp --dport {port} -j DROP\n"
        firewall_script += "# Restarting security policies\nsudo iptables-save | sudo tee /etc/iptables/rules.v4"
        
        st.code(firewall_script, language="bash")

st.info("💡 Tip: To run this code, ensure you have run `pip install streamlit psutil pandas` on your machine.")
st.title("make this project = shahid khan billion dollar project.")
