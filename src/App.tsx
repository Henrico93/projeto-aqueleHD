import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { theme } from "./theme"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import PedidosPage from "./pages/PedidosPage"
import NovoPedidoPage from "./pages/NovoPedidoPage"
import PagamentoPage from "./pages/PagamentoPage"
import EditarPedidoPage from "./pages/EditarPedidoPage"
import EstoquePage from "./pages/EstoquePage"
import RelatoriosPage from "./pages/RelatoriosPage"
import ProdutosPage from "./pages/ProdutosPage"
import LoginPage from "./pages/LoginPage"
import EquipePage from "./pages/EquipePage"
import { DataProvider } from "./context/DataContext"
import LoadingOverlay from "./components/LoadingOverlay"
import { useData } from "./context/DataContext"

// Componente wrapper para acessar o contexto
const ProtectedRoute = () => {
  const { currentUser } = useData()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

const AppContent = () => {
  const { loading, error } = useData()

  return (
    <>
      <LoadingOverlay isLoading={loading} error={error} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/novo-pedido" element={<NovoPedidoPage />} />
            <Route path="/editar-pedido/:pedidoId" element={<EditarPedidoPage />} />
            <Route path="/pagamento/:pedidoId" element={<PagamentoPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/equipe" element={<EquipePage />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ChakraProvider>
  )
}

export default App
