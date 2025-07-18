import sys
import requests
import re
import whois
import datetime
import socket
import dns.resolver
import ssl
import json
import time
from urllib.parse import urlparse, urljoin
from xml.etree import ElementTree
from bs4 import BeautifulSoup
import urllib3
from typing import Dict, List, Tuple, Optional

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Business keywords for page detection
BUSINESS_KEYWORDS = {
    "contact": ["contact", "contact-us", "support", "reach-us"],
    "privacy": ["privacy", "policy", "privacy-policy", "data-protection"],
    "terms": ["terms", "conditions", "tos", "terms-of-service"],
    "refund": ["refund", "return", "cancellation", "money-back"],
    "about": ["about", "about-us", "company", "our-story"],
}

# Enhanced blacklist servers
DNSBL_SERVERS = [
    "zen.spamhaus.org", "bl.spamcop.net", "b.barracudacentral.org",
    "cbl.abuseat.org", "pbl.spamhaus.org", "sbl.spamhaus.org"
]

# Trust indicators - updated for better platform recognition
TRUST_INDICATORS = [
    # Security & Technical
    "ssl certificate", "https", "secure", "security", "encrypted", "certificate",
    # Business legitimacy
    "business registration", "vat number", "tax id", "company", "corporation", "llc",
    # Contact & Support
    "physical address", "phone number", "customer service", "support", "help", "contact",
    # Social presence
    "social media", "linkedin", "facebook", "twitter", "instagram", "youtube",
    # Payment & E-commerce
    "payment methods", "paypal", "stripe", "visa", "mastercard", "checkout", "cart",
    # Trust badges & certifications
    "security badges", "norton", "verisign", "trustpilot", "better business bureau",
    # Tech platforms & APIs
    "api", "developer", "documentation", "github", "repository", "open source",
    # Professional services
    "terms of service", "privacy policy", "gdpr", "compliance", "legal"
]

def get_clean_domain(url: str) -> str:
    """Extract clean domain from URL."""
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc or parsed_url.path
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain.lower()

def calculate_trust_score(category_scores: List[Dict]) -> Tuple[int, str]:
    """Calculate overall trust score."""
    total_score = 0
    max_possible = 0
    
    for category in category_scores:
        total_score += category['score']
        max_possible += category['max_score']
    
    percentage = (total_score / max_possible * 100) if max_possible > 0 else 0
    
    # More realistic thresholds
    if percentage >= 80:
        return int(percentage), "HIGHLY_TRUSTWORTHY"
    elif percentage >= 65:
        return int(percentage), "TRUSTWORTHY"
    elif percentage >= 45:
        return int(percentage), "MODERATE_RISK"
    elif percentage >= 25:
        return int(percentage), "HIGH_RISK"
    else:
        return int(percentage), "VERY_HIGH_RISK"

def check_ssl_security(domain: str):
    """Check SSL security."""
    results = []
    total_score = 0
    
    try:
        # HTTPS connection
        response = requests.get(f"https://{domain}", headers=HEADERS, timeout=15, verify=True)
        results.append({"check": "HTTPS Connection", "result": "Successful", "status": "success", "score": 10})
        total_score += 10
        
        # SSL Certificate
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                expiry_date = datetime.datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                days_to_expiry = (expiry_date - datetime.datetime.now()).days
                
                if days_to_expiry > 30:
                    results.append({"check": "SSL Certificate", "result": f"Valid until {expiry_date.strftime('%Y-%m-%d')}", "status": "success", "score": 10})
                    total_score += 10
                elif days_to_expiry > 0:
                    results.append({"check": "SSL Certificate", "result": f"Expires soon: {expiry_date.strftime('%Y-%m-%d')}", "status": "warning", "score": 5})
                    total_score += 5
                else:
                    results.append({"check": "SSL Certificate", "result": "EXPIRED", "status": "error", "score": 0})
                
                # Certificate Authority
                issuer = dict(x[0] for x in cert['issuer'])
                ca_name = issuer.get('organizationName', 'Unknown')
                trusted_cas = ['DigiCert', 'Let\'s Encrypt', 'Comodo', 'GeoTrust', 'Symantec', 'Sectigo', 'GlobalSign', 'Entrust', 'Google Trust Services']
                
                if any(ca in ca_name for ca in trusted_cas):
                    results.append({"check": "Certificate Authority", "result": ca_name, "status": "success", "score": 5})
                    total_score += 5
                else:
                    results.append({"check": "Certificate Authority", "result": ca_name, "status": "warning", "score": 2})
                    total_score += 2
                
    except Exception as e:
        results.append({"check": "SSL Analysis", "result": f"Error: {str(e)[:50]}", "status": "error", "score": 0})
    
    # HTTP to HTTPS redirect
    try:
        http_response = requests.get(f"http://{domain}", headers=HEADERS, allow_redirects=True, timeout=10)
        if http_response.url.startswith("https://"):
            results.append({"check": "HTTP to HTTPS Redirect", "result": "Automatic redirect", "status": "success", "score": 5})
            total_score += 5
        else:
            results.append({"check": "HTTP to HTTPS Redirect", "result": "No redirect", "status": "error", "score": 0})
    except:
        results.append({"check": "HTTP to HTTPS Redirect", "result": "Check failed", "status": "error", "score": 0})
    
    return results, total_score, 30

