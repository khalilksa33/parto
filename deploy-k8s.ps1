# deploy-k8s.ps1
Write-Host "Building Backend Docker image..."
docker build -t parto-backend:latest ./backend

Write-Host "Building Frontend Docker image..."
docker build -t parto-frontend:latest ./frontend

Write-Host "Applying Kubernetes manifests..."
# Note: You must have your kubeconfig configured properly for your cluster.
# You also need to create the 'parto-secrets' secret with your env vars:
# kubectl create secret generic parto-secrets --from-literal=MONGO_URI="..." --from-literal=GEMINI_API_KEY="..."

kubectl apply -f ./k8s/backend-deployment.yaml
kubectl apply -f ./k8s/frontend-deployment.yaml
kubectl apply -f ./k8s/ingress.yaml

Write-Host "Deployment applied. Monitor pods with 'kubectl get pods'"
