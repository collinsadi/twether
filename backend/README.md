# Twether Backend

## Overview

The Twether backend is a Node.js/Express server that handles tweet aggregation, AI processing, and real-time WebSocket communication. It monitors Ethereum community Twitter profiles, processes tweets using AI to evaluate impact and sentiment, and broadcasts relevant tweets to connected clients.

## Features

- **Tweet Monitoring**: Automated monitoring of Ethereum community Twitter profiles
- **AI Processing**: Tweet evaluation using Gemini AI for impact, sentiment, and categorization
- **Real-time Updates**: WebSocket broadcasting of processed tweets
- **Cron Jobs**: Automated tweet checking every 10 minutes
- **MongoDB Integration**: Persistent storage of tweets and monitoring data

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **Real-time**: Socket.io
- **Scheduling**: node-cron
- **Twitter API**: Twitter API v2

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Twitter API credentials
- Google Gemini API key

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/collinsadi/twether
   cd twether/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp example.env .env
   ```

   Configure the following environment variables:

   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   TWITTER_BEARER_TOKEN=your_twitter_api_token
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Tweet Routes

- `GET /api/tweets` - Get all processed tweets

### WebSocket Events

- `connection` - Client connects to WebSocket
- `disconnect` - Client disconnects
- `tweet` - New tweet broadcast to all connected clients

## Development

### Project Structure

```
src/
├── common/
│   ├── config/          # Configuration files
│   ├── resources/       # Shared utilities
│   └── logger/          # Logging utilities
├── modules/
│   ├── llm/            # AI processing modules
│   └── tweet/          # Tweet-related modules
├── schemas/            # MongoDB schemas
└── types/              # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Collaboration Guide

### Getting Started

1. **Fork the repository** and create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the coding standards**:

   - Use TypeScript for all new code
   - Follow ESLint configuration
   - Write meaningful commit messages
   - Add JSDoc comments for public functions

3. **Testing**: Write tests for new features and ensure all existing tests pass

### Code Review Process

1. **Create a Pull Request** with a clear description of changes
2. **Ensure code quality**:
   - No linting errors
   - TypeScript compilation successful
3. **Update documentation** if adding new features
4. **Request review** from maintainers

### Best Practices

- **Error Handling**: Always handle potential errors gracefully
- **Type Safety**: Use TypeScript interfaces and types
- **Environment Variables**: Never commit sensitive data
- **Database**: Use proper indexes and optimize queries
- **Security**: Validate all inputs and sanitize data

### Troubleshooting

#### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Twitter API Limits**: Monitor rate limits and implement proper error handling
3. **Gemini API**: Verify API key and quota limits
4. **WebSocket**: Check for connection issues and implement reconnection logic

#### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and check console output for detailed information.

## License

This project is open source and available under the MIT License.
