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
from fpdf import FPDF
import os
import hashlib
import base64
from typing import Dict, List, Tuple, Optional

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- Enhanced Configuration ---
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Comprehensive keyword mapping for business legitimacy
BUSINESS_KEYWORDS = {
    "contact": ["contact", "kontakt", "contact-us", "support", "reach-us", "get-in-touch"],
    "privacy": ["privacy", "policy", "datenschutz", "privacy-policy", "data-protection"],
    "terms": ["terms", "conditions", "tos", "agb", "terms-of-service", "terms-conditions"],
    "refund": ["refund", "return", "cancellation", "widerruf", "money-back", "guarantee"],
    "shipping": ["shipping", "delivery", "versand", "fulfillment", "logistics"],
    "about": ["about", "about-us", "impressum", "uber-uns", "company", "our-story", "who-we-are"],
    "careers": ["careers", "jobs", "employment", "hiring", "work-with-us"],
    "legal": ["legal", "compliance", "regulations", "disclaimer"],
    "security": ["security", "safety", "secure", "protection"],
    "faq": ["faq", "help", "support", "questions", "answers"],
    "testimonials": ["testimonials", "reviews", "feedback", "customers"],
    "press": ["press", "media", "news", "announcements"],
}

# Enhanced blacklist servers
ENHANCED_DNSBL = [
    "zen.spamhaus.org", "bl.spamcop.net", "b.barracudacentral.org",
    "cbl.abuseat.org", "pbl.spamhaus.org", "sbl.spamhaus.org",
    "dnsbl.sorbs.net", "ix.dnsbl.manitu.net"
]

# Business legitimacy indicators
TRUST_INDICATORS = [
    "ssl certificate", "business registration", "vat number", "tax id",
    "physical address", "phone number", "business hours", "customer service",
    "social media", "linkedin", "facebook", "twitter", "youtube",
    "payment methods", "paypal", "stripe", "visa", "mastercard",
    "security badges", "mcafee", "norton", "verisign", "trustpilot",
    "awards", "certifications", "accreditation", "iso", "better business bureau"
]

# --- Enhanced Helper Functions ---

def get_clean_domain(url: str) -> str:
    """Extracts a clean domain name from a URL."""
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc or parsed_url.path
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain.lower()

def format_result(check: str, result: str, status: str = "[i]", score: int = 0) -> str:
    """Formats a result line with trust score."""
    prefix = f"{status} {check}"
    score_text = f" (Score: {score})" if score != 0 else ""
    return f"{prefix:<35}: {result}{score_text}"

def calculate_trust_score(results: List[Dict]) -> Tuple[int, str]:
    """Calculate overall trust score based on all checks."""
    total_score = 0
    max_possible = 0
    
    for result in results:
        score = result.get('score', 0)
        max_score = result.get('max_score', 10)
        total_score += score
        max_possible += max_score
    
    percentage = (total_score / max_possible * 100) if max_possible > 0 else 0
    
    if percentage >= 85:
        return int(percentage), "HIGHLY TRUSTWORTHY"
    elif percentage >= 70:
        return int(percentage), "TRUSTWORTHY"
    elif percentage >= 50:
        return int(percentage), "MODERATE RISK"
    elif percentage >= 30:
        return int(percentage), "HIGH RISK"
    else:
        return int(percentage), "VERY HIGH RISK"

