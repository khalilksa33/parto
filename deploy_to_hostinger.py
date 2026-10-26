#!/usr/bin/env python3
"""
PARTO Marketplace - Hostinger Auto-Deployment Engine
Automates resilient FTPS / FTP upload to Hostinger with smart directory discovery,
TLS certificate handling, and GitHub Actions summary reporting.
"""

import os
import sys
import ssl
import time
import ftplib
import urllib.request
from pathlib import Path

EXCLUDED_DIRS = {
    '.git', '.github', 'node_modules', 'backend', 'frontend',
    'infrastructure', 'k8s', '__pycache__', '.tempmediaStorage'
}
EXCLUDED_EXTS = {'.log', '.ps1', '.pyc'}
EXCLUDED_FILES = {'.env.example', 'rename.py', 'generate_docs.py'}

def sanitize_host(host: str) -> str:
    host = host.strip()
    for prefix in ('ftps://', 'ftp://', 'https://', 'http://'):
        if host.lower().startswith(prefix):
            host = host[len(prefix):]
    if ':' in host:
        host = host.split(':')[0]
    return host.strip('/')

def connect_ftp(host: str, user: str, passwd: str):
    print(f"[CONNECT] Attempting FTPS (Explicit TLS) to {host}:21 ...")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        ftps = ftplib.FTP_TLS(context=ctx, timeout=60)
        ftps.connect(host, 21)
        ftps.login(user, passwd)
        ftps.prot_p()
        ftps.set_pasv(True)
        print("[CONNECT] ✅ Secure FTPS connection established successfully.")
        return ftps, "FTPS (TLS)"
    except Exception as e_ftps:
        print(f"[CONNECT] ⚠️ FTPS failed ({e_ftps}). Falling back to standard FTP ...")
        try:
            ftp = ftplib.FTP(timeout=60)
            ftp.connect(host, 21)
            ftp.login(user, passwd)
            ftp.set_pasv(True)
            print("[CONNECT] ✅ Standard FTP connection established successfully.")
            return ftp, "Standard FTP"
        except Exception as e_ftp:
            print(f"[CONNECT] ❌ FTP connection failed: {e_ftp}")
            raise

def resolve_target_dir(ftp, requested_dir: str) -> str:
    start_dir = ftp.pwd()
    print(f"[DIRECTORY] Current FTP working directory: {start_dir}")
    
    try:
        listing = ftp.nlst()
    except Exception:
        listing = []
    print(f"[DIRECTORY] Remote directory contents: {listing[:15]}")

    # Candidate directories to try in order of preference
    candidates = []
    if requested_dir and requested_dir.strip('/'):
        clean_req = requested_dir.strip('/')
        candidates.append(clean_req)
        candidates.append(f"/{clean_req}")
    
    # Subdomain paths commonly used on Hostinger
    candidates.extend([
        "public_html/parto",
        "domains/dynapulsar.com/public_html/parto",
        "public_html",
        "domains/dynapulsar.com/public_html",
        "."
    ])

    for cand in candidates:
        try:
            ftp.cwd(cand)
            target = ftp.pwd()
            print(f"[DIRECTORY] ✅ Successfully navigated to: {target} (candidate: {cand})")
            return target
        except Exception:
            try:
                ftp.cwd(start_dir)
            except Exception:
                pass
            continue

    print(f"[DIRECTORY] Using initial directory: {start_dir}")
    return start_dir

def ensure_remote_dir(ftp, remote_path: str):
    parts = [p for p in remote_path.replace('\\', '/').split('/') if p]
    current = ""
    for part in parts:
        current += ("/" if current else "") + part
        try:
            ftp.mkd(part)
        except Exception:
            pass
        try:
            ftp.cwd(part)
        except Exception:
            pass

def upload_project(ftp, local_root: Path, target_dir: str):
    uploaded = []
    failed = []
    start_time = time.time()

    # Always ensure we start inside target_dir
    ftp.cwd(target_dir)

    for root, dirs, files in os.walk(local_root):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith('.')]
        
        rel_dir = os.path.relpath(root, local_root)
        
        for file in files:
            if file in EXCLUDED_FILES or file.startswith('.git'):
                continue
            ext = os.path.splitext(file)[1].lower()
            if ext in EXCLUDED_EXTS:
                continue

            local_file = Path(root) / file
            rel_file = file if rel_dir == '.' else os.path.join(rel_dir, file).replace('\\', '/')

            # Navigate to target dir and then into subdirectories
            ftp.cwd(target_dir)
            if rel_dir != '.':
                ensure_remote_dir(ftp, rel_dir)

            try:
                with open(local_file, 'rb') as f:
                    ftp.storbinary(f"STOR {file}", f)
                uploaded.append(rel_file)
                print(f"  [UPLOAD] {rel_file} ({local_file.stat().st_size:,} bytes)")
            except Exception as e:
                print(f"  [ERROR] Failed to upload {rel_file}: {e}")
                failed.append((rel_file, str(e)))

    duration = time.time() - start_time
    return uploaded, failed, duration

