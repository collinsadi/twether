

# Twether - Ethereum Tweet Feed

## Overview

Twether is an open-source platform designed to aggregate and analyze tweets from notable Ethereum community profiles on Twitter (X). The platform addresses the challenge of keeping up with the vast amount of information and updates shared within the Ethereum community. By leveraging AI, Twether evaluates tweets based on their impact, sentiment, and relevance to specific categories, providing users with real-time updates without the need for manual refreshes.

## Functionality

Twether monitors tweets from selected Twitter profiles and processes them using AI to assess:
- **Impact**: Tweets are evaluated for their significance, with only those having medium to high impact being logged.
- **Sentiment**: Tweets with neutral or positive sentiment are prioritized, filtering out those with negative sentiment.
- **Categories**: Tweets are categorized into the following Ethereum-related topics:
  - DeFi
  - DAOs
  - ETH2.0
  - Layer2
  - Hackathons
  - Jobs

A cron job runs every 10 minutes to check for new tweets from designated profiles. Tweets meeting the criteria (medium to high impact, non-negative sentiment, and falling within the specified categories) are logged and broadcast in real-time to connected clients via a WebSocket connection, ensuring seamless updates.

## User Interface

The Twether interface includes a "Wi-Fi" icon next to the logo, which indicates the status of the real-time WebSocket connection to the server. A green icon signifies an active connection, while a red or gray icon indicates a disconnection.

## Development

Twether is an open-source project, and contributions are highly encouraged. Developers and community members can contribute in the following ways:
- **Adding Profiles**: Expand the list of notable Ethereum Twitter profiles in the `backend/src/users.json` file.
- **Improving the UI**: Enhance the user interface for better usability and aesthetics.
- **System Optimization**: Optimize the backend and frontend systems for improved performance and scalability.

Contributions can be made by submitting pull requests or opening issues on the project's repository.

## Credits

The concept for Twether was inspired by Ayodeji, the founder of Web3 Bridge. His original idea is documented in the [Ethereum Tweet Library repository](https://github.com/ebunayo/Ethereum-Tweet-library). While the current version of Twether does not fully implement Ayodeji's vision, the open-source community is encouraged to collaborate to bring the project closer to its full potential.

The initial version (v1) of Twether was developed by Collins Adi. My work can be found on my [GitHub profile](https://github.com/collinsadi).

