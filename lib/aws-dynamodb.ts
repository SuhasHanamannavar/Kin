import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';

// ============================================================
// AWS DynamoDB Configuration
// Region: us-east-1 (or AWS_REGION)
// Table: kin-data (Single-Table Design, On-Demand / Free Tier)
// ============================================================

const region = process.env.AWS_REGION || 'us-east-1';
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'kin-data';

const clientConfig: any = { region };

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

export const rawClient = new DynamoDBClient(clientConfig);

export const ddbDocClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

/**
 * Automatically ensures the single-table exists in AWS DynamoDB.
 * Created with On-Demand billing (100% covered by AWS Always-Free Tier).
 */
export async function ensureTableExists(): Promise<boolean> {
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`[DynamoDB] Table ${TABLE_NAME} not found. Creating table in ${region}...`);
      await rawClient.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }));
      console.log(`[DynamoDB] Table ${TABLE_NAME} created successfully!`);
      return true;
    }
    console.warn(`[DynamoDB] Ensure table check error:`, err.message);
    return false;
  }
}
