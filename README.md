# AI Contract CheckA tranquil digital wellness platform built with modern web technologies.

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Cloudflare Workers + Hono
- Storage: Cloudflare KV
- Authentication: Google OAuth + JWT
- Package Manager: pnpm
- Build Tools: TypeScript, ESLint, Prettier

## Prerequisites

- Node.js 18+
- pnpm 8+
- Cloudflare account for Workers and KV
- Google Cloud Platform account for OAuth

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AIContractCheck.git
cdAI Contract Check
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Frontend
cp packages/frontend/.env.example packages/frontend/.env

# Backend
cp packages/backend/.dev.vars.example packages/backend/.dev.vars
```

4. Configure Google OAuth:
   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google OAuth2 API
   - Create OAuth 2.0 credentials (Client ID and Secret)
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://your-domain.com/auth/callback`
   - Update the environment variables with your credentials

5. Configure Cloudflare:
   - Create a Cloudflare Workers project
   - Set up KV namespaces:
     ```bash
     cd packages/backend
     pnpm wrangler kv:namespace create USERS
     pnpm wrangler kv:namespace create WHISPERS
     pnpm wrangler kv:namespace create LIKES
     ```
   - Update wrangler.toml with your KV namespace IDs

## Development

Run the development servers:

```bash
# Frontend (http://localhost:3000)
cd packages/frontend
pnpm dev

# Backend (http://localhost:8787)
cd packages/backend
pnpm dev
```

## Project Structure

```
packages/
  ├── frontend/        # React application
  ├── backend/         # Cloudflare Workers API
  └── shared/          # Shared types and utilities
```

### Key Features

- 🎵 Ambient Sound Library
- 💭 Whispers System
- 🌈 Theme Customization
- 👥 Community Features
- 🔒 Secure Authentication
- 🌐 Global CDN Distribution

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# acc
