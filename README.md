# 🪐 Peter 3D Hub

Peter 3D Hub is a modern, high-performance web application designed to host, view, and interact with 3D models. Built entirely on the frontend with React Three Fiber, it features smooth infinite scrolling, real-time 3D rendering, and a beautifully crafted dark-mode UI.

## ✨ Features

* **Real-Time 3D Rendering:** View `.glb` and `.gltf` files directly in the browser using Three.js and React Three Fiber.
* **Dynamic Lighting Controls:** Instantly switch between lighting environments (City, Studio, Sunset, Forest) to see how materials react in real-time.
* **Local Upload & Preview:** Drag and drop local 3D files to preview them in an interactive 3D modal without needing to upload them to a server first.
* **Infinite Scrolling:** Automatically fetches and renders new models as the user scrolls down the page, utilizing an Intersection Observer.
* **Smart Downloading:** Bypasses standard CORS restrictions by fetching files as blobs, allowing users to safely download models.
* **Interactive UI:** Features category filtering, live searching, toast notifications, and interactive "Like" and "Share" buttons.

---

## 🛠️ Tech Stack

* **Framework:** React 18 (via Vite)
* **Styling:** Tailwind CSS
* **3D Engine:** Three.js & @react-three/fiber
* **3D Helpers:** @react-three/drei (for OrbitControls, Stage environments, and GLTF loading)

---

