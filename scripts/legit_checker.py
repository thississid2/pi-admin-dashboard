import sys
import requests
import re
import whois
import datetime
import socket
import dns.resolver
from urllib.parse import urlparse
from xml.etree import ElementTree
from bs4 import BeautifulSoup
import urllib3
from fpdf import FPDF
import os

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- Configuration ---
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
KEYWORDS = {
    "contact": ["contact", "kontakt", "contact-us", "support"],
    "privacy": ["privacy", "policy", "datenschutz", "privacy-policy"],
    "terms": ["terms", "conditions", "tos", "agb", "terms-of-service"],
    "refund": ["refund", "return", "cancellation", "widerruf"],
    "shipping": ["shipping", "delivery", "versand"],
    "about": ["about", "about-us", "impressum", "uber-uns", "company"],
}
DNSBL_SERVERS = ["zen.spamhaus.org", "bl.spamcop.net", "b.barracudacentral.org"]

# --- Helper Functions ---

def get_clean_domain(url: str) -> str:
    """Extracts a clean domain name from a URL."""
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc or parsed_url.path
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain

def format_result(check: str, result: str, status: str = "[i]") -> str:
    """Formats a result line as a string with padding for alignment."""
    prefix = f"{status} {check}"
    return f"{prefix:<28}: {result}"

def save_report_to_pdf(report_text: str, filename: str, logo_path: str = "pi-logo.png"):
    """Saves the report to a PDF, with a logo and improved line-by-line formatting."""
    pdf = FPDF()
    pdf.add_page()

    # Add logo if it exists
    if os.path.exists(logo_path):
        # Position logo at top right: 10mm from top, 150mm from left
        # Width 50mm, height will be calculated automatically to keep aspect ratio
        pdf.image(logo_path, x=150, y=10, w=50)
        # Add a little space below the logo area
        pdf.ln(20)

    # Set font for the report body
    pdf.set_font("Courier", size=10)

    # Process and write the report line by line for better formatting control
    for line in report_text.split('\n'):
        # Sanitize each line for latin-1 encoding
        clean_line = line.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 5, txt=clean_line)

    pdf.output(filename)
    print("\n" + "=" * 50)
    print(f"✅ Report successfully saved to: {filename}")
    print("=" * 50)


# --- Check Functions ---

def check_https_status(domain: str, report_lines: list):
    """Checks for HTTPS and proper redirection."""
    report_lines.append("\n--- 1. HTTPS Security Check ---")
    try:
        requests.get(f"https://{domain}", headers=HEADERS, timeout=10, verify=False)
        report_lines.append(format_result("HTTPS Connection", "Successful", "✅"))
    except requests.RequestException:
        report_lines.append(format_result("HTTPS Connection", "Failed", "❌"))
    try:
        response = requests.get(f"http://{domain}", headers=HEADERS, allow_redirects=True, timeout=10, verify=False)
        if response.url.startswith("https://"):
            report_lines.append(format_result("HTTP -> HTTPS Redirect", "Yes", "✅"))
        else:
            report_lines.append(format_result("HTTP -> HTTPS Redirect", "No", "⚠️"))
    except requests.RequestException:
        report_lines.append(format_result("HTTP -> HTTPS Redirect", "Check Failed", "❌"))

