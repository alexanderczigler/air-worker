docker build -t air-worker .
docker tag -f air-worker tutum.co/alexanderczigler/air-worker
docker push tutum.co/alexanderczigler/air-worker