def save_enhanced_report_to_pdf(report_text: str, domain: str, trust_score: int, trust_level: str):
    """Creates a professional PDF report with enhanced formatting."""
    filename = f"legitimacy_report_{domain}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    pdf = FPDF()
    pdf.add_page()
    
    # Header section
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "BUSINESS LEGITIMACY VERIFICATION REPORT", 0, 1, "C")
    pdf.ln(5)
    
    # Trust score section with color coding
    pdf.set_font("Arial", "B", 14)
    if trust_score >= 70:
        color = (0, 128, 0)  # Green
    elif trust_score >= 50:
        color = (255, 165, 0)  # Orange
    else:
        color = (255, 0, 0)  # Red
    
    pdf.set_text_color(*color)
    pdf.cell(0, 10, f"TRUST SCORE: {trust_score}% - {trust_level}", 0, 1, "C")
    pdf.set_text_color(0, 0, 0)  # Reset to black
    pdf.ln(5)
    
    # Domain and date info
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 6, f"Domain: {domain}", 0, 1)
    pdf.cell(0, 6, f"Report Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
    pdf.ln(10)
    
    # Report content
    pdf.set_font("Courier", "", 9)
    for line in report_text.split('\n'):
        clean_line = line.encode('latin-1', 'replace').decode('latin-1')
        if len(clean_line) > 85:
            words = clean_line.split(' ')
            current_line = ""
            for word in words:
                if len(current_line + word) < 85:
                    current_line += word + " "
                else:
                    pdf.cell(0, 4, current_line.strip(), 0, 1)
                    current_line = word + " "
            if current_line:
                pdf.cell(0, 4, current_line.strip(), 0, 1)
        else:
            pdf.cell(0, 4, clean_line, 0, 1)
    
    pdf.output(filename)
    print(f"\n{'='*70}")
    print(f"✅ COMPREHENSIVE REPORT SAVED: {filename}")
    print(f"📊 TRUST SCORE: {trust_score}% ({trust_level})")
    print(f"{'='*70}")
    return filename


# --- Enhanced Security & SSL Checks ---

def check_ssl_security(domain: str, report_lines: list, results: list):
    """Comprehensive SSL certificate and security analysis."""
    report_lines.append("\n--- 1. SSL/TLS Security Analysis ---")
    total_score = 0
    
    try:
        # Basic HTTPS connectivity
        response = requests.get(f"https://{domain}", headers=HEADERS, timeout=15, verify=True)
        report_lines.append(format_result("HTTPS Connection", "✅ Successful", "✅", 10))
        total_score += 10
        
        # SSL Certificate details
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                # Certificate expiry
                expiry_date = datetime.datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                days_to_expiry = (expiry_date - datetime.datetime.now()).days
                
                if days_to_expiry > 30:
                    report_lines.append(format_result("SSL Certificate", f"✅ Valid until {expiry_date.strftime('%Y-%m-%d')} ({days_to_expiry} days)", "✅", 10))
                    total_score += 10
                elif days_to_expiry > 0:
                    report_lines.append(format_result("SSL Certificate", f"⚠️ Expires soon: {expiry_date.strftime('%Y-%m-%d')} ({days_to_expiry} days)", "⚠️", 5))
                    total_score += 5
                else:
                    report_lines.append(format_result("SSL Certificate", "❌ EXPIRED", "❌", 0))
                
                # Certificate authority
                issuer = dict(x[0] for x in cert['issuer'])
                ca_name = issuer.get('organizationName', 'Unknown')
                trusted_cas = ['DigiCert', 'Let\'s Encrypt', 'Comodo', 'GeoTrust', 'Symantec', 'GlobalSign', 'Entrust']
                
                if any(ca in ca_name for ca in trusted_cas):
                    report_lines.append(format_result("Certificate Authority", f"✅ {ca_name}", "✅", 5))
                    total_score += 5
                else:
                    report_lines.append(format_result("Certificate Authority", f"⚠️ {ca_name}", "⚠️", 2))
                    total_score += 2
                
    except ssl.SSLError as e:
        report_lines.append(format_result("SSL Connection", f"❌ SSL Error: {str(e)[:50]}", "❌", 0))
    except requests.RequestException as e:
        report_lines.append(format_result("HTTPS Connection", f"❌ Failed: {str(e)[:50]}", "❌", 0))
    except Exception as e:
        report_lines.append(format_result("SSL Analysis", f"❌ Error: {str(e)[:50]}", "❌", 0))
    
    # HTTP to HTTPS redirect check
    try:
        http_response = requests.get(f"http://{domain}", headers=HEADERS, allow_redirects=True, timeout=10)
        if http_response.url.startswith("https://"):
            report_lines.append(format_result("HTTP → HTTPS Redirect", "✅ Automatic redirect", "✅", 5))
            total_score += 5
        else:
            report_lines.append(format_result("HTTP → HTTPS Redirect", "❌ No redirect", "❌", 0))
    except:
        report_lines.append(format_result("HTTP → HTTPS Redirect", "❌ Check failed", "❌", 0))
    
    results.append({'category': 'SSL Security', 'score': total_score, 'max_score': 30})

def check_business_pages(domain: str, report_lines: list, results: list):
    """Comprehensive business page and content analysis."""
    report_lines.append("\n--- 2. Business Legitimacy & Content Analysis ---")
    total_score = 0
    found_pages = {key: None for key in BUSINESS_KEYWORDS}
    business_indicators = []
    
    # Collect URLs to scan
    urls_to_scan = set()
    
    try:
        # Scan robots.txt and sitemap
        robots_url = f"https://{domain}/robots.txt"
        resp = requests.get(robots_url, headers=HEADERS, timeout=10, verify=False)
        if resp.status_code == 200:
            # Find sitemaps
            sitemaps = re.findall(r"Sitemap:\s*(.*)", resp.text, re.IGNORECASE)
            report_lines.append(format_result("Robots.txt", f"✅ Found, {len(sitemaps)} sitemaps", "✅", 2))
            total_score += 2
            
            for sitemap_url in sitemaps[:3]:  # Limit to first 3 sitemaps
                try:
                    sitemap_resp = requests.get(sitemap_url.strip(), headers=HEADERS, timeout=10, verify=False)
                    if sitemap_resp.status_code == 200:
                        # Parse XML sitemap
                        root = ElementTree.fromstring(sitemap_resp.content)
                        for loc in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
                            urls_to_scan.add(loc.text)
                except:
                    continue
        else:
            report_lines.append(format_result("Robots.txt", "⚠️ Not found", "⚠️", 0))
            
    except Exception as e:
        report_lines.append(format_result("Robots.txt", f"❌ Error: {str(e)[:30]}", "❌", 0))
    
    # Scan homepage for links and content
    try:
        homepage_url = f"https://{domain}"
        resp = requests.get(homepage_url, headers=HEADERS, timeout=15, verify=False)
        soup = BeautifulSoup(resp.content, "html.parser")
        
        # Extract all links
        for a_tag in soup.find_all("a", href=True):
            full_url = urljoin(homepage_url, a_tag['href'])
            if domain in full_url:  # Only include same-domain links
                urls_to_scan.add(full_url)
        
        # Analyze homepage content for business indicators
        page_text = soup.get_text().lower()
        
        # Check for trust indicators
        trust_found = 0
        for indicator in TRUST_INDICATORS:
            if indicator in page_text:
                business_indicators.append(indicator)
                trust_found += 1
        
        if trust_found >= 10:
            report_lines.append(format_result("Trust Indicators", f"✅ Found {trust_found} indicators", "✅", 10))
            total_score += 10
        elif trust_found >= 5:
            report_lines.append(format_result("Trust Indicators", f"✅ Found {trust_found} indicators", "✅", 7))
            total_score += 7
        elif trust_found >= 2:
            report_lines.append(format_result("Trust Indicators", f"⚠️ Found {trust_found} indicators", "⚠️", 3))
            total_score += 3
        else:
            report_lines.append(format_result("Trust Indicators", f"❌ Found {trust_found} indicators", "❌", 0))
        
        # Check for contact information
        contact_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Phone numbers
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b'  # Addresses
        ]
        
        contact_found = 0
        for pattern in contact_patterns:
            if re.search(pattern, page_text):
                contact_found += 1
        
        if contact_found >= 2:
            report_lines.append(format_result("Contact Information", f"✅ Multiple contact methods found", "✅", 8))
            total_score += 8
        elif contact_found == 1:
            report_lines.append(format_result("Contact Information", f"⚠️ Limited contact info", "⚠️", 4))
            total_score += 4
        else:
            report_lines.append(format_result("Contact Information", f"❌ No clear contact info", "❌", 0))
            
    except Exception as e:
        report_lines.append(format_result("Homepage Analysis", f"❌ Failed: {str(e)[:30]}", "❌", 0))
    
    # Check for essential business pages
    essential_pages = ['contact', 'privacy', 'terms', 'about']
    pages_found = 0
    
    for url in list(urls_to_scan)[:100]:  # Limit scanning to prevent timeout
        try:
            for page_type, keywords in BUSINESS_KEYWORDS.items():
                if not found_pages[page_type] and any(keyword in url.lower() for keyword in keywords):
                    found_pages[page_type] = url
                    if page_type in essential_pages:
                        pages_found += 1
        except:
            continue
    
    # Score based on essential pages found
    if pages_found >= 4:
        report_lines.append(format_result("Essential Pages", f"✅ All {pages_found}/4 found", "✅", 15))
        total_score += 15
    elif pages_found >= 3:
        report_lines.append(format_result("Essential Pages", f"✅ {pages_found}/4 found", "✅", 10))
        total_score += 10
    elif pages_found >= 2:
        report_lines.append(format_result("Essential Pages", f"⚠️ {pages_found}/4 found", "⚠️", 5))
        total_score += 5
    else:
        report_lines.append(format_result("Essential Pages", f"❌ Only {pages_found}/4 found", "❌", 0))
    
    # Detailed page findings
    for page_type, url in found_pages.items():
        status = "✅" if url else "❌"
        result = "Found" if url else "Not Found"
        report_lines.append(format_result(f"  {page_type.capitalize()} Page", result, status))
    
    results.append({'category': 'Business Content', 'score': total_score, 'max_score': 35})

