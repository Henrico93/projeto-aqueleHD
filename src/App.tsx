import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { theme } from "./theme"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import PedidosPage from "./pages/PedidosPage"
import NovoPedidoPage from "./pages/NovoPedidoPage"
import PagamentoPage from "./pages/PagamentoPage"
import EditarPedidoPage from "./pages/EditarPedidoPage"
import EstoquePage from "./pages/EstoquePage"
import RelatoriosPage from "./pages/RelatoriosPage"
import { DataProvider } from "./context/DataContext"
import ProdutosPage from "./pages/ProdutosPage"

function App() {
  return (
    <ChakraProvider theme={theme}>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pedidos" element={<PedidosPage />} />
              <Route path="/novo-pedido" element={<NovoPedidoPage />} />
              <Route path="/editar-pedido/:pedidoId" element={<EditarPedidoPage />} />
              <Route path="/pagamento/:pedidoId" element={<PagamentoPage />} />
              <Route path="/estoque" element={<EstoquePage />} />
              <Route path="/produtos" element={<ProdutosPage/>} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </ChakraProvider>
  )
}

export default App
