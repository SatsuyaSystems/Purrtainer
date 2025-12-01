# Purrtainer - Portainer Mobile Client

A React Native/Expo mobile application for managing Docker containers on Portainer instances. Control your containers on the go with a sleek, responsive interface.

## Features

### Container Management
- **View Containers**: Browse all containers with real-time status
- **Start/Stop/Restart**: Quick actions for container lifecycle management
- **Kill Containers**: Force terminate containers when needed
- **Container Details**: View comprehensive container information (image, IP, state, etc.)

### Advanced Features
- **Interactive Terminal (Attach)**: Real-time shell access to running containers with WebSocket support
- **Console (Exec)**: Execute commands inside containers and view output
- **Logs Viewer**: Stream and view container logs
- **Stacks Management**: View and manage Docker stacks across endpoints
- **Multi-Endpoint Support**: Connect to multiple Portainer instances

### Security & Authentication
- **Unified Authentication**: Username, password, and API key login
- **JWT Token Management**: Secure token-based authentication
- **Secure Storage**: Encrypted credential storage using Expo Secure Store
- **HTTPS/WSS Support**: Encrypted connections for all data
- **CSRF Protection Bypass**: Intelligent header management for API compatibility

## Project Structure

```
app/
├── _layout.tsx           # Root navigation layout
├── index.tsx             # Dashboard/home screen
├── modal.tsx             # Modal screens
├── auth/
│   └── login.tsx         # Authentication screen
├── container/
│   ├── [id].tsx          # Container details page
│   └── [id]/
│       ├── attach.tsx    # Interactive terminal (WebSocket)
│       ├── console.tsx   # Command execution (Exec API)
│       └── logs.tsx      # Container logs viewer
├── dashboard/
│   ├── [id].tsx          # Stack details
│   └── [id]/stacks.tsx   # Stack contents
└── stack/
    └── [id].tsx          # Stack management

components/
├── ContainerCard.tsx     # Container list item component
├── EnvironmentCard.tsx   # Endpoint selector component
├── NeonButton.tsx        # Primary button component
├── NeonCard.tsx          # Card container component
├── OutlinedText.tsx      # Typography component
└── StackCard.tsx         # Stack list item component

services/
├── api.ts                # Axios HTTP client with interceptors

store/
├── authStore.ts          # Authentication state (Zustand + SecureStore)
└── stackFilterStore.ts   # Stack filtering state

types/
└── index.ts              # TypeScript type definitions

constants/
├── Colors.ts             # Color palette definitions
└── theme.ts              # Theme configuration

hooks/
├── use-color-scheme.ts   # Platform color scheme detection
├── use-color-scheme.web.ts
└── use-theme-color.ts    # Theme color management
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- A Portainer instance (v2.33.5 Business Edition or compatible)
- An API key from your Portainer instance

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Purrtainer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure your environment
   - Get your Portainer server URL
   - Create an API key in Portainer admin panel
   - These will be entered during login

### Running the App

**Development Mode:**
```bash
npx expo start
```

Then choose:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app on physical device

**Production Build:**
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## API Authentication Flow

### Login Process
1. User provides: username, password, and API key
2. App sends credentials to `/api/auth` endpoint
3. Server returns JWT token
4. Both API key and JWT are stored securely:
   - `token` (API key) for HTTP requests
   - `jwtToken` for WebSocket connections

### Headers
All API requests include:
- `X-API-Token`: API key for Docker API calls
- `Authorization`: Bearer JWT token
- `Referer`: Server URL (required by Portainer)

### CSRF Protection
Automatically disabled for:
- Container actions (stop, start, restart, kill)
- Exec operations (command execution)
- WebSocket connections

## Core Features Documentation

### 1. Dashboard
- **Endpoint Selection**: Choose which Portainer endpoint to manage
- **Container List**: Browse all containers with filtering
- **Quick Stats**: View container count and status summary
- **Navigation**: Access stacks, containers, and detailed views

### 2. Container Management

#### Details Page (`container/[id].tsx`)
- Container status and metadata
- Quick action buttons: Attach, Logs, Console
- Lifecycle controls: Start, Stop, Restart, Kill
- Real-time status updates

**Actions Implemented:**
```typescript
// POST /api/endpoints/{endpointId}/docker/containers/{id}/start
// POST /api/endpoints/{endpointId}/docker/containers/{id}/stop
// POST /api/endpoints/{endpointId}/docker/containers/{id}/restart
// POST /api/endpoints/{endpointId}/docker/containers/{id}/kill
```

#### 3. Interactive Terminal (Attach)

**Technology:** WebSocket + React Native

**Features:**
- Real-time shell access to running containers
- ANSI escape code handling for clean output
- Command input and immediate execution
- Automatic terminal output buffering

**Connection Flow:**
```
1. WebSocket connects to: wss://{host}/api/websocket/attach?endpointId={id}&token={jwt}&id={containerId}
2. Server establishes shell session
3. Messages received stripped of ANSI codes
4. User input sent via ws.send(command + '\n')
5. Output appended to terminal display
```

**Key Implementation Details:**
- Container ID passed as URL parameter (not message)
- JWT token URL-encoded in query string
- ANSI code regex: `/\x1b\[[0-9;]*[a-zA-Z]?/g`
- Handshake: Discards initial connection messages
- Output cleanup: Removes terminal control sequences

#### 4. Console (Exec)

**Technology:** Portainer Exec API

**Workflow:**
```
1. Create exec instance: POST /api/endpoints/{endpointId}/docker/containers/{id}/exec
   Body: { Cmd: ['/bin/sh', '-c', command], AttachStdout: true, ... }
2. Start exec: POST /api/endpoints/{endpointId}/docker/exec/{execId}/start
   Body: { Detach: false, Tty: false }
3. Receive output as text response
4. Display in scrollable output area
```

**Constraints:**
- One command at a time
- No persistent shell state between commands
- Output limited to command response

#### 5. Logs Viewer

**Features:**
- Stream container logs in real-time
- Tail mode for recent logs only
- Timestamp display
- Scrollable history

### State Management

**Authentication Store (Zustand):**
```typescript
{
  serverUrl: string          // Portainer server URL
  token: string              // API key
  jwtToken: string           // JWT for WebSocket
  setServerUrl()
  setToken()
  setJwtToken()
  logout()
}
```

**Stack Filter Store:**
- Active stack filtering
- Search/filter state management

**Persistence:**
- Credentials encrypted via `expo-secure-store`
- Automatic token refresh on app launch
- Secure deletion on logout

## Error Handling

### Common Issues & Solutions

**403 CSRF Token Not Found**
- ✅ Fixed by setting `withCredentials: false` for container/exec endpoints

**403 Referer Not Supplied**
- ✅ Fixed by adding `Referer` header in API interceptor

**400 Starting container with non-empty request body**
- ✅ Fixed by sending `null` body for start action

**WebSocket: 1000 Close Code**
- Container ID was being sent as message and echoed back
- ✅ Fixed by moving container ID to URL parameter

**Terminal Output Showing ANSI Codes**
- WebSocket receives terminal control sequences
- ✅ Fixed by regex stripping: `/\x1b\[[0-9;]*[a-zA-Z]?/g`

## API Endpoints Reference

### Authentication
```
POST /api/auth
  Body: { username, password, apiKey }
  Response: { jwt }
```

### Container Operations
```
GET /api/endpoints/{endpointId}/docker/containers/json
  Response: [{ Id, Name, State, ... }]

GET /api/endpoints/{endpointId}/docker/containers/{id}/json
  Response: { Id, Name, Config, State, NetworkSettings, ... }

POST /api/endpoints/{endpointId}/docker/containers/{id}/start
POST /api/endpoints/{endpointId}/docker/containers/{id}/stop
POST /api/endpoints/{endpointId}/docker/containers/{id}/restart
POST /api/endpoints/{endpointId}/docker/containers/{id}/kill
```

### Exec
```
POST /api/endpoints/{endpointId}/docker/containers/{id}/exec
  Body: { Cmd: string[], AttachStdout: bool, AttachStderr: bool, Tty: bool }
  Response: { Id }

POST /api/endpoints/{endpointId}/docker/exec/{execId}/start
  Body: { Detach: bool, Tty: bool }
  Response: command output (text)
```

### WebSocket
```
GET /api/websocket/attach?endpointId={id}&token={jwt}&id={containerId}
  Upgrade: websocket
  Query: endpointId (endpoint ID), token (URL-encoded JWT), id (container ID)
```

## Dependencies

### Core
- `react-native`: 0.73.6 - UI framework
- `expo`: 54.0.25 - Development platform
- `expo-router`: File-based routing
- `typescript`: Type safety

### State Management
- `zustand`: 5.0.9 - State store
- `expo-secure-store`: Encrypted credential storage

### HTTP & WebSocket
- `axios`: HTTP client
- React Native WebSocket API (built-in)

### UI Components
- `react-native-safe-area-context`: Safe area handling
- `expo-status-bar`: Status bar management

## Development

### Adding New Features

1. **New Container Action**
   - Add to `container/[id].tsx` handleAction function
   - Update API interceptor if CSRF handling needed
   - Test with real Portainer instance

2. **New Endpoint Route**
   - Create file in `app/` directory
   - Use `useLocalSearchParams()` for dynamic segments
   - Follow existing navigation patterns

3. **New API Call**
   - Use `api` from `services/api.ts`
   - Add to interceptor if special handling needed
   - Include error handling with user feedback

### Testing

```bash
# Lint check
npx eslint .

# Type check
npx tsc --noEmit

# Run on device/emulator
npx expo start
```

## Known Limitations

1. **Console (Exec)**: Each command is stateless - no shell persistence between commands
2. **WebSocket**: Requires active internet connection; reconnect on timeout needed
3. **Auth**: No refresh token implementation - re-login required on token expiry
4. **Logs**: Real-time streaming may lag on slow networks

## Future Enhancements

- [ ] Persistent shell state in console
- [ ] Automatic token refresh
- [ ] Batch container operations
- [ ] Image management (pull, build, push)
- [ ] Volume management
- [ ] Network management
- [ ] Offline mode with sync
- [ ] Dark mode improvements
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review API documentation at your Portainer instance

## Credits

- Built with [Expo](https://expo.dev)
- Powered by [Portainer](https://www.portainer.io)
- UI Components inspired by modern React Native design patterns