def find_key_pages(domain: str, report_lines: list):
    """Finds links to key pages by scanning sitemap and homepage."""
    report_lines.append("\n--- 2. Key Page Discovery ---")
    found_pages = {key: None for key in KEYWORDS}
    urls_to_scan = set()
    try:
        robots_url = f"https://{domain}/robots.txt"
        resp = requests.get(robots_url, headers=HEADERS, timeout=10, verify=False)
        sitemaps = re.findall(r"Sitemap: (.*)", resp.text)
        if sitemaps:
            sitemap_url = sitemaps[0].strip()
            resp = requests.get(sitemap_url, headers=HEADERS, timeout=10, verify=False)
            root = ElementTree.fromstring(resp.content)
            for loc in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
                urls_to_scan.add(loc.text)
            report_lines.append(format_result("Sitemap Scan", f"Found and scanned {len(urls_to_scan)} URLs"))
    except Exception:
        report_lines.append(format_result("Sitemap Scan", "Sitemap not found or failed to parse.", "⚠️"))
    try:
        homepage_url = f"https://{domain}"
        resp = requests.get(homepage_url, headers=HEADERS, timeout=10, verify=False)
        soup = BeautifulSoup(resp.content, "html.parser")
        for a_tag in soup.find_all("a", href=True):
            full_url = requests.compat.urljoin(homepage_url, a_tag['href'])
            urls_to_scan.add(full_url)
    except Exception:
        report_lines.append(format_result("Homepage Scan", "Failed to scan homepage links.", "❌"))
        return
    for url in urls_to_scan:
        for page_type, keys in KEYWORDS.items():
            if not found_pages[page_type] and any(key in url.lower() for key in keys):
                found_pages[page_type] = url
    for page_type, url in found_pages.items():
        status = "✅" if url else "⚠️"
        result = "Found" if url else "Not Found"
        report_lines.append(format_result(f"{page_type.capitalize()} Page", result, status))

def check_domain_whois(domain: str, report_lines: list):
    """Performs a WHOIS lookup, formatting the status list for readability."""
    report_lines.append("\n--- 3. Domain WHOIS Check ---")
    try:
        w = whois.whois(domain)
        if not w.creation_date:
            report_lines.append(format_result("WHOIS Lookup", "Could not determine creation date.", "❌"))
            return
        creation_date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        age = (datetime.datetime.now(creation_date.tzinfo) - creation_date).days
        # IMPROVEMENT: Join the status list into a clean, comma-separated string.
        status_text = ', '.join(w.status) if isinstance(w.status, list) else str(w.status)
        report_lines.append(format_result("Domain Status", status_text.replace('\n', ' '), "✅"))
        report_lines.append(format_result("Creation Date", creation_date.strftime("%Y-%m-%d"), "✅"))
        report_lines.append(format_result("Domain Age", f"{age} days (approx. {age // 365} years)", "✅"))
        if age < 180:
            report_lines.append(format_result("Age Warning", "Domain is less than 6 months old.", "⚠️"))
    except Exception as e:
        report_lines.append(format_result("WHOIS Lookup", f"Failed: {e}", "❌"))

def check_domain_blacklist(domain: str, report_lines: list):
    """Checks the domain's IP against popular DNS blacklists."""
    report_lines.append("\n--- 4. Spam Blacklist Check ---")
    try:
        ip_address = socket.gethostbyname(domain)
        report_lines.append(format_result("Resolved IP", ip_address))
        listed_on = None
        for server in DNSBL_SERVERS:
            try:
                dns.resolver.resolve(f"{'.'.join(reversed(ip_address.split('.')))}.{server}", 'A')
                listed_on = server
                break
            except dns.resolver.NXDOMAIN:
                continue
        if listed_on:
            report_lines.append(format_result("Blacklist Status", f"LISTED on {listed_on}", "❌"))
        else:
            report_lines.append(format_result("Blacklist Status", "Clean", "✅"))
    except Exception as e:
        report_lines.append(format_result("Blacklist Check", f"Failed: {e}", "❌"))

def main(target_url: str):
    """Main function to orchestrate all checks and generate a report."""
    domain = get_clean_domain(target_url)
    report_lines = [
        "=" * 50,
        f"Legitimacy Report for: {domain}",
        "=" * 50
    ]
    # Run checks
    check_https_status(domain, report_lines)
    find_key_pages(domain, report_lines)
    check_domain_whois(domain, report_lines)
    check_domain_blacklist(domain, report_lines)
    report_lines.extend([
        "\n" + "=" * 50,
        "Report Complete.",
        "Disclaimer: This is an automated check and not a guarantee of legitimacy.",
        "=" * 50
    ])
    full_report_text = "\n".join(report_lines)
    print(full_report_text)
    pdf_filename = f"report-for-{domain}.pdf"
    save_report_to_pdf(full_report_text, pdf_filename)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python legit_checker.py <website_url_or_domain>")
        sys.exit(1)
    main(sys.argv[1])