def check_domain_reputation(domain: str, report_lines: list, results: list):
    """Enhanced domain reputation and WHOIS analysis."""
    report_lines.append("\n--- 3. Domain Reputation & Registration Analysis ---")
    total_score = 0
    
    try:
        w = whois.whois(domain)
        
        if not w.creation_date:
            report_lines.append(format_result("WHOIS Lookup", "❌ No creation date found", "❌", 0))
            results.append({'category': 'Domain Reputation', 'score': 0, 'max_score': 25})
            return
        
        # Handle creation date (can be list or single value)
        creation_date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        if creation_date.tzinfo is None:
            creation_date = creation_date.replace(tzinfo=datetime.timezone.utc)
        
        current_time = datetime.datetime.now(datetime.timezone.utc)
        age_days = (current_time - creation_date).days
        age_years = age_days // 365
        
        # Domain age scoring
        if age_days >= 1095:  # 3+ years
            report_lines.append(format_result("Domain Age", f"✅ {age_years} years ({age_days} days)", "✅", 10))
            total_score += 10
        elif age_days >= 365:  # 1+ years
            report_lines.append(format_result("Domain Age", f"✅ {age_years} year(s) ({age_days} days)", "✅", 7))
            total_score += 7
        elif age_days >= 180:  # 6+ months
            report_lines.append(format_result("Domain Age", f"⚠️ {age_days} days (less than 1 year)", "⚠️", 3))
            total_score += 3
        else:  # Less than 6 months
            report_lines.append(format_result("Domain Age", f"❌ {age_days} days (very new domain)", "❌", 0))
        
        # Expiry date
        if w.expiration_date:
            expiry_date = w.expiration_date[0] if isinstance(w.expiration_date, list) else w.expiration_date
            if expiry_date.tzinfo is None:
                expiry_date = expiry_date.replace(tzinfo=datetime.timezone.utc)
            
            days_to_expiry = (expiry_date - current_time).days
            if days_to_expiry > 365:
                report_lines.append(format_result("Domain Expiry", f"✅ {expiry_date.strftime('%Y-%m-%d')} ({days_to_expiry} days)", "✅", 3))
                total_score += 3
            elif days_to_expiry > 90:
                report_lines.append(format_result("Domain Expiry", f"⚠️ {expiry_date.strftime('%Y-%m-%d')} ({days_to_expiry} days)", "⚠️", 2))
                total_score += 2
            else:
                report_lines.append(format_result("Domain Expiry", f"❌ Expires soon: {expiry_date.strftime('%Y-%m-%d')}", "❌", 0))
        
        # Domain status
        if w.status:
            status_list = w.status if isinstance(w.status, list) else [w.status]
            clean_statuses = [s.split()[0] if ' ' in s else s for s in status_list]
            status_text = ', '.join(clean_statuses[:3])  # Limit to first 3 statuses
            
            if any('clientTransferProhibited' in s for s in status_list):
                report_lines.append(format_result("Domain Status", f"✅ {status_text}", "✅", 3))
                total_score += 3
            else:
                report_lines.append(format_result("Domain Status", f"⚠️ {status_text}", "⚠️", 1))
                total_score += 1
        
        # Registrar info
        if w.registrar:
            trusted_registrars = ['GoDaddy', 'Namecheap', 'Google', 'Amazon', 'Cloudflare', 'Network Solutions']
            if any(reg.lower() in w.registrar.lower() for reg in trusted_registrars):
                report_lines.append(format_result("Registrar", f"✅ {w.registrar}", "✅", 2))
                total_score += 2
            else:
                report_lines.append(format_result("Registrar", f"⚠️ {w.registrar}", "⚠️", 1))
                total_score += 1
        
        # Creation date
        report_lines.append(format_result("Creation Date", creation_date.strftime("%Y-%m-%d"), "ℹ️"))
        
    except Exception as e:
        report_lines.append(format_result("WHOIS Analysis", f"❌ Failed: {str(e)[:40]}", "❌", 0))
    
    results.append({'category': 'Domain Reputation', 'score': total_score, 'max_score': 25})

