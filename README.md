# 🏗️ THE WORKLINK

Welcome to **THE WORKLINK** – a high-performance Workforce Development and Gig Economy platform built with modern web technologies. This platform bridges the gap between consumers and a diverse workforce, featuring real-time status management, rank-based recruitment, and automated payment splits.

---

## ✨ Features

- **🌐 Multi-Language Support**: Seamlessly toggle between **English**, **Hindi**, and **Punjabi**.
- **💳 Payment Distributions**: Automated 80:20 split for Mentor/Rookie pairings.
- **📊 Real-time Dashboard**: Dynamic tracking of worker status (Online/Offline) and job progress.
- **🛠️ Flexible Worker Types**: Support for both 'Gig' workers and 'WorkLink' (Employee) workers.
- **📍 Location-based Filtering**: Smart recruitment based on city and proximity.
- **🛡️ Secure Auth & Native DB**: Robust backend using the native MongoDB driver for maximum performance.

---

## 🚀 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.x or later recommended)
- **npm** or **pnpm**
- **MongoDB** (Local instance or Atlas connection)

### ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/manveersinghmudher-hub/THE-WORKLINK.git
   cd THE-WORKLINK
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or if you use pnpm
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory and add your MongoDB connection strings:
   ```env
   # Local MongoDB (e.g., mongodb://localhost:27017/worklink)
   MONGODB_URI="your_mongodb_uri"

   # Atlas MongoDB (Cloud)
   ATLASMONGODB_URI="your_atlas_uri"
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Components** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Database** | [MongoDB Native Driver](https://www.mongodb.com/docs/drivers/node/current/) |
| **State/Forms** | [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/) |

---

## 📂 Project Structure

- `/app`: Next.js App Router (API routes and page layouts).
- `/components`: Reusable UI components powered by Radix and Tailwind.
- `/lib`: Database connections and utility functions.
- `/public`: Static assets and global icons.
- `/styles`: Global CSS and utility styles.

---

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code analysis.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

Developed with ❤️ by the WorkLink Team.
