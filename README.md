# Weapon Detection System

This is a Next.js project that uses TensorFlow.js and a custom Teachable Machine model for real-time weapon detection in the browser.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Kishoreramu25/Machine_learning_Model.git
    cd weapon-detector
    ```

2.  **Install dependencies:**

    ```bash
    npm install --legacy-peer-deps
    ```

    *Note: The `--legacy-peer-deps` flag is recommended to avoid potential dependency conflicts with some TensorFlow packages.*

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open the application:**

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Functionality

- **Real-time Detection**: Uses your webcam to detect objects.
- **Custom Model**: Integrated with a custom Teachable Machine model trained to detect specific classes (e.g., "gun", "knife").
- **Privacy**: All processing happens locally in your browser; no video data is sent to any server.

## Troubleshooting

-   **Camera Access**: Ensure your browser has permission to access the webcam.
-   **Model Loading**: If the model fails to load, check your internet connection (it fetches the model from Teachable Machine initially).