def check_security_reputation(domain: str, report_lines: list, results: list):
    """Enhanced security and blacklist checking."""
    report_lines.append("\n--- 4. Security & Blacklist Analysis ---")
    total_score = 0
    
    try:
        ip_address = socket.gethostbyname(domain)
        report_lines.append(format_result("IP Resolution", f"✅ {ip_address}", "✅", 2))
        total_score += 2
        
        # Enhanced blacklist checking
        blacklisted_on = []
        for server in ENHANCED_DNSBL:
            try:
                reversed_ip = '.'.join(reversed(ip_address.split('.')))
                dns.resolver.resolve(f"{reversed_ip}.{server}", 'A')
                blacklisted_on.append(server)
            except dns.resolver.NXDOMAIN:
                continue
            except:
                continue
        
        if not blacklisted_on:
            report_lines.append(format_result("Blacklist Status", "✅ Clean on all major blacklists", "✅", 10))
            total_score += 10
        elif len(blacklisted_on) <= 2:
            report_lines.append(format_result("Blacklist Status", f"⚠️ Listed on {len(blacklisted_on)} blacklist(s)", "⚠️", 3))
            total_score += 3
        else:
            report_lines.append(format_result("Blacklist Status", f"❌ Listed on {len(blacklisted_on)} blacklists", "❌", 0))
            for bl in blacklisted_on[:3]:  # Show first 3
                report_lines.append(format_result("  Listed on", bl, "❌"))
        
        # Check for CDN/Security services
        try:
            response = requests.get(f"https://{domain}", headers=HEADERS, timeout=10, verify=False)
            security_headers = ['cf-ray', 'x-served-by', 'x-cache', 'server']
            security_services = []
            
            for header in security_headers:
                if header in response.headers:
                    value = response.headers[header].lower()
                    if 'cloudflare' in value:
                        security_services.append('Cloudflare')
                    elif 'fastly' in value:
                        security_services.append('Fastly')
                    elif 'amazon' in value or 'aws' in value:
                        security_services.append('AWS')
            
            if security_services:
                services_text = ', '.join(set(security_services))
                report_lines.append(format_result("Security Services", f"✅ {services_text}", "✅", 3))
                total_score += 3
            else:
                report_lines.append(format_result("Security Services", "⚠️ No major CDN/security detected", "⚠️", 0))
                
        except:
            report_lines.append(format_result("Security Services", "❌ Could not determine", "❌", 0))
        
    except socket.gaierror:
        report_lines.append(format_result("IP Resolution", "❌ Failed to resolve domain", "❌", 0))
    except Exception as e:
        report_lines.append(format_result("Security Check", f"❌ Error: {str(e)[:40]}", "❌", 0))
    
    results.append({'category': 'Security Reputation', 'score': total_score, 'max_score': 15})

