# SSH Key Setup for GitHub Actions

The GitHub secrets have been configured. To complete the setup, you need to add the public key to the server.

## Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art
```

## Steps to Add Key to Server

1. SSH into your server:
   ```bash
   ssh root@147.182.252.146
   ```

2. Add the public key to authorized_keys:
   ```bash
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art" >> ~/.ssh/authorized_keys
   ```

3. Verify the key was added:
   ```bash
   tail -n 1 ~/.ssh/authorized_keys
   ```

## Testing the Deployment

After adding the SSH key, you can test the deployment workflow:

1. Make a small change and push to main:
   ```bash
   echo "# Deployment Test" >> README.md
   git add README.md
   git commit -m "Test automated deployment"
   git push origin main
   ```

2. Or manually trigger the workflow:
   ```bash
   gh workflow run deploy.yml --repo=kentin0-fiz0l/not-a-label-v2
   ```

3. Monitor the workflow:
   ```bash
   gh run watch --repo=kentin0-fiz0l/not-a-label-v2
   ```

## Verify Deployment

Check that the deployment succeeded:
- Visit https://not-a-label.art
- Check GitHub Actions tab in the repository
- SSH to server and check PM2: `pm2 status`