def check_business_pages(domain: str):
    """Check business pages and content."""
    results = []
    total_score = 0
    found_pages = {key: None for key in BUSINESS_KEYWORDS}
    
    try:
        # Homepage analysis
        homepage_url = f"https://{domain}"
        resp = requests.get(homepage_url, headers=HEADERS, timeout=15, verify=False)
        soup = BeautifulSoup(resp.content, "html.parser")
        page_text = soup.get_text().lower()
        
        # Extract all links
        urls_to_scan = set()
        for a_tag in soup.find_all("a", href=True):
            full_url = urljoin(homepage_url, a_tag['href'])
            if domain in full_url:
                urls_to_scan.add(full_url)
        
        # Trust indicators - more flexible scoring
        trust_found = sum(1 for indicator in TRUST_INDICATORS if indicator in page_text)
        
        if trust_found >= 8:
            results.append({"check": "Trust Indicators", "result": f"Found {trust_found} indicators", "status": "success", "score": 15})
            total_score += 15
        elif trust_found >= 5:
            results.append({"check": "Trust Indicators", "result": f"Found {trust_found} indicators", "status": "success", "score": 12})
            total_score += 12
        elif trust_found >= 3:
            results.append({"check": "Trust Indicators", "result": f"Found {trust_found} indicators", "status": "warning", "score": 8})
            total_score += 8
        elif trust_found >= 1:
            results.append({"check": "Trust Indicators", "result": f"Found {trust_found} indicators", "status": "warning", "score": 4})
            total_score += 4
        else:
            results.append({"check": "Trust Indicators", "result": f"Found {trust_found} indicators", "status": "error", "score": 0})
        
        # Contact information patterns
        contact_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Phone
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
        ]
        
        contact_found = sum(1 for pattern in contact_patterns if re.search(pattern, page_text))
        
        if contact_found >= 2:
            results.append({"check": "Contact Information", "result": "Multiple contact methods found", "status": "success", "score": 8})
            total_score += 8
        elif contact_found == 1:
            results.append({"check": "Contact Information", "result": "Limited contact info", "status": "warning", "score": 4})
            total_score += 4
        else:
            results.append({"check": "Contact Information", "result": "No clear contact info", "status": "error", "score": 0})
        
        # Check for business pages
        essential_pages = ['contact', 'privacy', 'terms', 'about']
        pages_found = 0
        
        for url in list(urls_to_scan)[:50]:  # Limit to avoid timeout
            try:
                for page_type, keywords in BUSINESS_KEYWORDS.items():
                    if not found_pages[page_type] and any(keyword in url.lower() for keyword in keywords):
                        found_pages[page_type] = url
                        if page_type in essential_pages:
                            pages_found += 1
            except:
                continue
        
        if pages_found >= 3:
            results.append({"check": "Essential Pages", "result": f"{pages_found}/4 found", "status": "success", "score": 12})
            total_score += 12
        elif pages_found >= 2:
            results.append({"check": "Essential Pages", "result": f"{pages_found}/4 found", "status": "warning", "score": 6})
            total_score += 6
        else:
            results.append({"check": "Essential Pages", "result": f"Only {pages_found}/4 found", "status": "error", "score": 0})
        
    except Exception as e:
        results.append({"check": "Business Content Analysis", "result": f"Error: {str(e)[:50]}", "status": "error", "score": 0})
    
    return results, total_score, 35

