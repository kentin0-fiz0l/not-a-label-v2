#!/bin/bash

# Script to set up GitHub secrets for automated deployment
# This script uses the GitHub CLI (gh) to configure repository secrets

echo "Setting up GitHub secrets for automated deployment..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Repository details
REPO="kentin0-fiz0l/not-a-label-v2"
HOST="147.182.252.146"
USERNAME="root"

# Read the SSH private key
SSH_KEY=$(cat ~/.ssh/github-actions-notalabel)

echo "Adding secrets to repository: $REPO"

# Add HOST secret
echo "Adding HOST secret..."
echo "$HOST" | gh secret set HOST --repo="$REPO"

# Add USERNAME secret
echo "Adding USERNAME secret..."
echo "$USERNAME" | gh secret set USERNAME --repo="$REPO"

# Add SSH_KEY secret
echo "Adding SSH_KEY secret..."
echo "$SSH_KEY" | gh secret set SSH_KEY --repo="$REPO"

echo "✅ GitHub secrets configured successfully!"
echo ""
echo "Next steps:"
echo "1. Add the public key to the server's authorized_keys:"
echo "   cat ~/.ssh/github-actions-notalabel.pub | ssh root@$HOST 'cat >> ~/.ssh/authorized_keys'"
echo ""
echo "2. Test the deployment by pushing to main branch or manually triggering the workflow:"
echo "   gh workflow run deploy.yml --repo=$REPO"