# Informative AI App

A modern, responsive web application built with Next.js and React, designed to provide AI-powered information and interactions.

## 🚀 Features

- **Next.js 14** - Latest features and optimizations
- **React 18** - With concurrent rendering
- **Responsive Design** - Works on all device sizes
- **Fast Refresh** - Instant feedback during development
- **Production Ready** - Optimized builds for the best performance

## 🛠️ Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone git@github.com:Yashuchirag/InformativeAIApp.git
   cd InformativeAIApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🏗️ Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Creates an optimized production build
- `npm start` - Starts the production server
- `npm run prod` - Builds and starts the production server

## 📂 Project Structure

```
InformativeAIApp/
├── app/                  # App directory with routing
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   ├── layout.js        # Root layout
│   └── page.jsx         # Home page
├── public/              # Static files
└── package.json         # Project dependencies and scripts
```

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [React](https://reactjs.org/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)

## To Implement Features

- ✅ Buttons/input ways to upload file, images
- Drop down to select a different model. Model should be greyed out if it is not fully available, show which model is selected
- ✅ Press enter to submit prompt, shift + enter should just go to next line  
- Markdown rendering with tables also
- Multiple Chat history support with button saying start a new chat
- Prompt window max characters limit enforcement 
- ✅ Dark mode light mode switch
