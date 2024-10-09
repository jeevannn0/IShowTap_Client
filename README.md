# Telegram Coin Tap App

This is a simple Telegram Web App assignment that allows users to tap and increase their coin balance. The app is built using React, Apollo Client, and GraphQL. Users can tap on the screen to increment their coin balance, which is stored and fetched from a backend server using GraphQL queries and mutations.

## Features

- **Coin Balance Display:** The app displays the user's current coin balance fetched from the backend.
- **Tap-to-Increment:** Users can tap on the button to increase their coin balance.
- **Real-time Update:** Coin balance is updated in real-time using GraphQL mutations.
- **Lottie Animations:** Smooth animations using Lottie for both the coin display and tap button.
- **Telegram Web App Integration:** The app integrates with Telegram's Web App platform to retrieve the user's data (username, user ID). [Link](https://t.me/tapme_co3_bot)

> [!NOTE]
> **New Feature:** The app now supports offline coins syncing. When the user comes online, the app syncs the coins from the local storage to the server. This ensures that the user's coin balance is always up-to-date, even when they are offline.
> [Testing](#testing-offline-coins-syncing)

## Project Structure

- **React:** For building the frontend UI.
- **Apollo Client:** To manage GraphQL queries and mutations.
- **GraphQL:** API query language
- **Lottie**: For adding animations to the app.
- **TypeScript**: To ensure type safety and reliability of the code.

## Setup Instructions

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or later)
- Yarn or npm
- A backend server running with the necessary GraphQL endpoints for user and coin balance management

### Installation

1. Clone the repository:

```bash
git clone [repository-url](https://github.com/arshali2774/CO3_client.git)
```

2. Navigate to the project directory:

```bash
cd CO3_client
```

3. Install dependencies:

```bash
npm install
```

### Configuration

1. Make sure you have a running GraphQL server with the following queries and mutations:

- `getUser(chat_id: Int!)`: Fetches the user data including the current coin balance.
- `updateCoins(chat_id: Int!, coins: Int!)`: Updates the user's coin balance.

2. If needed, update the GraphQL endpoint in the Apollo Client setup.
3. Ensure the app is integrated with Telegram's Web App platform by correctly configuring the Telegram Web App settings.

### Running the App

To interact with the app:

- Open my Telegram bot: https://t.me/tapme_co3_bot
- Type the /start command, and you will get a response to open the app.
- Open the app and click to increase coins.

> [!NOTE]
> Since the backend is deployed on Render, the first launch may take around 50 seconds. If you do not see the results or encounter an error message like "Error: User data not found," please wait 1-2 minutes and try again.

## GraphQL Endpoints

### Queries

- `GET_USER`: Fetches the user data based on `chat_id`:
  ```graphql
  query GetUser($chat_id: Int!) {
    getUser(chat_id: $chat_id) {
      id
      name
      coin_balance
      chat_id
    }
  }
  ```

### Mutations

- `UPDATE_COINS_MUTATION`: Updates the coin balance for the user:
  ```graphql
  mutation UpdateCoins($chat_id: Int!, $coins: Int!) {
    updateCoins(chat_id: $chat_id, coins: $coins) {
      id
      coin_balance
      chat_id
    }
  }
  ```

## How It Works

1. The app retrieves the user's Telegram information through the window.Telegram.WebApp.initDataUnsafe object. It uses this data to fetch the user's existing coin balance from the backend via a GraphQL query.
2. When the user taps on the button, a +1 animation is triggered, and the coin balance is incremented in the UI.
3. The new balance is sent to the backend using a GraphQL mutation, which updates the user's coin balance on the server.
4. The app continuously fetches the latest balance to keep the UI up-to-date.

### Testing Offline Coins Syncing

- Start the app from Telegram bot.
- Right click on the app and select "Inspect".
- Open the "Network" tab.
- Click on "No throttling" and select "Offline" from the dropdown.
- Open the app and tap the button.
- Observe the coin balance in the UI.
- Close the app and open it again.
- Observe that the coin balance is updated to the stored offline balance.

## Technology Stack

- **React**: Frontend framework
- **Apollo Client**: For handling GraphQL queries and mutations
- **GraphQL**: API query language
- **TypeScript**: Ensuring type safety
- **Lottie**: Adding animations to the app
- **Telegram Web App API**: For retrieving user data

## Future Improvements

- Implement caching for GraphQL queries to minimize unnecessary requests.
- Add more engaging animations or sound effects when the user taps.
- Introduce a leaderboard feature to compare coin balances among users.

## Contact

For any questions or clarifications, feel free to contact me at:
Email: arshaliwork@gmail.com
