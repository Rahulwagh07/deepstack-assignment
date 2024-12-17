<h1 style="font-size: 40px;">Smart Contract For Reverse Auction</h1>

## Running Locally

1. Clone Repository

```bash
git clone https://github.com/Rahulwagh07/deepstack-assignment.git
```

2. Navigate to the project directory:

```bash
cd deepstack-assignment
```

3. Install dependencies

```bash
pnpm install

# Copy environment example
cp env.example .env
# Edit .env with your configurations
```

4. Smart Contract Deployment

```bash
# Compile contracts
npx hardhat compile

# Choose a blockchain environment to run locally
# Option 1: Install Ganache CLI and run
ganache-cli

# Option 2: Hardhat Network
npx hardhat node

# Deploy contract
npx hardhat run ./scripts/deploy.ts --network <network-name>
```

5. Frontend Configuration

```bash
# Navigate to frontend
cd frontend

# Install frontend dependencies
pnpm install

# Configure .env
# - Add deployed contract address 
# - Add Reown project ID from https://cloud.reown.com/sign-in

# Start development server
pnpm dev
```
 
 