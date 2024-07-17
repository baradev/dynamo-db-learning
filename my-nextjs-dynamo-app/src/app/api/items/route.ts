import { NextResponse } from 'next/server'
import { dynamoDb } from '@/app/utils/dynamodb'
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'

export async function POST(request: Request) {
  const item = await request.json()
  const params = {
    TableName: 'Items',
    Item: item,
  }

  try {
    await dynamoDb.send(new PutCommand(params))
    return NextResponse.json(
      { message: 'Item created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json(
      { error: 'Could not create item' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const params = {
      TableName: 'Items',
      Key: { id },
    }

    try {
      const { Item } = await dynamoDb.send(new GetCommand(params))
      if (Item) {
        return NextResponse.json(Item)
      } else {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Get item error:', error)
      return NextResponse.json(
        { error: 'Could not retrieve item' },
        { status: 500 }
      )
    }
  } else {
    const params = {
      TableName: 'Items',
    }

    try {
      const { Items } = await dynamoDb.send(new ScanCommand(params))
      return NextResponse.json(Items)
    } catch (error) {
      console.error('List items error:', error)
      return NextResponse.json(
        { error: 'Could not retrieve items' },
        { status: 500 }
      )
    }
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const updates = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  let updateExpression = 'set'
  let expressionAttributeNames: Record<string, string> = {}
  let expressionAttributeValues: Record<string, any> = {}

  // Dynamically build the update expression
  if (updates.name !== undefined) {
    updateExpression += ' #n = :n,'
    expressionAttributeNames['#n'] = 'name'
    expressionAttributeValues[':n'] = updates.name
  }
  if (updates.description !== undefined) {
    updateExpression += ' #d = :d,'
    expressionAttributeNames['#d'] = 'description'
    expressionAttributeValues[':d'] = updates.description
  }

  // Remove trailing comma
  updateExpression = updateExpression.slice(0, -1)

  const params: UpdateCommandInput = {
    TableName: 'Items',
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  }

  try {
    const { Attributes } = await dynamoDb.send(new UpdateCommand(params))
    return NextResponse.json(Attributes)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Could not update item', details: (error as Error).message },
      { status: 500 }
    )
  }
}
