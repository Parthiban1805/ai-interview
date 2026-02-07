# AI Interview

An AI-powered interview practice platform that helps candidates prepare for technical interviews through realistic simulations, intelligent questioning, and automated feedback.

## 🌟 Features

- **AI-Powered Interviews**: Practice with an intelligent AI interviewer that asks relevant technical questions
- **Real-time Interaction**: Engage in dynamic conversations with contextual follow-up questions
- **Instant Feedback**: Receive comprehensive feedback on your performance, including strengths and areas for improvement
- **Multiple Interview Types**: Support for various interview categories (Frontend, Backend, Full Stack, etc.)
- **Performance Analytics**: Track your progress and improvement over time
- **Responsive Design**: Seamlessly works across desktop and mobile devices

## 🏗️ Project Structure

```
ai-interview/
├── frontend/          # Frontend application (JavaScript)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Backend server (Python)
│   ├── app/
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **JavaScript** (67.2%)
- React/Vue.js or vanilla JavaScript
- Modern CSS for styling
- RESTful API integration

### Backend
- **Python** (31.6%)
- FastAPI/Flask for API endpoints
- AI/ML integration (OpenAI, Google Gemini, or similar)
- Session management and state handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager
- pip for Python package management

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Parthiban1805/ai-interview.git
cd ai-interview
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API keys
# Example:
# OPENAI_API_KEY=your_api_key_here
# or
# GEMINI_API_KEY=your_api_key_here

# Run the backend server
python main.py
```

The backend server should now be running at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application should now be running at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# AI API Configuration
OPENAI_API_KEY=your_openai_api_key
# or
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=8000
HOST=0.0.0.0

# Database (if applicable)
DATABASE_URL=your_database_url

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

## 📖 Usage

1. **Start the Application**: Launch both frontend and backend servers
2. **Select Interview Type**: Choose your desired interview category (Frontend, Backend, Full Stack, etc.)
3. **Begin Interview**: Start the interview session and answer questions
4. **Receive Feedback**: Get detailed feedback on your performance after completing the interview
5. **Review Analytics**: Track your progress and identify areas for improvement

## 🎯 API Endpoints

### Backend API Routes

```
POST   /api/start-interview     # Initialize a new interview session
POST   /api/submit-answer       # Submit an answer to a question
GET    /api/get-question        # Fetch the next interview question
POST   /api/end-interview       # Complete the interview and get feedback
GET    /api/interview-history   # Retrieve past interview sessions
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Parthiban**
- GitHub: [@Parthiban1805](https://github.com/Parthiban1805)

## 🙏 Acknowledgments

- OpenAI/Google for AI API services
- React/Vue.js community
- Python FastAPI/Flask communities
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Contact the maintainer

## 🔮 Future Enhancements

- [ ] Voice-based interview support
- [ ] Video interview simulation
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with more AI models
- [ ] Collaborative interview practice
- [ ] Custom question bank creation
- [ ] Interview scheduling system

## ⚠️ Disclaimer

This is an interview practice tool designed for educational purposes. Results and feedback are generated by AI and should be used as a guide for improvement, not as a definitive assessment of your abilities.

---

