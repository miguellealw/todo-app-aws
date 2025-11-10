import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
	public readonly vpc: ec2.Vpc;

	// configure VPC and subnets
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// VPC
		this.vpc = new ec2.Vpc(this, 'TodoAppVpc', {
			vpcName: 'todo-app-vpc',
			maxAzs: 2,
			natGateways: 1,
			// Subnet
			subnetConfiguration: [
				{
					name: 'Public',
					subnetType: ec2.SubnetType.PUBLIC,
					cidrMask: 24,
				},
				{
					name: 'Private',
					subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
				},
				{
					name: 'Database',
					subnetType: ec2.SubnetType.PRIVATE_ISOLATED, 
					cidrMask: 24,
				}
			],
		
			// Enable DNS
			enableDnsHostnames: true,
			enableDnsSupport: true
		});

		// Tag for easier identification
		cdk.Tags.of(this.vpc).add('Project', 'TodoApp');
		cdk.Tags.of(this.vpc).add('Environmnet', 'Development');

		// Output VPC ID
		new cdk.CfnOutput(this, 'VpcId', {
			value: this.vpc.vpcId,
			description: 'VPC ID',
			exportName: 'TodoAppVpcId',
		});

		// Output VPC CIDR
		new cdk.CfnOutput(this, 'VpcCidr', {
			value: this.vpc.vpcCidrBlock,
			description: 'VPC CIDR Block'
		})
	}
}