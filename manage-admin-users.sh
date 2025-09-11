#!/bin/bash

# AWS Cognito Admin User Management Script
# This script helps manage admin users and their roles

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
    exit 1
fi

# Check required environment variables
if [ -z "$AWS_COGNITO_USER_POOL_ID" ] || [ -z "$AWS_COGNITO_REGION" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    exit 1
fi

show_help() {
    echo -e "${BLUE}AWS Cognito Admin User Management${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  list-users              List all users in the user pool"
    echo "  list-groups             List all groups"
    echo "  create-user             Create a new admin user"
    echo "  assign-role             Assign role to user"
    echo "  remove-role             Remove role from user"
    echo "  list-user-groups        List groups for a specific user"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list-users"
    echo "  $0 create-user admin@example.com AdminUser"
    echo "  $0 assign-role admin@example.com pi-admin"
    echo "  $0 remove-role admin@example.com pi-admin"
    echo "  $0 list-user-groups admin@example.com"
}

list_users() {
    echo -e "${BLUE}Listing all users in user pool...${NC}"
    aws cognito-idp list-users \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --region "$AWS_COGNITO_REGION" \
        --query 'Users[].{Username:Username,Email:Attributes[?Name==`email`].Value|[0],Status:UserStatus,Created:UserCreateDate}' \
        --output table
}

list_groups() {
    echo -e "${BLUE}Listing all groups...${NC}"
    aws cognito-idp list-groups \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --region "$AWS_COGNITO_REGION" \
        --query 'Groups[].{GroupName:GroupName,Description:Description,Precedence:Precedence}' \
        --output table
}

create_user() {
    local email=$1
    local temp_password=$2
    
    if [ -z "$email" ] || [ -z "$temp_password" ]; then
        echo -e "${RED}Error: Email and temporary password required${NC}"
        echo "Usage: $0 create-user <email> <temporary-password>"
        return 1
    fi
    
    echo -e "${BLUE}Creating user: ${email}${NC}"
    
    aws cognito-idp admin-create-user \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --username "$email" \
        --user-attributes Name=email,Value="$email" Name=email_verified,Value=true \
        --temporary-password "$temp_password" \
        --message-action SUPPRESS \
        --region "$AWS_COGNITO_REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User created successfully${NC}"
        echo -e "${YELLOW}Temporary password: ${temp_password}${NC}"
        echo -e "${YELLOW}User will be prompted to change password on first login${NC}"
    fi
}

assign_role() {
    local username=$1
    local group_name=$2
    
    if [ -z "$username" ] || [ -z "$group_name" ]; then
        echo -e "${RED}Error: Username and group name required${NC}"
        echo "Usage: $0 assign-role <username> <group-name>"
        echo "Available groups: pi-superadmin, pi-admin, pi-manager, pi-support"
        return 1
    fi
    
    echo -e "${BLUE}Assigning user ${username} to group ${group_name}...${NC}"
    
    aws cognito-idp admin-add-user-to-group \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --username "$username" \
        --group-name "$group_name" \
        --region "$AWS_COGNITO_REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User assigned to group successfully${NC}"
    fi
}

remove_role() {
    local username=$1
    local group_name=$2
    
    if [ -z "$username" ] || [ -z "$group_name" ]; then
        echo -e "${RED}Error: Username and group name required${NC}"
        echo "Usage: $0 remove-role <username> <group-name>"
        return 1
    fi
    
    echo -e "${BLUE}Removing user ${username} from group ${group_name}...${NC}"
    
    aws cognito-idp admin-remove-user-from-group \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --username "$username" \
        --group-name "$group_name" \
        --region "$AWS_COGNITO_REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User removed from group successfully${NC}"
    fi
}

list_user_groups() {
    local username=$1
    
    if [ -z "$username" ]; then
        echo -e "${RED}Error: Username required${NC}"
        echo "Usage: $0 list-user-groups <username>"
        return 1
    fi
    
    echo -e "${BLUE}Listing groups for user: ${username}${NC}"
    
    aws cognito-idp admin-list-groups-for-user \
        --user-pool-id "$AWS_COGNITO_USER_POOL_ID" \
        --username "$username" \
        --region "$AWS_COGNITO_REGION" \
        --query 'Groups[].{GroupName:GroupName,Description:Description}' \
        --output table
}

# Main script logic
case "${1:-help}" in
    "list-users")
        list_users
        ;;
    "list-groups")
        list_groups
        ;;
    "create-user")
        create_user "$2" "$3"
        ;;
    "assign-role")
        assign_role "$2" "$3"
        ;;
    "remove-role")
        remove_role "$2" "$3"
        ;;
    "list-user-groups")
        list_user_groups "$2"
        ;;
    "help"|*)
        show_help
        ;;
esac
