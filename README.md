# Landscape
IT landscape description tool based on excalidraw

#### Container launch 

    docker compose up --build landscape

#### Local launch

Set for Windows

    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

Install packages 

    npm install

Create .env.local file 

    REACT_APP_PROTO_JSON_HOST="https://openapi.acme.dev/"
    REACT_APP_PROTO_JSON_PATH="spec/json/protos.json"
    REACT_APP_GITHUB_API_PRJ_URL="https://api.github.com/repos/XXXXXXXXX/diagramm_store/"
    REACT_APP_GITLAB_API_PRJ_URL="https://gitlab.acme.dev/api/v4/projects/NNNN/" 
    REACT_APP_GITHUB_TOKEN="gjngjng"  
    REACT_APP_GITLAB_TOKEN="jdjdjdd"

And launch

    npm start NODE_ENV=local
