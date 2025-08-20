#!/bin/bash

CLUSTER_NAME="vimmer-production-VimmerClusterCluster-bdacfcda"
SERVICE_NAME="ApiService"
REGION="eu-north-1"

echo "Monitoring ECS Service: $SERVICE_NAME in Cluster: $CLUSTER_NAME"
echo "Press Ctrl+C to stop."

while true; do
  START_TIME=$(date -u -v -5M +%Y-%m-%dT%H:%M:%SZ)
  END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  CPU=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=$CLUSTER_NAME Name=ServiceName,Value=$SERVICE_NAME \
    --start-time $START_TIME \
    --end-time $END_TIME \
    --period 60 \
    --statistics Average \
    --region $REGION \
    --query 'Datapoints | sort_by(@, &Timestamp)[-1].Average' \
    --output text)

  MEM=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name MemoryUtilization \
    --dimensions Name=ClusterName,Value=$CLUSTER_NAME Name=ServiceName,Value=$SERVICE_NAME \
    --start-time $START_TIME \
    --end-time $END_TIME \
    --period 60 \
    --statistics Average \
    --region $REGION \
    --query 'Datapoints | sort_by(@, &Timestamp)[-1].Average' \
    --output text)

  TIME=$(date +"%H:%M:%S")
  echo "[$TIME] CPU: ${CPU:-N/A}% | Memory: ${MEM:-N/A}%"
  sleep 10
done