def check_business_verification(domain: str, report_lines: list, results: list):
    """Advanced business verification checks."""
    report_lines.append("\n--- 5. Advanced Business Verification ---")
    total_score = 0
    
    try:
        response = requests.get(f"https://{domain}", headers=HEADERS, timeout=15, verify=False)
        soup = BeautifulSoup(response.content, "html.parser")
        page_text = soup.get_text().lower()
        
        # Check for business registration numbers
        business_patterns = [
            r'\b(?:company|registration|reg\.?)\s*(?:number|no\.?|#)\s*:?\s*([a-z0-9\-]+)',
            r'\bvat\s*(?:number|no\.?|#)\s*:?\s*([a-z0-9\-]+)',
            r'\btax\s*(?:id|number|no\.?)\s*:?\s*([a-z0-9\-]+)',
            r'\b(?:ein|federal id)\s*:?\s*([0-9\-]+)',
        ]
        
        business_numbers_found = 0
        for pattern in business_patterns:
            if re.search(pattern, page_text, re.IGNORECASE):
                business_numbers_found += 1
        
        if business_numbers_found >= 2:
            report_lines.append(format_result("Business Registration", f"✅ Multiple registration numbers found", "✅", 8))
            total_score += 8
        elif business_numbers_found == 1:
            report_lines.append(format_result("Business Registration", f"✅ Registration number found", "✅", 5))
            total_score += 5
        else:
            report_lines.append(format_result("Business Registration", f"⚠️ No registration numbers found", "⚠️", 0))
        
        # Check for physical address
        address_patterns = [
            r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)',
            r'\b\d{5}(?:-\d{4})?\b',  # ZIP codes
            r'\b[A-Z]{2}\s+\d{5}\b',  # State + ZIP
        ]
        
        address_found = any(re.search(pattern, page_text, re.IGNORECASE) for pattern in address_patterns)
        
        if address_found:
            report_lines.append(format_result("Physical Address", "✅ Address information found", "✅", 5))
            total_score += 5
        else:
            report_lines.append(format_result("Physical Address", "⚠️ No clear address found", "⚠️", 0))
        
        # Check for social media presence
        social_platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube']
        social_found = sum(1 for platform in social_platforms if platform in page_text)
        
        if social_found >= 3:
            report_lines.append(format_result("Social Media Presence", f"✅ {social_found} platforms found", "✅", 5))
            total_score += 5
        elif social_found >= 1:
            report_lines.append(format_result("Social Media Presence", f"⚠️ {social_found} platform(s) found", "⚠️", 2))
            total_score += 2
        else:
            report_lines.append(format_result("Social Media Presence", "❌ No social media links", "❌", 0))
        
        # Check for payment security badges
        security_badges = ['paypal', 'stripe', 'visa', 'mastercard', 'ssl', 'secure', 'norton', 'mcafee']
        badges_found = sum(1 for badge in security_badges if badge in page_text)
        
        if badges_found >= 3:
            report_lines.append(format_result("Payment Security", f"✅ {badges_found} security indicators", "✅", 4))
            total_score += 4
        elif badges_found >= 1:
            report_lines.append(format_result("Payment Security", f"⚠️ {badges_found} security indicator(s)", "⚠️", 2))
            total_score += 2
        else:
            report_lines.append(format_result("Payment Security", "❌ No payment security indicators", "❌", 0))
        
    except Exception as e:
        report_lines.append(format_result("Business Verification", f"❌ Error: {str(e)[:40]}", "❌", 0))
    
    results.append({'category': 'Business Verification', 'score': total_score, 'max_score': 22})

