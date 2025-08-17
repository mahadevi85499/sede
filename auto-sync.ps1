# Auto-sync script for GitHub
# This script automatically commits and pushes changes to GitHub

param(
    [string]$ProjectPath = "C:\Users\mahad\OneDrive\Documents\web development\sede-1"
)

# Change to project directory
Set-Location -Path $ProjectPath

# Check if there are any changes
$status = git status --porcelain
if ($status) {
    Write-Host "$(Get-Date): Changes detected, syncing to GitHub..."
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    $commitMessage = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    
    # Push to GitHub
    git push origin master
    
    Write-Host "$(Get-Date): Sync completed successfully!"
} else {
    Write-Host "$(Get-Date): No changes detected, skipping sync."
}

# Also push any existing commits that haven't been pushed
$unpushed = git log origin/master..master --oneline
if ($unpushed) {
    Write-Host "$(Get-Date): Pushing existing commits..."
    git push origin master
    Write-Host "$(Get-Date): Existing commits pushed successfully!"
}
