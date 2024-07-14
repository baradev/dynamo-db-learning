import { NextResponse } from 'next/server'
import { dynamoDb } from '@/app/utils/dynamodb'
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
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

  const params = {
    TableName: 'Items',
    Key: { id },
    UpdateExpression: 'set #n = :n, description = :d',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: {
      ':n': updates.name,
      ':d': updates.description,
    },
    ReturnValues: 'ALL_NEW',
  }

  try {
    const { Attributes } = await dynamoDb.send(new UpdateCommand(params))
    return NextResponse.json(Attributes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Could not update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const params = {
    TableName: 'Items',
    Key: { id },
  }

  try {
    await dynamoDb.send(new DeleteCommand(params))
    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Could not delete item' },
      { status: 500 }
    )
  }
}