def check_domain_reputation(domain: str):
    """Check domain reputation via WHOIS."""
    results = []
    total_score = 0
    
    try:
        w = whois.whois(domain)
        
        if not w.creation_date:
            results.append({"check": "WHOIS Lookup", "result": "No creation date found", "status": "error", "score": 0})
            return results, 0, 20
        
        # Domain age
        creation_date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        if creation_date.tzinfo is None:
            creation_date = creation_date.replace(tzinfo=datetime.timezone.utc)
        
        current_time = datetime.datetime.now(datetime.timezone.utc)
        age_days = (current_time - creation_date).days
        age_years = age_days // 365
        
        if age_days >= 1095:  # 3+ years
            results.append({"check": "Domain Age", "result": f"{age_years} years ({age_days} days)", "status": "success", "score": 10})
            total_score += 10
        elif age_days >= 365:  # 1+ years
            results.append({"check": "Domain Age", "result": f"{age_years} year(s) ({age_days} days)", "status": "success", "score": 7})
            total_score += 7
        elif age_days >= 180:  # 6+ months
            results.append({"check": "Domain Age", "result": f"{age_days} days", "status": "warning", "score": 3})
            total_score += 3
        else:
            results.append({"check": "Domain Age", "result": f"{age_days} days (very new)", "status": "error", "score": 0})
        
        # Registrar
        if w.registrar:
            trusted_registrars = ['GoDaddy', 'Namecheap', 'Google', 'Amazon', 'Cloudflare', 'MarkMonitor', 'Network Solutions', 'Tucows', 'Enom', 'Register.com']
            if any(reg.lower() in w.registrar.lower() for reg in trusted_registrars):
                results.append({"check": "Registrar", "result": w.registrar, "status": "success", "score": 5})
                total_score += 5
            else:
                results.append({"check": "Registrar", "result": w.registrar, "status": "warning", "score": 2})
                total_score += 2
        
        # Creation date info
        results.append({"check": "Creation Date", "result": creation_date.strftime("%Y-%m-%d"), "status": "info", "score": 0})
        
    except Exception as e:
        results.append({"check": "WHOIS Analysis", "result": f"Failed: {str(e)[:40]}", "status": "error", "score": 0})
    
    return results, total_score, 20

def check_security_reputation(domain: str):
    """Check security and blacklist status."""
    results = []
    total_score = 0
    
    try:
        ip_address = socket.gethostbyname(domain)
        results.append({"check": "IP Resolution", "result": ip_address, "status": "success", "score": 2})
        total_score += 2
        
        # Blacklist checking
        blacklisted_on = []
        for server in DNSBL_SERVERS:
            try:
                reversed_ip = '.'.join(reversed(ip_address.split('.')))
                dns.resolver.resolve(f"{reversed_ip}.{server}", 'A')
                blacklisted_on.append(server)
            except dns.resolver.NXDOMAIN:
                continue
            except:
                continue
        
        if not blacklisted_on:
            results.append({"check": "Blacklist Status", "result": "Clean on major blacklists", "status": "success", "score": 8})
            total_score += 8
        else:
            results.append({"check": "Blacklist Status", "result": f"Listed on {len(blacklisted_on)} blacklist(s)", "status": "error", "score": 0})
        
    except Exception as e:
        results.append({"check": "Security Check", "result": f"Error: {str(e)[:40]}", "status": "error", "score": 0})
    
    return results, total_score, 10

def analyze_domain(target_url: str):
    """Main analysis function."""
    domain = get_clean_domain(target_url)
    all_results = []
    category_scores = []
    
    # Run checks
    ssl_results, ssl_score, ssl_max = check_ssl_security(domain)
    all_results.extend(ssl_results)
    category_scores.append({'category': 'SSL Security', 'score': ssl_score, 'max_score': ssl_max})
    
    time.sleep(1)
    
    business_results, business_score, business_max = check_business_pages(domain)
    all_results.extend(business_results)
    category_scores.append({'category': 'Business Content', 'score': business_score, 'max_score': business_max})
    
    time.sleep(1)
    
    domain_results, domain_score, domain_max = check_domain_reputation(domain)
    all_results.extend(domain_results)
    category_scores.append({'category': 'Domain Reputation', 'score': domain_score, 'max_score': domain_max})
    
    time.sleep(1)
    
    security_results, security_score, security_max = check_security_reputation(domain)
    all_results.extend(security_results)
    category_scores.append({'category': 'Security Reputation', 'score': security_score, 'max_score': security_max})
    
    # Calculate trust score
    trust_score, trust_level = calculate_trust_score(category_scores)
    
    # Return results
    return {
        'domain': domain,
        'timestamp': datetime.datetime.now().isoformat(),
        'trust_score': trust_score,
        'trust_level': trust_level,
        'overall_status': 'success' if trust_score >= 65 else 'warning' if trust_score >= 45 else 'error',
        'category_scores': category_scores,
        'results': all_results,
        'recommendation': get_recommendation(trust_score)
    }

def get_recommendation(trust_score: int) -> str:
    """Get onboarding recommendation."""
    if trust_score >= 80:
        return "LOW RISK - Recommended for immediate onboarding"
    elif trust_score >= 65:
        return "MODERATE RISK - Approved for onboarding with standard monitoring"
    elif trust_score >= 45:
        return "ELEVATED RISK - Additional verification recommended"
    elif trust_score >= 25:
        return "HIGH RISK - Enhanced due diligence required"
    else:
        return "VERY HIGH RISK - NOT RECOMMENDED for onboarding"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python legit_checker_api.py <website_url_or_domain>")
        print("Example: python legit_checker_api.py https://example.com")
        sys.exit(1)
    
    result = analyze_domain(sys.argv[1])
    print(json.dumps(result, indent=2))
