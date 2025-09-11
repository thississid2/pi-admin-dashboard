#!/bin/bash

# AWS Cognito Groups Setup Script for Pi Admin Dashboard
# This script creates user groups for different admin roles

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f "backend/.env" ]; then
    source backend/.env
else
    echo -e "${RED}Error: backend/.env file not found${NC}"
    echo "Please ensure your backend/.env file exists with AWS Cognito configuration"
    exit 1
fi

# Check required environment variables
if [ -z "$AWS_COGNITO_USER_POOL_ID" ] || [ -z "$AWS_COGNITO_REGION" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo "Please ensure AWS_COGNITO_USER_POOL_ID and AWS_COGNITO_REGION are set in backend/.env"
    exit 1
fi

echo -e "${BLUE}=== Pi Admin Dashboard - Cognito Groups Setup ===${NC}"
echo -e "${YELLOW}User Pool ID: ${AWS_COGNITO_USER_POOL_ID}${NC}"
echo -e "${YELLOW}Region: ${AWS_COGNITO_REGION}${NC}"
echo ""

# Function to create a Cognito group
create_group() {
    local group_name=$1
    local description=$2
    local precedence=$3
    
    echo -e "${BLUE}Creating group: ${group_name}${NC}"
    
    aws cognito-idp create-group \
        --group-name "$group_name" \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --description "$description" \
        --precedence "$precedence" \
        --region "$AWS_COGNITO_REGION" 2>/dev/null || {
        
        # Check if group already exists
        if aws cognito-idp get-group \
            --group-name "$group_name" \
            --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
            --region "$AWS_COGNITO_REGION" >/dev/null 2>&1; then
            echo -e "${YELLOW}Group '${group_name}' already exists, skipping...${NC}"
        else
            echo -e "${RED}Failed to create group '${group_name}'${NC}"
            return 1
        fi
    }
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Group '${group_name}' created successfully${NC}"
    fi
}

# Function to add custom attributes to user pool (if needed)
add_custom_attributes() {
    echo -e "${BLUE}Checking for custom attributes...${NC}"
    
    # Note: Custom attributes can only be added when creating the user pool
    # If you need to add them later, you'll need to create a new user pool
    echo -e "${YELLOW}Note: If you need custom attributes like 'department' or 'employee_id',${NC}"
    echo -e "${YELLOW}they should be added when creating the user pool initially.${NC}"
    echo -e "${YELLOW}Consider using groups and group metadata for additional user properties.${NC}"
    echo ""
}

# Create admin groups with precedence (lower number = higher priority)
echo -e "${BLUE}Creating admin groups...${NC}"
echo ""

# Precedence determines the priority of groups when a user belongs to multiple groups
create_group "pi-superadmin" "Super Administrators with full system access" 10
create_group "pi-admin" "Administrators with most system permissions" 20
create_group "pi-manager" "Managers with client management permissions" 30
create_group "pi-support" "Support staff with limited permissions" 40

echo ""
echo -e "${BLUE}=== Groups created successfully! ===${NC}"
echo ""

# List all groups to verify
echo -e "${BLUE}Verifying created groups:${NC}"
aws cognito-idp list-groups \
    --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
    --region "$AWS_COGNITO_REGION" \
    --query 'Groups[].{GroupName:GroupName,Description:Description,Precedence:Precedence}' \
    --output table

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your backend authentication to check user groups"
echo "2. Assign users to appropriate groups using AWS Console or CLI"
echo "3. Update your frontend to handle role-based permissions"
echo ""
echo -e "${YELLOW}To assign a user to a group:${NC}"
echo "aws cognito-idp admin-add-user-to-group \\"
echo "    --user-pool-id $AWS_COGNITO_USER_POOL_ID \\"
echo "    --username 'user@example.com' \\"
echo "    --group-name 'pi-admin' \\"
echo "    --region $AWS_COGNITO_REGION"
echo ""
