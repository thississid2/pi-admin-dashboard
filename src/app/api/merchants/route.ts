import { NextRequest, NextResponse } from 'next/server';

// Mock merchant data - replace with database
const merchants = [
  {
    id: 'AB-12345',
    name: 'Gayatri Tech Solutions',
    email: 'gayatri@techsolutions.com',
    website: 'https://techsolutions.com',
    status: 'approved',
    submittedAt: '2025-01-15',
    documents: ['PAN Card', 'GST Certificate', 'CIN Document'],
    country: 'India'
  },
  {
    id: 'CD-67890',
    name: 'Global Innovations Ltd',
    email: 'admin@globalinnovations.co.uk',
    website: 'https://globalinnovations.co.uk',
    status: 'pending',
    submittedAt: '2025-01-18',
    documents: ['Company Registration', 'VAT Certificate'],
    country: 'UK'
  },
  {
    id: 'EF-13579',
    name: 'Digital Ventures Inc',
    email: 'contact@digitalventures.com',
    website: 'https://digitalventures.com',
    status: 'under_review',
    submittedAt: '2025-01-17',
    documents: ['Articles of Incorporation', 'Tax ID'],
    country: 'USA'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      merchants,
      total: merchants.length,
      stats: {
        totalMerchants: 156,
        pendingReviews: 23,
        approvedToday: 8,
        rejectedThisWeek: 3
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, website, country } = body;

    // Generate new merchant ID
    const newId = `MR-${Date.now().toString().slice(-5)}`;
    
    const newMerchant = {
      id: newId,
      name,
      email,
      website,
      country,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
      documents: []
    };

    merchants.push(newMerchant);

    return NextResponse.json(newMerchant, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create merchant' },
      { status: 500 }
    );
  }
}
