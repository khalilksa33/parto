# deploy-remote.ps1
$RemoteHost = "erp-ssh-26i"
$RemoteDir = "/tmp/parto-deploy"

Write-Host "Creating deployment directory on remote host ($RemoteHost)..."
ssh -o BatchMode=yes $RemoteHost "mkdir -p $RemoteDir/k8s $RemoteDir/backend $RemoteDir/frontend"

Write-Host "Copying backend..."
scp -r backend/* "$RemoteHost:$RemoteDir/backend/"

Write-Host "Copying frontend..."
scp -r frontend/* "$RemoteHost:$RemoteDir/frontend/"

Write-Host "Copying Kubernetes manifests..."
scp -r k8s/* "$RemoteHost:$RemoteDir/k8s/"

Write-Host "Executing remote build and deploy..."
$DeployScript = @"
cd $RemoteDir
echo 'Building backend image...'
docker build -t parto-backend:latest ./backend
echo 'Building frontend image...'
docker build -t parto-frontend:latest ./frontend

echo 'Applying namespace...'
kubectl apply -f ./k8s/namespace.yaml

echo 'Applying deployments and services...'
kubectl apply -f ./k8s/backend-deployment.yaml
kubectl apply -f ./k8s/frontend-deployment.yaml
kubectl apply -f ./k8s/ingress.yaml

echo 'Deployment initiated!'
kubectl get pods -n parto
"@

ssh $RemoteHost $DeployScript

Write-Host "Done!"
