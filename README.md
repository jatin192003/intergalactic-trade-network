# **Intergalactic Trade Network**

This project is a Trade Management System built using **Node.js**, **Express**, and **MongoDB**. The system allows for creating, updating, and managing trades, inventories, cargos, and users, with real-time updates of item quantities and statuses in both the inventory and trade systems.

## **Features**
- **Trade Management**: Create and manage trades between buyers and sellers.
- **Inventory Management**: Handle station-based inventory for users.
- **Cargo Management**: Manage cargos with shipment IDs, tracking the items' origin, destination, and quantities.
- **Custom Error Handling**: Implemented middleware for handling errors across the application.

## **Technologies Used**
- **Node.js** with **Express**
- **MongoDB** (via **Mongoose**)
- **JWT Authentication**
- **dotenv** for environment variables
- **CORS** for handling cross-origin requests

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- Git

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/jatin192003/intergalactic-trade-network
   cd intergalactic-trade-network
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the necessary environment variables (see [Environment Variables](#environment-variables) section).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Replace the values with your specific configuration.

## Running the Application

To run the application in development mode:

```
npm run dev
```

For production:

```
npm start
```

## API Routes

### User Routes
- POST `/api/register`: Register a new user
- POST `/api/login`: User login
- GET `/api/logout`: User logout
- GET `/api/getUser`: Get user details
- DELETE `/api/deleteUser`: Delete user account

### Trade Routes
- POST `/api/trades`: Create a new trade
- PUT `/api/updateTradeStatus/:transactionId`: Update trade status
- GET `/api/getTrade`: Get trade details

### Inventory Routes
- POST `/api/inventory`: Create a new inventory
- GET `/api/inventory/:userId/:stationId`: Get inventory details
- GET `/api/user-inventories/:userId`: Get all inventories for a user
- POST `/api/inventory/:stationId/additems`: Add items to inventory
- PUT `/api/inventory/:stationId/updateitems/:itemId`: Update items in inventory
- DELETE `/api/inventory/:userId/:stationId`: Delete an inventory
- DELETE `/api/inventory/:stationId/deleteitem/:itemId`: Delete an item from inventory

### Cargo Routes
- POST `/api/cargo`: Create new cargo
- PUT `/api/updateCargoQuantity/:shipmentId`: Update cargo quantity
- GET `/api/getCargo/:shipmentId`: Get cargo details


## API Routes and Example Payloads

### User Routes

#### Register a new user
- POST `/api/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### User login
- POST `/api/login`
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get user details
- GET `/api/getUser`
(No payload required, uses JWT for authentication)

#### Delete user account
- DELETE `/api/deleteUser`
(No payload required, uses JWT for authentication)

### Trade Routes

#### Create a new trade
- POST `/api/trades`
```json
{
  "buyer": "buyerUserId",
  "stationId": "sellerStationId",
  "items": [
    {
      "itemId": "itemId1",
      "name": "Item Name",
      "quantity": 5
    }
  ]
}
```

#### Update trade status
- PUT `/api/updateTradeStatus/:transactionId`
```json
{
  "status": "Completed"
}
```

#### Get trade details
- GET `/api/getTrade?transactionId=yourTransactionId`
(No payload required)

### Inventory Routes

#### Create a new inventory
- POST `/api/inventory`
```json
{
  "userId": "userId",
  "name": "Space Station Alpha",
  "items": [
    {
      "name": "Plasma Cannon",
      "price": 1000,
      "quantity": 5
    }
  ]
}
```

#### Get inventory details
- GET `/api/inventory/:userId/:stationId`
(No payload required)

#### Get all inventories for a user
- GET `/api/user-inventories/:userId`
(No payload required)

#### Add items to inventory
- POST `/api/inventory/:stationId/additems`
```json
{
  "items": [
    {
      "name": "Shield Generator",
      "price": 500,
      "quantity": 3
    }
  ]
}
```

#### Update items in inventory
- PUT `/api/inventory/:stationId/updateitems/:itemId`
```json
{
  "name": "Enhanced Shield Generator",
  "price": 600,
  "quantity": 4
}
```

#### Delete an inventory
- DELETE `/api/inventory/:userId/:stationId`
(No payload required)

#### Delete an item from inventory
- DELETE `/api/inventory/:stationId/deleteitem/:itemId`
(No payload required)

### Cargo Routes

#### Create new cargo
- POST `/api/cargo`
```json
{
  "shipmentId": "SHIP123",
  "origin": "Earth",
  "destination": "Mars",
  "items": [
    {
      "itemId": "itemId1",
      "name": "Water Purifier",
      "quantity": 10
    }
  ]
}
```

#### Update cargo quantity
- PUT `/api/updateCargoQuantity/:shipmentId`
```json
{
  "items": [
    {
      "itemId": "itemId1",
      "quantity": 5
    }
  ]
}
```

#### Get cargo details
- GET `/api/getCargo/:shipmentId`
(No payload required)

## Testing the API

You can use tools like Postman or curl to test these endpoints. Remember to:

1. Set the `Content-Type` header to `application/json` for POST and PUT requests.
2. Include the JWT token in the `Authorization` header for authenticated routes.
3. Replace placeholder values (like `userId`, `stationId`, `itemId`, etc.) with actual IDs from your database.

Example curl command for creating a trade:

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "buyer": "buyerUserId",
    "stationId": "sellerStationId",
    "items": [
      {
        "itemId": "itemId1",
        "name": "Item Name",
        "quantity": 5
      }
    ]
  }'
```

Remember to replace `YOUR_JWT_TOKEN` with an actual token obtained after logging in.

## Deployment

1. Choose a hosting provider (e.g., Heroku, DigitalOcean, AWS).
2. Set up your deployment environment and configure the necessary environment variables.
3. Push your code to the hosting provider.
4. Ensure your MongoDB instance is accessible from your hosting environment.
5. Start your Node.js application on the host.

## Contributing

Contributions to this project are welcome. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the [MIT License](LICENSE).
