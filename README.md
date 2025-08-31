# Tone Picker Text Tool

A web application that transforms text tone using AI-powered language processing. Users can type or paste text on the left and use a 3×3 tone matrix on the right to adjust formality and voice characteristics via Mistral AI.

![Tone Picker Text Tool Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Tone+Picker+Text+Tool+Screenshot)

## ✨ Features

- **Text Editor**: Large, auto-resizing textarea with character/word count
- **3×3 Tone Matrix**: Two-axis control for formality (Casual → Neutral → Formal) and voice (Friendly → Neutral → Direct)
- **Undo/Redo**: Full history management with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- **Reset**: Restore original text and clear tone selection
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: Comprehensive error messages with retry options
- **Local Storage**: Persistent text and history across sessions
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and ARIA support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                   │
├─────────────────────────────────────────────────────────────┤
│  Editor.tsx  │  ToneMatrix.tsx  │  Toolbar.tsx  │  Store  │
│               │                  │               │         │
│  Text Input  │  3×3 Grid        │  Actions      │ Zustand │
│  Auto-resize │  Tone Selection  │  History      │ + Immer │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js API)                   │
├─────────────────────────────────────────────────────────────┤
│  /api/tone  │  Rate Limiting  │  LRU Cache    │ Mistral  │
│              │                 │               │          │
│  Validation │  IP-based       │  200 entries  │ AI API   │
│  Zod Schema │  5 req/10s      │  10min TTL    │          │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 State Management

The application uses **Zustand** with **Immer** for state management:

### History State
```typescript
type HistoryState = {
  past: string[]      // Previous text versions
  present: string     // Current text
  future: string[]    // Redo stack
}
```

### UI State
```typescript
type UIState = {
  isTransforming: boolean
  selected: { x: -1|0|1; y: -1|0|1 } | null
  lastError?: { code: string; message: string; retryAfterMs?: number }
  lastStatus?: string
}
```

### Undo/Redo Algorithm
1. **Text Change**: Current text pushed to `past` array
2. **Undo**: Last item from `past` moved to `present`, current `present` pushed to `future`
3. **Redo**: First item from `future` moved to `present`, current `present` pushed to `past`
4. **Duplicate Prevention**: Consecutive identical states are not added to history

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand + Immer
- **AI Integration**: @mistralai/mistralai SDK
- **Validation**: Zod schema validation
- **Caching**: LRU cache (200 entries, 10min TTL)
- **Rate Limiting**: Sliding window (5 requests per 10 seconds)
- **Testing**: Jest + React Testing Library + MSW
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mistral AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tone-picker-text-tool.git
   cd tone-picker-text-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key_here
   NODE_ENV=development
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm start
```

## 🎯 Usage

1. **Type or paste text** in the editor on the left
2. **Select a tone** by clicking on the 3×3 matrix:
   - **X-axis**: Formality (Casual → Neutral → Formal)
   - **Y-axis**: Voice (Friendly → Neutral → Direct)
3. **Wait for transformation** - the AI will rewrite your text
4. **Use toolbar actions**:
   - Undo/Redo changes
   - Reset to original text
   - Copy transformed text
5. **Keyboard shortcuts**:
   - `Ctrl+Z`: Undo
   - `Ctrl+Shift+Z`: Redo  
   - `Ctrl+R`: Reset
   - `Ctrl+C`: Copy

## 🔒 Error Handling & Rate Limiting

### Error Types
- **AUTH_ERROR**: Invalid API key
- **RATE_LIMITED**: Too many requests
- **UPSTREAM_ERROR**: Mistral AI service issues
- **VALIDATION_ERROR**: Invalid request format
- **VERSION_MISMATCH**: Prompt version incompatibility

### Rate Limiting
- **Limit**: 5 requests per 10 seconds per IP
- **Headers**: Supports `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`
- **Response**: Includes `retryAfterMs` for client backoff

### Caching Strategy
- **LRU Cache**: Maximum 200 entries
- **TTL**: 10 minutes per entry
- **Key**: SHA-256 hash of `text + coordinates + promptVersion`
- **Benefits**: Reduces API calls, improves response time

## 🧪 Testing Strategy

### Test Coverage
- **Store Tests**: History management, undo/redo logic
- **API Tests**: Request validation, error handling, caching
- **Prompt Tests**: Tone mapping, coordinate validation

### Mocking
- **MSW**: API endpoint mocking for integration tests
- **localStorage**: Browser storage mocking
- **Environment**: API key and configuration mocking

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables**:
   - `MISTRAL_API_KEY`: Your Mistral AI API key
3. **Deploy**: Automatic deployment on push to main branch

### Environment Variables
```env
MISTRAL_API_KEY=your_mistral_api_key_here
NODE_ENV=production
```

### Build Configuration
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Max Duration**: 10 seconds (API route)

## ♿ Accessibility

- **Keyboard Navigation**: Arrow keys for matrix navigation
- **ARIA Labels**: Proper roles and descriptions
- **Focus Management**: Visible focus indicators
- **Screen Reader**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliant

## 📱 Responsive Design

- **Desktop**: Side-by-side layout (2/3 editor, 1/3 matrix)
- **Mobile**: Stacked layout (editor above matrix)
- **Touch Targets**: Minimum 44px for mobile interaction
- **Breakpoints**: Tailwind responsive utilities

## 🔮 Future Improvements

- **Streaming Responses**: Real-time text transformation
- **Diff View**: Before/after comparison
- **Batch Processing**: Multiple tone transformations
- **Custom Prompts**: User-defined tone instructions
- **Server Caching**: Redis/Upstash for distributed caching
- **Analytics**: Usage tracking and insights
- **i18n**: Internationalization support

## 📝 Recording Instructions

To create a demo video for this project:

1. **Use Loom** (recommended) or similar screen recording tool
2. **Record a 2-3 minute walkthrough**:
   - Show the interface and explain the 3×3 matrix
   - Demonstrate typing text and applying different tones
   - Show undo/redo functionality
   - Highlight error handling and loading states
   - Mention keyboard shortcuts
3. **Upload to Loom** and add the link to this README

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mistral AI](https://mistral.ai/) for providing the language model
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Zustand](https://github.com/pmndrs/zustand) for lightweight state management
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/tone-picker-text-tool/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Built with ❤️ using Next.js, React, and Mistral AI**
"# Tone-picker" 
"# Tone-picker" 
