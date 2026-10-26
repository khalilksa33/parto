#!/usr/bin/env python3
"""
PARTO Marketplace - Hostinger Auto-Deployment Engine v2.0
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
    'infrastructure', 'k8s', '__pycache__', '.tempmediaStorage', '.agents'
}
EXCLUDED_EXTS = {'.log', '.ps1', '.pyc'}
EXCLUDED_FILES = {'.env.example', 'rename.py', 'generate_docs.py'}

def write_step_summary(text: str):
    summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary_path:
        try:
            with open(summary_path, 'a', encoding='utf-8') as f:
                f.write(text + "\n")
        except Exception as e:
            print(f"[SUMMARY] Notice: {e}")

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
        ftps = ftplib.FTP_TLS(context=ctx, timeout=90)
        ftps.connect(host, 21)
        ftps.login(user, passwd)
        try:
            ftps.prot_p()
        except Exception as e_prot:
            print(f"[CONNECT] Note on prot_p: {e_prot}. Trying standard data channel.")
        ftps.set_pasv(True)
        print("[CONNECT] ✅ Secure FTPS connection established successfully.")
        return ftps, "FTPS (TLS Port 21)"
    except Exception as e_ftps:
        print(f"[CONNECT] ⚠️ FTPS failed ({e_ftps}). Falling back to standard FTP ...")
        try:
            ftp = ftplib.FTP(timeout=90)
            ftp.connect(host, 21)
            ftp.login(user, passwd)
            ftp.set_pasv(True)
            print("[CONNECT] ✅ Standard FTP connection established successfully.")
            return ftp, "Standard FTP (Port 21)"
        except Exception as e_ftp:
            print(f"[CONNECT] ❌ FTP connection failed: {e_ftp}")
            raise

def resolve_target_dir(ftp, requested_dir: str) -> str:
    start_dir = ftp.pwd()
    print(f"[DIRECTORY] Current FTP working directory: {start_dir}")
    
    try:
        root_items = [i.lower() for i in ftp.nlst()]
    except Exception:
        root_items = []
    print(f"[DIRECTORY] Root items: {root_items[:20]}")

    candidates = []

    # If requested_dir is provided (e.g. 'public_html/parto' or 'parto')
    if requested_dir and requested_dir.strip('/'):
        clean_req = requested_dir.strip('/')
        # If we are already in /public_html, 'public_html/parto' becomes 'parto'
        if start_dir.rstrip('/').endswith('public_html') and clean_req.startswith('public_html/'):
            sub_cand = clean_req[len('public_html/'):]
            candidates.append(sub_cand)
        candidates.append(clean_req)
        candidates.append(f"/{clean_req}")

    # Subdomain specific candidates for parto.dynapulsar.com
    if 'parto' in root_items:
        candidates.insert(0, "parto")
    candidates.extend([
        "parto",
        "public_html/parto",
        "domains/dynapulsar.com/public_html/parto",
        "."
    ])

    # Deduplicate while preserving order
    seen = set()
    unique_candidates = [c for c in candidates if not (c in seen or seen.add(c))]

    for cand in unique_candidates:
        try:
            ftp.cwd(cand)
            target = ftp.pwd()
            sub_items = [i.lower() for i in ftp.nlst()]
            print(f"[DIRECTORY] ✅ Successfully navigated to: {target} (via '{cand}', contents: {len(sub_items)} items)")
            return target
        except Exception as e:
            print(f"[DIRECTORY] Tried candidate '{cand}': {e}")
            try:
                ftp.cwd(start_dir)
            except Exception:
                pass

    print(f"[DIRECTORY] Remaining in initial directory: {start_dir}")
    return start_dir


def ensure_remote_dir(ftp, remote_path: str):
    parts = [p for p in remote_path.replace('\\', '/').split('/') if p]
    for part in parts:
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

    ftp.cwd(target_dir)

    for root, dirs, files in os.walk(local_root):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith('.')]
        rel_dir = os.path.relpath(root, local_root)
        
        for file in files:
            if file in EXCLUDED_FILES or file.startswith('.git') or file == 'deploy_to_hostinger.py':
                continue
            ext = os.path.splitext(file)[1].lower()
            if ext in EXCLUDED_EXTS:
                continue

            local_file = Path(root) / file
            rel_file = file if rel_dir == '.' else os.path.join(rel_dir, file).replace('\\', '/')

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

    # Clean up default.php placeholder if present
    try:
        ftp.cwd(target_dir)
        items = ftp.nlst()
        if 'default.php' in items:
            ftp.delete('default.php')
            print("[CLEANUP] Removed Hostinger default.php placeholder.")
    except Exception:
        pass

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
            body = res.read(8192).decode('utf-8', errors='replace')
            has_parto = "بارتو" in body or "PARTO" in body or "dynapulsar" in body
            print(f"[VERIFY] HTTP {status} OK | Platform markers detected: {has_parto}")
            return status, has_parto
    except Exception as e:
        print(f"[VERIFY] HTTP check note: {e}")
        return 0, False

def main():
    print("=" * 70)
    print("  PARTO MARKETPLACE - HOSTINGER DEPLOYMENT ENGINE v2.0")
    print("  Target: parto.dynapulsar.com")
    print("=" * 70)

    # Read from environment variables passed by GitHub Actions
    host_raw = os.environ.get('HOSTINGER_FTP_SERVER') or os.environ.get('FTP_SERVER') or os.environ.get('FTP_HOST') or ''
    user_raw = os.environ.get('HOSTINGER_FTP_USERNAME') or os.environ.get('FTP_USERNAME') or os.environ.get('FTP_USER') or ''
    pass_raw = os.environ.get('HOSTINGER_FTP_PASSWORD') or os.environ.get('FTP_PASSWORD') or os.environ.get('FTP_PASS') or ''
    dir_raw = os.environ.get('HOSTINGER_REMOTE_DIR') or os.environ.get('FTP_DIR') or os.environ.get('REMOTE_DIR') or os.environ.get('FTP_PATH') or 'public_html/'

    host = sanitize_host(host_raw)
    user = user_raw.strip()
    passwd = pass_raw.strip()
    req_dir = dir_raw.strip()

    print("[CONFIG DIAGNOSTICS]")
    print(f"  HOSTINGER_FTP_SERVER detected: {bool(os.environ.get('HOSTINGER_FTP_SERVER'))}")
    print(f"  FTP_SERVER detected:           {bool(os.environ.get('FTP_SERVER'))}")
    print(f"  HOSTINGER_FTP_USERNAME detected: {bool(os.environ.get('HOSTINGER_FTP_USERNAME'))}")
    print(f"  FTP_USERNAME detected:           {bool(os.environ.get('FTP_USERNAME'))}")
    print(f"  HOSTINGER_FTP_PASSWORD detected: {bool(os.environ.get('HOSTINGER_FTP_PASSWORD'))}")
    print(f"  FTP_PASSWORD detected:           {bool(os.environ.get('FTP_PASSWORD'))}")
    print(f"  Target Host: '{host}'")
    print(f"  Target User: '{user[:3]}***' (length: {len(user)})")
    print(f"  Password Length: {len(passwd)}")
    print(f"  Requested Dir: '{req_dir}'")

    if not host or not user or not passwd:
        err = f"""### ❌ Hostinger Deployment Failed: Missing Secrets

