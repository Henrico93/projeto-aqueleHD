import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import PedidosPage from "./pages/PedidosPage"
import NovoPedidoPage from "./pages/NovoPedidoPage"
import PagamentoPage from "./pages/PagamentoPage"



function App() {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/novo-pedido" element={<NovoPedidoPage />} />
            <Route path="/pagamento/:pedidoId" element={<PagamentoPage />} />
          </Routes>
        </Layout>
      </Router>
    </>
  )
}

export default App
