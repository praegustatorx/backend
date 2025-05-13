# backend

### Build Image
```
 docker build -f Docker/Dockerfile -t ts-backend .
```

### Run Container
```
 docker run -p 8005:8005 ts-backend
```

### Run Compose
**_NOTE:_** Requires py-backend
```
 docker-compose -f Docker/docker-compose.yml up