def analyze_domain(target_url: str):
    """Enhanced main function with comprehensive business legitimacy analysis."""
    domain = get_clean_domain(target_url)
    results = []
    
    report_lines = [
        "=" * 80,
        f"🏢 COMPREHENSIVE BUSINESS LEGITIMACY VERIFICATION REPORT",
        f"🌐 Domain: {domain}",
        f"📅 Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 80,
        "",
        "This report analyzes multiple factors to determine business legitimacy",
        "for merchant onboarding and risk assessment purposes.",
        ""
    ]
    
    print(f"Starting comprehensive analysis of: {domain}")
    print("=" * 60)
    
    # Run all enhanced checks
    check_ssl_security(domain, report_lines, results)
    time.sleep(1)  # Prevent rate limiting
    
    check_business_pages(domain, report_lines, results)
    time.sleep(1)
    
    check_domain_reputation(domain, report_lines, results)
    time.sleep(1)
    
    check_security_reputation(domain, report_lines, results)
    time.sleep(1)
    
    check_business_verification(domain, report_lines, results)
    
    # Calculate overall trust score
    trust_score, trust_level = calculate_trust_score(results)
    
    # Add summary section
    report_lines.extend([
        "\n" + "=" * 80,
        "📊 RISK ASSESSMENT SUMMARY",
        "=" * 80,
        f"Overall Trust Score: {trust_score}%",
        f"Risk Level: {trust_level}",
        "",
        "Score Breakdown by Category:",
    ])
    
    for result in results:
        category_score = (result['score'] / result['max_score'] * 100) if result['max_score'] > 0 else 0
        report_lines.append(f"  • {result['category']}: {result['score']}/{result['max_score']} ({category_score:.1f}%)")
    
    # Risk recommendations
    report_lines.extend([
        "",
        "🎯 ONBOARDING RECOMMENDATION:",
    ])
    
    if trust_score >= 85:
        report_lines.append("  ✅ LOW RISK - Recommended for immediate onboarding")
        report_lines.append("  ✅ Strong legitimacy indicators across all categories")
    elif trust_score >= 70:
        report_lines.append("  ✅ MODERATE RISK - Approved for onboarding with standard monitoring")
        report_lines.append("  ℹ️ Generally trustworthy with minor areas for improvement")
    elif trust_score >= 50:
        report_lines.append("  ⚠️ ELEVATED RISK - Additional verification recommended")
        report_lines.append("  ⚠️ Manual review suggested before onboarding")
    elif trust_score >= 30:
        report_lines.append("  ❌ HIGH RISK - Enhanced due diligence required")
        report_lines.append("  ❌ Multiple red flags detected, proceed with extreme caution")
    else:
        report_lines.append("  🚫 VERY HIGH RISK - NOT RECOMMENDED for onboarding")
        report_lines.append("  🚫 Significant legitimacy concerns identified")
    
    report_lines.extend([
        "",
        "=" * 80,
        "⚠️ IMPORTANT DISCLAIMER:",
        "This automated analysis provides risk indicators only.",
        "Final onboarding decisions should include manual verification",
        "and compliance with your organization's risk policies.",
        "=" * 80
    ])
    
    # Display results
    full_report_text = "\n".join(report_lines)
    print(full_report_text)
    
    # Calculate category scores for API response
    category_scores = []
    for result in results:
        if 'category' in result:
            category_scores.append({
                'category': result['category'],
                'score': result['score'],
                'max_score': result['max_score']
            })
    
    # Return JSON-compatible summary for API
    return {
        'domain': domain,
        'timestamp': datetime.datetime.now().isoformat(),
        'trust_score': trust_score,
        'trust_level': trust_level,
        'overall_status': 'success' if trust_score >= 70 else 'warning' if trust_score >= 50 else 'error',
        'category_scores': category_scores,
        'results': results,
        'recommendation': get_recommendation(trust_score)
    }

def get_recommendation(trust_score: int) -> str:
    """Get onboarding recommendation based on trust score."""
    if trust_score >= 85:
        return "LOW RISK - Recommended for immediate onboarding"
    elif trust_score >= 70:
        return "MODERATE RISK - Approved for onboarding with standard monitoring"
    elif trust_score >= 50:
        return "ELEVATED RISK - Additional verification recommended"
    elif trust_score >= 30:
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