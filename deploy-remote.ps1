# deploy-remote.ps1
$RemoteHost = "cloud@ssh-cloud.26i.uk"
$RemoteDir = "/tmp/parto-deploy"

Write-Host "Creating deployment directory on remote host ($RemoteHost)..."
ssh -o BatchMode=yes $RemoteHost "mkdir -p $RemoteDir/k8s"

Write-Host "Securely copying Kubernetes manifests..."
scp -r k8s/* "${RemoteHost}:${RemoteDir}/k8s/"

Write-Host "Executing remote kubectl apply..."
$DeployScript = @"
cd $RemoteDir
echo 'Applying namespace...'
kubectl apply -f ./k8s/namespace.yaml

echo 'Applying database deployments...'
kubectl apply -f ./k8s/postgres.yaml
kubectl apply -f ./k8s/mongodb.yaml

echo 'Applying deployments and services...'
kubectl apply -f ./k8s/backend-deployment.yaml
kubectl apply -f ./k8s/frontend-deployment.yaml
kubectl apply -f ./k8s/ingress.yaml

echo 'Deployment initiated on ssh-cloud.26i.uk!'
kubectl get pods -n parto
"@

ssh $RemoteHost $DeployScript

Write-Host "Remote deployment script completed!"
