#!/bin/bash

echo "🚀 CS Field Pulse - GitHub Push Script"
echo "======================================"
echo ""
echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Setting up GitHub remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/cs-field-pulse.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USERNAME/cs-field-pulse.git

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub at:"
echo "   https://github.com/$GITHUB_USERNAME/cs-field-pulse"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your repository"
echo "3. Configure environment variables"
echo "4. Deploy!"