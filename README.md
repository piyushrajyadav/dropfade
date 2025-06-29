# DropKey - an open source plateform for one-time media sharing 

A secure, anonymous file and text sharing web application built with Next.js, TypeScript, TailwindCSS, Cloudinary, and Redis.

## Features

- Upload any file (max 5MB) or write text directly
- Get a unique 6-character code for sharing
- Files/text are automatically deleted after:
  - Single download/view
  - OR expiry time (5m, 1h, 1d)
- No login required
- Mobile-first responsive design

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Storage**: Cloudinary (files), Redis (metadata)
- **UI Components**: Heroicons, React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- Cloudinary account
- Redis instance (Upstash recommended for serverless)

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis Configuration
REDIS_URL=your_redis_url

# App Configuration
MAX_FILE_SIZE=5242880 # 5MB in bytes
CODE_LENGTH=6
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dropkey.git
   cd dropkey
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Cloudinary and Redis credentials

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is ready to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## Project Structure

```
dropkey/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── file/            # File viewer page
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# drop-fade
# dropfade
# dropfade
