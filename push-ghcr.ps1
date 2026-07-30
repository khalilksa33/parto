# push-ghcr.ps1
$Username = "khalilksa33"
$Registry = "ghcr.io"

Write-Host "Authenticating with GitHub Container Registry..."
# Requires you to have created a PAT (Personal Access Token) with packages:write permission
# Run this manually if not authenticated: echo YOUR_PAT | docker login ghcr.io -u $Username --password-stdin

Write-Host "Building backend image..."
docker build -t $Registry/$Username/parto-backend:latest ./backend

Write-Host "Building frontend image..."
docker build -t $Registry/$Username/parto-frontend:latest ./frontend

Write-Host "Pushing backend image to GHCR..."
docker push $Registry/$Username/parto-backend:latest

Write-Host "Pushing frontend image to GHCR..."
docker push $Registry/$Username/parto-frontend:latest

Write-Host "Transferring Kubernetes manifests to remote Host C..."
$RemoteHost = "erp-ssh-26i"
$RemoteDir = "/tmp/parto-deploy"
ssh -o BatchMode=yes $RemoteHost "mkdir -p $RemoteDir/k8s"
scp -r k8s/* "$RemoteHost:$RemoteDir/k8s/"

Write-Host "Applying deployments on Host C..."
$DeployScript = @"
cd $RemoteDir
echo 'Applying namespace...'
kubectl apply -f ./k8s/namespace.yaml

echo 'Copying GHCR secret from kamysoft-erp namespace to parto namespace...'
# Ensure GHCR secret is available in the new namespace
kubectl get secret ghcr-secret -n kamysoft-erp -o json | jq 'del(.metadata.namespace, .metadata.resourceVersion, .metadata.uid, .metadata.creationTimestamp)' | kubectl apply -n parto -f -

echo 'Applying deployments and services...'
kubectl apply -f ./k8s/backend-deployment.yaml
kubectl apply -f ./k8s/frontend-deployment.yaml
kubectl apply -f ./k8s/ingress.yaml

echo 'Forcing rollout to pull new images...'
kubectl rollout restart deployment parto-backend -n parto
kubectl rollout restart deployment parto-frontend -n parto

echo 'Deployment initiated!'
kubectl get pods -n parto
"@

ssh $RemoteHost $DeployScript

Write-Host "Deployment Pipeline Completed Successfully!"
