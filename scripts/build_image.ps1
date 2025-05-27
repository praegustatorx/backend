# Variables
$ImageName = "ts-backend"
$DockerfilePath = "docker/Dockerfile"
$ContextDir = "."

# Resolve the Dockerfile path (absolute path is safer)
$ResolvedDockerfilePath = (Resolve-Path $DockerfilePath).Path

# Build command
Write-Host "Building Docker image: $ImageName..."
docker build -f $ResolvedDockerfilePath -t $ImageName $ContextDir

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker image built successfully."
} else {
    Write-Host "Failed to build Docker image."
    exit 1
}

