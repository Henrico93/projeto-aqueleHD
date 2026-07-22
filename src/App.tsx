import { ChakraProvider, useToast } from "@chakra-ui/react"
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom"
import { useEffect, useRef, useCallback } from "react"
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
import HistoricoPage from "./pages/HistoricoPage"
import ComprovantePage from "./pages/ComprovantePage"
import { DataProvider } from "./context/DataContext"
import LoadingOverlay from "./components/LoadingOverlay"
import { useData } from "./context/DataContext"

const INATIVIDADE_MS = 30 * 60 * 1000 // 30 minutos

// Componente wrapper para acessar o contexto
const ProtectedRoute = () => {
  const { currentUser, logout } = useData()
  const navigate = useNavigate()
  const toast = useToast()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      logout()
      toast({
        title: "Sessão expirada",
        description: "Você ficou inativo por 30 minutos e foi desconectado.",
        status: "warning",
        duration: 6000,
        isClosable: true,
        position: "top",
      })
      navigate("/login", { replace: true })
    }, INATIVIDADE_MS)
  }, [logout, navigate, toast])

  useEffect(() => {
    if (!currentUser) return
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"]
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))
    resetTimer() // Inicia o timer ao entrar
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [currentUser, resetTimer])

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
          <Route path="/comprovante" element={<ComprovantePage />} />

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
            <Route path="/historico" element={<HistoricoPage />} />
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
