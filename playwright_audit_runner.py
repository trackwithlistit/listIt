import os
import sys
import json
import time
import uuid
import datetime

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:5000"
SCREENSHOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audit_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

audit_results = {
    "timestamp": datetime.datetime.now().isoformat(),
    "summary": {"total_tests": 0, "passed": 0, "failed": 0, "warnings": 0},
    "console_errors": [],
    "network_errors": [],
    "pages_audited": [],
    "feature_tests": [],
    "security_checks": [],
    "responsive_checks": [],
    "performance_metrics": [],
    "bugs_identified": []
}

def log_bug(bug_id, category, severity, page_feature, location, steps, expected, actual, evidence, root_cause, fix, regression_risk):
    bug = {
        "bug_id": bug_id,
        "category": category,
        "severity": severity,
        "page_feature": page_feature,
        "location": location,
        "steps_to_reproduce": steps,
        "expected_behavior": expected,
        "actual_behavior": actual,
        "evidence": evidence,
        "root_cause": root_cause,
        "recommended_fix": fix,
        "regression_risk": regression_risk
    }
    audit_results["bugs_identified"].append(bug)
    print(f"[{severity.upper()}] {bug_id}: {page_feature} - {actual}")

def setup_page_listeners(page, page_name):
    def on_console(msg):
        if msg.type in ['error', 'warning']:
            entry = {"page": page_name, "type": msg.type, "text": msg.text, "location": msg.location}
            if msg.type == 'error':
                audit_results["console_errors"].append(entry)
                print(f"  [Console Error on {page_name}] {msg.text[:120]}")

    def on_request_failed(req):
        entry = {"page": page_name, "url": req.url, "method": req.method, "failure": req.failure}
        audit_results["network_errors"].append(entry)
        print(f"  [Network Failed on {page_name}] {req.method} {req.url} - {req.failure}")

    def on_response(res):
        if res.status >= 400 and not "/auth/login" in res.url and not "/auth/register" in res.url:
            entry = {"page": page_name, "url": res.url, "status": res.status, "status_text": res.status_text}
            audit_results["network_errors"].append(entry)
            print(f"  [HTTP {res.status} on {page_name}] {res.url}")

    page.on("console", on_console)
    page.on("requestfailed", on_request_failed)
    page.on("response", on_response)

