# Draw and Guess Game 

A real-time multiplayer drawing and guessing game where players take turns drawing while others guess the word. Built with React, Socket.io, Node.js, and MongoDB.

##  Game Overview

Draw and Guess is a multiplayer game similar to Pictionary where:
- One player draws a given word
- Other players try to guess the word through chat
- First to guess correctly wins points
- Players take turns being the drawer

##  Features

- **Real-time Drawing Board**: Smooth drawing with customizable colors and brush sizes
- **Room System**: Create or join private game rooms with unique codes
- **Global Chat**: Chat with all online players
- **Room Chat**: Game-specific chat for guessing
- **Word Detection**: Automatic detection of correct guesses
- **Player Management**: Host controls, player joining/leaving notifications
- **Authentication**: JWT-based user authentication
- **Responsive Design**: Works on desktop and mobile devices

##  Technologies Used

### Frontend
- React.js
- Socket.io Client
- HTML5 Canvas
- CSS3 with modern animations

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/draw-and-guess.git
cd draw-and-guess
