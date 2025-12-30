/* Router principal. Hoy navega páginas mock; mañana puede incorporar auth/guards. */
import { createBrowserRouter } from 'react-router-dom'

import App from './App'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import InstructionsPage from './pages/InstructionsPage'
import AboutPage from './pages/AboutPage'
import AllRestaurantsPage from './pages/AllRestaurantsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurant/:id', element: <RestaurantPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'instrucciones', element: <InstructionsPage /> },
      { path: 'sobre-nosotros', element: <AboutPage /> },
      { path: 'all-restaurants', element: <AllRestaurantsPage /> },
    ],
  },
])
