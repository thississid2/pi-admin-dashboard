import { NextRequest, NextResponse } from 'next/server';

// Mock merchant details - replace with database
const merchantDetails = {
  'AB-12345': {
    id: 'AB-12345',
    name: 'Gayatri Tech Solutions',
    email: 'gayatri@techsolutions.com',
    phone: '+91 9876543210',
    website: 'https://techsolutions.com',
    status: 'approved',
    submittedAt: '2025-01-15',
    country: 'India',
    businessAddress: {
      address1: '123 Tech Park',
      address2: 'Suite 456',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      turnover: '₹50,00,000'
    },
    documents: [
      {
        id: '1',
        name: 'Company PAN Card.pdf',
        type: 'Company PAN Card',
        size: 204800,
        uploadedAt: '2025-01-15',
        status: 'verified'
      },
      {
        id: '2',
        name: 'GST Certificate.pdf',
        type: 'GST Certificate',
        size: 512000,
        uploadedAt: '2025-01-15',
        status: 'verified'
      },
      {
        id: '3',
        name: 'CIN Document.pdf',
        type: 'CIN Document',
        size: 102400,
        uploadedAt: '2025-01-15',
        status: 'pending'
      }
    ],
    socials: [
      'https://twitter.com/techsolutions',
      'https://linkedin.com/company/techsolutions'
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchant = merchantDetails[params.id as keyof typeof merchantDetails];
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(merchant);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch merchant details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    // Mock update - replace with database update
    const merchant = merchantDetails[params.id as keyof typeof merchantDetails];
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Update merchant status
    merchant.status = status;

    return NextResponse.json(merchant);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update merchant' },
      { status: 500 }
    );
  }
}
