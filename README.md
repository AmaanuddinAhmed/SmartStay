# SmartStay

A hotel booking system built with a microservices architecture. Users search for hotels ranked by how well they fit the trip, pick a room, and book and pay in one step.

MCSA Unit 2 Microservices Mini Project, Team 3 (Hotel Booking System).

## Architecture

![SmartStay architecture](docs/architecture.png)

The frontend talks only to the API Gateway. The Gateway and every service find each other through the Service Registry. Each business service owns its own MongoDB database and no service reads another service's database.

| Component              | Port | Responsibility                                  | Database                    |
| ---------------------- | ---- | ----------------------------------------------- | --------------------------- |
| Service Registry       | 5005 | Keeps the list of live services and their URLs  | None (in memory)            |
| API Gateway            | 5000 | Single entry point; routes requests to services | None                        |
| Hotel Service          | 5001 | Hotels, rooms, reserve and release              | `smartstay_hotels`          |
| Booking Service        | 5002 | Bookings, Saga orchestration, Circuit Breaker   | `smartstay_bookings`        |
| Payment Service        | 5003 | Simulated payments and refunds                  | `smartstay_payments`        |
| Recommendation Service | 5004 | Scores and ranks hotels for a trip              | `smartstay_recommendations` |
| Frontend               | 5173 | React single-page app                           | None                        |

## Tech stack

- Node.js and Express 5
- MongoDB with Mongoose
- axios for service-to-service HTTP
- React 19, React Router and Vite for the frontend
- Postman for API testing

## Prerequisites

- Node.js 20 or later
- MongoDB running locally on port 27017, or a MongoDB Atlas connection string

## Setup

Clone the repository and install dependencies in every folder:

```bash
git clone <repo-url>
cd SmartStay
for d in service-registry api-gateway hotel-service booking-service payment-service recommendation-service frontend; do (cd $d && npm install); done
```

Create a `.env` file in each service by copying its `.env.example`. The values are:

| Folder                   | `PORT` | `MONGO_URI`                                           | `REGISTRY_URL`          |
| ------------------------ | ------ | ----------------------------------------------------- | ----------------------- |
| `service-registry`       | 5005   | not used                                              | not used                |
| `api-gateway`            | 5000   | not used                                              | `http://localhost:5005` |
| `hotel-service`          | 5001   | `mongodb://localhost:27017/smartstay_hotels`          | `http://localhost:5005` |
| `booking-service`        | 5002   | `mongodb://localhost:27017/smartstay_bookings`        | `http://localhost:5005` |
| `payment-service`        | 5003   | `mongodb://localhost:27017/smartstay_payments`        | `http://localhost:5005` |
| `recommendation-service` | 5004   | `mongodb://localhost:27017/smartstay_recommendations` | `http://localhost:5005` |

Load the sample hotels and rooms (13 hotels, 26 rooms):

```bash
cd hotel-service
npm run seed
```

The seed script clears existing hotels and rooms, and refuses to run against any database other than `smartstay_hotels`.

## Running

Start each component in its own terminal, in this order:

```bash
cd service-registry && npm start
cd hotel-service && npm start
cd payment-service && npm start
cd booking-service && npm start
cd recommendation-service && npm start
cd api-gateway && npm start
cd frontend && npm run dev
```

Check that all four services are registered at `http://localhost:5005/api/v1/registry/services`, then open the app at `http://localhost:5173`.

## API reference

All endpoints below are called through the Gateway at `http://localhost:5000`.

### Hotel Service

