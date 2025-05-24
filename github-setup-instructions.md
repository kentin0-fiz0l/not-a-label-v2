# GitHub Setup Instructions

You're getting a permission error. Here's how to fix it:

## Option 1: Use Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Give it a name like "Not a Label Deploy"
4. Select scopes: `repo` (all of them)
5. Generate token and copy it

Then run:
```bash
cd "/Users/kentino/Not a Label/not-a-label-v2"
git remote set-url origin https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/Not-a-Label/notalabel.git
git push -u origin main --force
```

## Option 2: Add SSH Key

1. Generate SSH key if you don't have one:
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

2. Copy your public key:
```bash
cat ~/.ssh/id_ed25519.pub
```

3. Add it to GitHub: Settings → SSH and GPG keys → New SSH key

4. Change remote to SSH:
```bash
cd "/Users/kentino/Not a Label/not-a-label-v2"
git remote set-url origin git@github.com:Not-a-Label/notalabel.git
git push -u origin main --force
```

## Option 3: Check Repository Access

Make sure you have write access to the repository:
1. Go to https://github.com/Not-a-Label/notalabel
2. Check if you're a collaborator with write access
3. If not, ask the repository owner to add you as a collaborator

## Quick Fix Commands

If you want to push to your personal account instead:
```bash
# Create a new repo under your account first, then:
cd "/Users/kentino/Not a Label/not-a-label-v2"
git remote set-url origin https://github.com/YOUR_USERNAME/not-a-label-v2.git
git push -u origin main --force
```