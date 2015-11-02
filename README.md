# air-worker

Copies weather readings from S3 to elasticsearch

## Configuration and eco-system

The worker is built to work with data fetched from an S3 bucket and insert data into elasticsearch. Preferably, you should use *docker-compose* or *tutum* to configure and deploy your environment.

The sample configuration below can be used in tutum. If certain tutum-specific keys (tags, restart) are removed it can also serve as a docker-compose.yml

### Sample yml for tutum

```
elasticsearch:
  image: 'alexanderczigler/elasticsearch:latest'
  ports:
    - '9200:9200'
    - '9300:9300'
  tags:
    - air
    - aws
kibana:
  image: 'arcus/kibana:latest'
  links:
    - elasticsearch
  ports:
    - '80:80'
  tags:
    - air
    - aws
worker:
  image: 'tutum.co/ilix/air-worker:latest'
  autoredeploy: true
  environment:
    - AWS_BUCKET=your-bucket-with-weather-data
    - AWS_KEY=YourAmazonAwsKey
    - AWS_SECRET=YourAmazonAwsSecret
    - ES_HOST=elasticsearch
    - ES_INDEX=weather
    - ES_PORT=9200
  links:
    - elasticsearch
  restart: always
  tags:
    - air
    - aws
```