| Method | Endpoint                    | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/api/v1/hotels`            | List hotels                              |
| GET    | `/api/v1/hotels/:id`        | Get one hotel                            |
| POST   | `/api/v1/hotels`            | Create a hotel                           |
| PUT    | `/api/v1/hotels/:id`        | Update a hotel                           |
| DELETE | `/api/v1/hotels/:id`        | Delete a hotel and its rooms             |
| GET    | `/api/v1/rooms?hotelId=`    | List rooms, optionally for one hotel     |
| GET    | `/api/v1/rooms/:id`         | Get one room                             |
| POST   | `/api/v1/rooms`             | Create a room                            |
| PUT    | `/api/v1/rooms/:id/reserve` | Reserve a room (409 if already reserved) |
| PUT    | `/api/v1/rooms/:id/release` | Release a room                           |

### Booking Service

| Method | Endpoint                 | Description                                             |
| ------ | ------------------------ | ------------------------------------------------------- |
| GET    | `/api/v1/bookings`       | List bookings                                           |
| GET    | `/api/v1/bookings/:id`   | Get one booking                                         |
| POST   | `/api/v1/bookings`       | Validate and create a PENDING booking                   |
| PUT    | `/api/v1/bookings/:id`   | Change dates or guests of a PENDING booking             |
| DELETE | `/api/v1/bookings/:id`   | Cancel a booking; releases the room if it was confirmed |
| GET    | `/api/v2/bookings`       | List bookings in the v2 format                          |
| GET    | `/api/v2/bookings/:id`   | Get one booking in the v2 format                        |
| POST   | `/api/v2/bookings`       | Book through the Saga: reserve, pay, confirm            |
| GET    | `/api/v1/circuit-status` | State of the Payment circuit breaker                    |

### Payment Service

| Method | Endpoint                      | Description                                             |
| ------ | ----------------------------- | ------------------------------------------------------- |
| GET    | `/api/v1/payments`            | List payments                                           |
| GET    | `/api/v1/payments/:id`        | Get one payment                                         |
| POST   | `/api/v1/payments`            | Process a payment (`simulateFailure: true` returns 402) |
| PUT    | `/api/v1/payments/:id/refund` | Refund a successful payment                             |

### Recommendation Service

| Method | Endpoint                  | Description                                                    |
| ------ | ------------------------- | -------------------------------------------------------------- |
| POST   | `/api/v1/recommendations` | Rank hotels for a destination, budget, purpose and preferences |
| GET    | `/api/v1/recommendations` | List past recommendation logs                                  |

### Service Registry (direct, port 5005)

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| POST   | `/api/v1/registry/register`       | Register a service or send a heartbeat |
| GET    | `/api/v1/registry/services`       | List live services                     |
| GET    | `/api/v1/registry/services/:name` | Look up one service by name            |

## API versioning

Bookings are available in two versions that run side by side on the same data.

|          | v1                                        | v2                                                                  |
| -------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Create   | Stores a PENDING booking                  | Runs the Saga and returns a CONFIRMED or CANCELLED booking          |
| Response | The booking document                      | Envelope with `apiVersion`, `success`, `message`, `data` and `saga` |
| Dates    | `checkIn` and `checkOut` at the top level | Nested `stay` object with `nights`                                  |
| List     | Array                                     | `count` and `data`, newest first                                    |

## Service discovery

Each service registers its name and URL with the registry on startup and repeats the call every 30 seconds as a heartbeat. The registry removes a service that has been silent for 90 seconds. Callers resolve a service by name before every request, so no service URL is hard-coded.

## Saga

`POST /api/v2/bookings` is an orchestrated Saga run by Booking Service across three services.

| Step                    | Service | Compensation if a later step fails |
| ----------------------- | ------- | ---------------------------------- |
| Validate room and dates | Hotel   | None needed                        |
| Create PENDING booking  | Booking | Cancel booking                     |
| Reserve room            | Hotel   | Release room                       |
| Process payment         | Payment | Refund payment                     |
| Confirm booking         | Booking |                                    |

The response lists every step with its status. To see the rollback, send `"simulateFailure": true` or tick "make the payment fail" on the booking page.

## Circuit Breaker

Calls from Booking Service to Payment Service go through a circuit breaker.

- **CLOSED**: calls pass through. Three consecutive failures open the circuit.
- **OPEN**: for 15 seconds, bookings are rejected immediately with a 503 and a retry time.
- **HALF_OPEN**: the next call is a trial. Success closes the circuit; failure opens it again.

Only missing responses and 5xx errors count as failures. A declined payment (402) does not.

To demonstrate: stop `payment-service`, send three v2 bookings, check `/api/v1/circuit-status`, then restart the service and book again after 15 seconds.

## Testing

Import `docs/SmartStay.postman_collection.json` into Postman. With all services running and a freshly seeded database, run folders 1 to 7 in order; each request has status checks and passes IDs to the next. Folders 8 and 9 are manual failure demos.

## Project structure

```
SmartStay/
├── service-registry/        registry (app.js)
├── api-gateway/             gateway (app.js, utils/discover.js)
├── hotel-service/           models, routes, scripts/seed.js
├── booking-service/         models, routes (v1, v2), saga, utils (CircuitBreaker)
├── payment-service/         models, routes
├── recommendation-service/  models, routes, utils/scoreHotel.js
├── frontend/                React app (src/pages)
└── docs/                    architecture diagram, Postman collection
```

## Known limitations

- Room availability is a single flag, not tracked per date.
- There is no authentication; the frontend uses a fixed demo user.
- Cancelling a confirmed booking releases the room but does not refund the payment.
- The registry and the Gateway each run as a single instance.
- Payments are simulated. No real payment or personal data is used.