def run_playwright_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("==================================================")
        print("Starting Playwright End-to-End Audit of ListIt")
        print("==================================================")

        # -------------------------------------------------------------
        # SUITE 1: Public Pages & Navigation
        # -------------------------------------------------------------
        print("\n--- SUITE 1: Public Pages & Navigation Exploration ---")
        
        # 1.1 Home Page
        setup_page_listeners(page, "HomePage")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_home_page.png"))
        title = page.title()
        print(f"Home Page Loaded. Title: '{title}'")
        
        # Check Hero, carousels, sections
        hero = page.locator("h1, .hero-title, [class*='hero']").first
        hero_text = hero.text_content() if hero.count() > 0 else "None"
        print(f"  Hero section detected: {hero_text[:50]}")
        
        # 1.2 Browse Anime Page
        setup_page_listeners(page, "AnimeBrowse")
        page.goto(f"{BASE_URL}/anime", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_anime_browse.png"))
        cards = page.locator(".anime-card, [class*='Card'], [class*='card']").count()
        print(f"Anime Browse Loaded. Cards found: {cards}")

        # 1.3 Seasonal Anime Page
        setup_page_listeners(page, "SeasonalPage")
        page.goto(f"{BASE_URL}/anime/seasonal", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_seasonal.png"))
        print("Seasonal Anime Page Loaded.")

        # 1.4 TV / Series Browse Page
        setup_page_listeners(page, "SeriesBrowse")
        page.goto(f"{BASE_URL}/series", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_series_browse.png"))
        print("Series Browse Page Loaded.")

        # 1.5 Global Search Page
        setup_page_listeners(page, "SearchPage")
        page.goto(f"{BASE_URL}/search", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_search_page.png"))
        print("Search Page Loaded.")

        # 1.6 Detail Pages
        setup_page_listeners(page, "AnimeDetail")
        # Try navigating to a top anime (e.g. Frieren or Attack on Titan)
        page.goto(f"{BASE_URL}/anime/154587", wait_until="networkidle") # Frieren AniList ID
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_anime_detail.png"))
        print("Anime Detail Page Loaded (ID 154587).")

        setup_page_listeners(page, "SeriesDetail")
        page.goto(f"{BASE_URL}/series/82", wait_until="networkidle") # Game of Thrones / TVMaze ID
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "07_series_detail.png"))
        print("Series Detail Page Loaded (ID 82).")

        # -------------------------------------------------------------
        # SUITE 2: Authentication Flows
        # -------------------------------------------------------------
        print("\n--- SUITE 2: Authentication & User Flows ---")
        
        # 2.1 Login Page UI & Form validation
        setup_page_listeners(page, "LoginPage")
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "08_login_page.png"))
        
        # Test empty form submission
        submit_btn = page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Log In')").first
        if submit_btn.count() > 0:
            submit_btn.click()
            time.sleep(1)
            print("  Tested empty login form submission.")

        # 2.2 Register Page UI & OTP flow
        setup_page_listeners(page, "RegisterPage")
        page.goto(f"{BASE_URL}/register", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "09_register_page.png"))
        print("Register Page Loaded.")

        # 2.3 Forgot Password Page
        setup_page_listeners(page, "ForgotPasswordPage")
        page.goto(f"{BASE_URL}/forgot-password", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "10_forgot_password.png"))
        print("Forgot Password Page Loaded.")

        # -------------------------------------------------------------
        # SUITE 3: Interactive User Flows (Authenticated)
        # -------------------------------------------------------------
        print("\n--- SUITE 3: Authenticated User Flows ---")
        # Let's create an active session via direct token injection to test protected pages
        import jwt
        test_user_id = str(uuid.uuid4())
        test_username = f"audit_user_{uuid.uuid4().hex[:6]}"
        test_email = f"{test_username}@example.com"
        
        # Insert user directly in Supabase or backend
        from app.db import db_proxy
        import bcrypt
        pw_hash = bcrypt.hashpw(b"Password123!", bcrypt.gensalt()).decode()
        db_user = {
            'id': test_user_id,
            'email': test_email,
            'username': test_username,
            'password_hash': pw_hash,
            'role': 'admin',
            'is_verified': True,
            'created_at': datetime.datetime.now().isoformat()
        }
        db_proxy.create_user(db_user)

        from app.utils.jwt_utils import generate_tokens
        # Inject token into localStorage
        access_tok, refresh_tok = generate_tokens(test_user_id)
        
        page.goto(f"{BASE_URL}/login")
        page.evaluate(f"""() => {{
            localStorage.setItem('listit_token', '{access_tok}');
            localStorage.setItem('listit_refresh', '{refresh_tok}');
            localStorage.setItem('listit_user', JSON.stringify({json.dumps(db_user)}));
        }}""")

        # 3.1 Test Dashboard
        setup_page_listeners(page, "DashboardPage")
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "11_dashboard.png"))
        print("Dashboard Page Loaded.")

        # 3.2 Test Lists Page
        setup_page_listeners(page, "ListsPage")
        page.goto(f"{BASE_URL}/lists", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "12_lists_page.png"))
        print("Lists Page Loaded.")

        # 3.3 Test Settings Page
        setup_page_listeners(page, "SettingsPage")
        page.goto(f"{BASE_URL}/settings", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "13_settings_profile.png"))
        
        # Click on Security Tab
        sec_tab = page.locator("button:has-text('Security')").first
        if sec_tab.count() > 0:
            sec_tab.click()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "14_settings_security.png"))
            print("Settings Security Tab Loaded.")

        # 3.4 Test Admin Page
        setup_page_listeners(page, "AdminPage")
        page.goto(f"{BASE_URL}/admin", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "15_admin_page.png"))
        print("Admin Page Loaded.")

        # 3.5 Test User Profile
        setup_page_listeners(page, "ProfilePage")
        page.goto(f"{BASE_URL}/profile/{test_username}", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "16_profile_page.png"))
        print(f"Profile Page for '{test_username}' Loaded.")

        # -------------------------------------------------------------
        # SUITE 4: Responsive & Multi-device Checks
        # -------------------------------------------------------------
        print("\n--- SUITE 4: Responsive Viewport Checks ---")
        viewports = [
            ("Mobile_iPhone", 375, 812),
            ("Tablet_iPad", 768, 1024),
            ("Laptop_HD", 1366, 768),
            ("Desktop_FHD", 1920, 1080)
        ]
        for name, w, h in viewports:
            page.set_viewport_size({"width": w, "height": h})
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"responsive_home_{name}.png"))
            page.goto(f"{BASE_URL}/anime", wait_until="networkidle")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"responsive_anime_{name}.png"))
            print(f"  [OK] Responsive check completed for {name} ({w}x{h})")

        # -------------------------------------------------------------
        # SUITE 5: 404 & Edge Cases
        # -------------------------------------------------------------
        print("\n--- SUITE 5: Edge Cases & 404 Not Found ---")
        setup_page_listeners(page, "NotFoundPage")
        page.goto(f"{BASE_URL}/nonexistent-route-404-test", wait_until="networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "17_not_found_page.png"))
        print("404 Not Found Page Loaded.")

        browser.close()

    # Save summary report
    summary_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audit_results.json")
    with open(summary_path, "w") as f:
        json.dump(audit_results, f, indent=2)
    print(f"\nAudit completed. Results saved to {summary_path}")

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        run_playwright_audit()
