import sys
import requests
import re
import whois
import datetime
import socket
import dns.resolver
import json
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

def get_clean_domain(url: str) -> str:
    """Extracts a clean domain name from a URL."""
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc or parsed_url.path
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain

def check_https_status(domain: str):
    """Checks for HTTPS and proper redirection."""
    results = []
    try:
        requests.get(f"https://{domain}", headers=HEADERS, timeout=10, verify=False)
        results.append({"check": "HTTPS Connection", "result": "Successful", "status": "success"})
    except requests.RequestException:
        results.append({"check": "HTTPS Connection", "result": "Failed", "status": "error"})
    
    try:
        response = requests.get(f"http://{domain}", headers=HEADERS, allow_redirects=True, timeout=10, verify=False)
        if response.url.startswith("https://"):
            results.append({"check": "HTTP -> HTTPS Redirect", "result": "Yes", "status": "success"})
        else:
            results.append({"check": "HTTP -> HTTPS Redirect", "result": "No", "status": "warning"})
    except requests.RequestException:
        results.append({"check": "HTTP -> HTTPS Redirect", "result": "Check Failed", "status": "error"})
    
    return results

def find_key_pages(domain: str):
    """Finds links to key pages by scanning sitemap and homepage."""
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
    except Exception:
        pass
    
    try:
        homepage_url = f"https://{domain}"
        resp = requests.get(homepage_url, headers=HEADERS, timeout=10, verify=False)
        soup = BeautifulSoup(resp.content, "html.parser")
        for a_tag in soup.find_all("a", href=True):
            full_url = requests.compat.urljoin(homepage_url, a_tag['href'])
            urls_to_scan.add(full_url)
    except Exception:
        pass
    
    for url in urls_to_scan:
        for page_type, keys in KEYWORDS.items():
            if not found_pages[page_type] and any(key in url.lower() for key in keys):
                found_pages[page_type] = url
    
    results = []
    for page_type, url in found_pages.items():
        status = "success" if url else "warning"
        result = "Found" if url else "Not Found"
        results.append({"check": f"{page_type.capitalize()} Page", "result": result, "status": status})
    
    return results

def check_domain_whois(domain: str):
    """Performs a WHOIS lookup."""
    results = []
    try:
        w = whois.whois(domain)
        if not w.creation_date:
            results.append({"check": "WHOIS Lookup", "result": "Could not determine creation date", "status": "error"})
            return results
            
        creation_date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        age = (datetime.datetime.now(creation_date.tzinfo) - creation_date).days
        
        status_text = ', '.join(w.status) if isinstance(w.status, list) else str(w.status)
        results.append({"check": "Domain Status", "result": status_text.replace('\n', ' '), "status": "success"})
        results.append({"check": "Creation Date", "result": creation_date.strftime("%Y-%m-%d"), "status": "success"})
        results.append({"check": "Domain Age", "result": f"{age} days (approx. {age // 365} years)", "status": "success"})
        
        if age < 180:
            results.append({"check": "Age Warning", "result": "Domain is less than 6 months old", "status": "warning"})
            
    except Exception as e:
        results.append({"check": "WHOIS Lookup", "result": f"Failed: {e}", "status": "error"})
    
    return results

def check_domain_blacklist(domain: str):
    """Checks the domain's IP against popular DNS blacklists."""
    results = []
    try:
        ip_address = socket.gethostbyname(domain)
        results.append({"check": "Resolved IP", "result": ip_address, "status": "info"})
        
        listed_on = None
        for server in DNSBL_SERVERS:
            try:
                dns.resolver.resolve(f"{'.'.join(reversed(ip_address.split('.')))}.{server}", 'A')
                listed_on = server
                break
            except dns.resolver.NXDOMAIN:
                continue
        
        if listed_on:
            results.append({"check": "Blacklist Status", "result": f"LISTED on {listed_on}", "status": "error"})
        else:
            results.append({"check": "Blacklist Status", "result": "Clean", "status": "success"})
            
    except Exception as e:
        results.append({"check": "Blacklist Check", "result": f"Failed: {e}", "status": "error"})
    
    return results

def main(target_url: str):
    """Main function to orchestrate all checks and generate a JSON report."""
    domain = get_clean_domain(target_url)
    
    # Run all checks
    all_results = []
    all_results.extend(check_https_status(domain))
    all_results.extend(find_key_pages(domain))
    all_results.extend(check_domain_whois(domain))
    all_results.extend(check_domain_blacklist(domain))
    
    # Calculate summary
    success_count = len([r for r in all_results if r["status"] == "success"])
    warning_count = len([r for r in all_results if r["status"] == "warning"])
    error_count = len([r for r in all_results if r["status"] == "error"])
    
    overall_status = "good"
    if error_count > 0 or success_count < 6:
        overall_status = "poor"
    elif warning_count > 3:
        overall_status = "moderate"
    
    report = {
        "domain": domain,
        "timestamp": datetime.datetime.now().isoformat(),
        "results": all_results,
        "summary": {
            "total": len(all_results),
            "passed": success_count,
            "warnings": warning_count,
            "failed": error_count,
            "overallStatus": overall_status,
            "score": round((success_count * 100) / len(all_results))
        }
    }
    
    # Output JSON for API consumption
    print(json.dumps(report, indent=2))
    
    return report

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python legit_checker_api.py <website_url_or_domain>"}))
        sys.exit(1)
    
    try:
        main(sys.argv[1])
    except Exception as e:
        print(json.dumps({"error": f"Analysis failed: {str(e)}"}))
        sys.exit(1)