def verify_live_url(url: str = "https://parto.dynapulsar.com"):
    print(f"\n[VERIFY] Checking live website: {url} ...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
            status = res.status
            body = res.read(4096).decode('utf-8', errors='replace')
            has_parto = "بارتو" in body or "PARTO" in body or "dynapulsar" in body
            print(f"[VERIFY] HTTP {status} OK | Platform markers detected: {has_parto}")
            return status, has_parto
    except Exception as e:
        print(f"[VERIFY] HTTP ping notice: {e}")
        return 0, False

def write_step_summary(protocol: str, target_dir: str, uploaded: list, failed: list, duration: float, http_status: int):
    summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
    if not summary_path:
        return

    content = f"""## 🚀 Hostinger Deployment Summary - parto.dynapulsar.com

| Metric | Result |
| :--- | :--- |
| **Status** | {'✅ Successful' if not failed and uploaded else '⚠️ Completed with errors'} |
| **Protocol** | {protocol} |
| **Target Directory** | `{target_dir}` |
| **Files Uploaded** | **{len(uploaded)}** files |
| **Failed Files** | **{len(failed)}** |
| **Deployment Time** | {duration:.1f} seconds |
| **Live URL Status** | HTTP {http_status} (`https://parto.dynapulsar.com`) |

### Key Files Deployed:
- `index.php` (Marketplace Homepage & VIN search)
- `tashleeh.php` (Scrapyard Quotes & RFQ System)
- `workshop.php` (Auto Repair & Mechanic Booking)
- `towing.php` (Emergency Flatbed Towing / سطحة)
- `checkout.php` & `order-success.php`
- `portal.php` (Vendor Multi-Tenant Dashboard)
- `admin.php` (Platform Administration Panel)
- `config/` (Dual-Engine PDO MySQL/SQLite architecture)
- `api/` (All REST endpoints)
- `assets/` (CSS3 Design System & JavaScript Handlers)
- `.htaccess` (Apache / LiteSpeed Rewrites & Security)
"""
    try:
        with open(summary_path, 'a', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"Failed to write step summary: {e}")

def main():
    print("=" * 70)
    print("  PARTO MARKETPLACE - HOSTINGER DEPLOYMENT ENGINE")
    print("  Target: parto.dynapulsar.com")
    print("=" * 70)

    host = sanitize_host(os.environ.get('FTP_HOST') or os.environ.get('HOSTINGER_FTP_SERVER') or os.environ.get('FTP_SERVER') or '')
    user = (os.environ.get('FTP_USER') or os.environ.get('HOSTINGER_FTP_USERNAME') or os.environ.get('FTP_USERNAME') or '').strip()
    passwd = (os.environ.get('FTP_PASS') or os.environ.get('HOSTINGER_FTP_PASSWORD') or os.environ.get('FTP_PASSWORD') or '').strip()
    req_dir = (os.environ.get('FTP_PATH') or os.environ.get('HOSTINGER_REMOTE_DIR') or os.environ.get('FTP_DIR') or '').strip()

    if not host or not user or not passwd:
        print("❌ [CONFIG ERROR] Missing required FTP credentials.")
        print("   Required: FTP_HOST (or HOSTINGER_FTP_SERVER), FTP_USER (or HOSTINGER_FTP_USERNAME), FTP_PASS (or HOSTINGER_FTP_PASSWORD)")
        sys.exit(1)

    print(f"[CONFIG] Host: {host}")
    print(f"[CONFIG] User: {user[:3]}***")
    print(f"[CONFIG] Requested Remote Directory: '{req_dir}'")

    local_root = Path(__file__).resolve().parent

    try:
        ftp, protocol = connect_ftp(host, user, passwd)
    except Exception as e:
        print(f"❌ [FATAL] Could not connect to FTP host: {e}")
        sys.exit(1)

    try:
        target_dir = resolve_target_dir(ftp, req_dir)
        print(f"\n[UPLOAD] Beginning upload of project files to {target_dir} ...")
        uploaded, failed, duration = upload_project(ftp, local_root, target_dir)
        print(f"\n[COMPLETED] Successfully uploaded {len(uploaded)} files in {duration:.1f}s.")
        if failed:
            print(f"⚠️ [WARNING] {len(failed)} files failed:")
            for f, err in failed:
                print(f"   - {f}: {err}")
    finally:
        try:
            ftp.quit()
        except Exception:
            pass

    http_status, has_content = verify_live_url("https://parto.dynapulsar.com")
    write_step_summary(protocol, target_dir, uploaded, failed, duration, http_status)

    if failed:
        sys.exit(1)
    
    print("\n🎉 Deployment completed successfully!")

if __name__ == '__main__':
    main()