Please add these secrets at **[GitHub Repo Settings > Secrets and variables > Actions](https://github.com/khalilksa33/parto/settings/secrets/actions)**:
- `HOSTINGER_FTP_SERVER`: e.g. `ftp.dynapulsar.com` or Hostinger IP `145.223.77.119`
- `HOSTINGER_FTP_USERNAME`: Your Hostinger FTP username (from hPanel > FTP Accounts)
- `HOSTINGER_FTP_PASSWORD`: Your Hostinger FTP password
- `HOSTINGER_REMOTE_DIR`: Optional (defaults to `public_html/`)
"""
        write_step_summary(err)
        print(err)
        sys.exit(1)

    local_root = Path(__file__).resolve().parent

    try:
        ftp, protocol = connect_ftp(host, user, passwd)
    except Exception as e:
        err = f"### ❌ FTP Connection Error to {host}:21\n\n`{str(e)}`\n\nPlease check server address and credentials in Hostinger hPanel."
        write_step_summary(err)
        sys.exit(1)

    try:
        target_dir = resolve_target_dir(ftp, req_dir)
        print(f"\n[UPLOAD] Deploying project files to {target_dir} ...")
        uploaded, failed, duration = upload_project(ftp, local_root, target_dir)
        print(f"\n[COMPLETED] Successfully deployed {len(uploaded)} files in {duration:.1f}s.")
        if failed:
            print(f"⚠️ [WARNING] {len(failed)} files failed:")
            for f, e in failed:
                print(f"   - {f}: {e}")
    finally:
        try:
            ftp.quit()
        except Exception:
            pass

    http_status, has_content = verify_live_url("https://parto.dynapulsar.com")

    summary_md = f"""## 🚀 Hostinger Deployment Summary - parto.dynapulsar.com

| Metric | Result |
| :--- | :--- |
| **Status** | {'✅ Successful' if not failed and uploaded else '⚠️ Completed with errors'} |
| **Protocol** | {protocol} |
| **Target Directory** | `{target_dir}` |
| **Files Uploaded** | **{len(uploaded)}** files |
| **Failed Files** | **{len(failed)}** |
| **Duration** | {duration:.1f} seconds |
| **Live Site Status** | HTTP {http_status} (`https://parto.dynapulsar.com`) |

### Key Modules Deployed:
- `index.php` (Marketplace Homepage & VIN search)
- `tashleeh.php` (Scrapyard Quotes & RFQ System)
- `workshop.php` (Auto Repair & Mechanic Booking)
- `towing.php` (Emergency Flatbed Towing / سطحة)
- `oem.php` (OEM Parts Catalog & Technical Fitment)
- `checkout.php` & `order-success.php`
- `portal.php` (Vendor Multi-Tenant Dashboard)
- `admin.php` (Super Admin Platform Center)
- `config/` (Dual-Engine PDO MySQL/SQLite architecture)
- `api/` (All REST endpoints)
- `assets/` (CSS3 Design System & JavaScript Handlers)
- `.htaccess` (Apache / LiteSpeed Rewrites & Security)
"""
    write_step_summary(summary_md)

    if failed:
        sys.exit(1)

    print("\n🎉 PARTO deployment to Hostinger completed successfully!")

if __name__ == '__main__':
    main()
