#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { NetworkStack } from '../lib/network-stack';

const app = new cdk.App();

const env = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
}


// Tags to apply to all resources
const tags = {
  Project: 'TodoApp',
  ManagedBy: 'CDK',
  Environment: 'Development',
};


// Stacks

// network stack
const networkStack = new NetworkStack(app, 'TodoAppNetworkStack', {
	env,
	description: 'Network infrastructure for Todo App (VPC, Subnets, NAT Gateway'
});


// Apply tags
Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(networkStack).add(key, value);
});


app.synth();