"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

// Tipos para as entidades principais
export interface Cliente {
  id: string
  nome: string
  telefone?: string
  historicoPedidos?: number[]
}

export interface Produto {
  id: number
  nome: string
  preco: number
  imagem: string
  categoria: string
  ativo: boolean
}

export interface ItemPedido {
  produto: Produto
  quantidade: number
  observacao?: string
}

export interface ItemEstoque {
  id: number
  produtoId: number
  nome: string
  quantidade: number
  unidade: string
  precoUnitario: number
  categoria: string
  ultimaAtualizacao: Date
  estoqueMinimo: number
}

export interface Pedido {
  id: number
  clienteId?: string
  mesa: string
  cliente: string
  itens: Array<{
    nome: string
    quantidade: number
    preco: number
    observacao?: string
  }>
  status: "aberto" | "fechado" | "pago"
  formaPagamento?: "pix" | "dinheiro" | "cartao_credito" | "cartao_debito"
  timestamp: Date
  valorTotal: number
  valorRecebido?: number
  troco?: number
}

export interface Venda {
  id: number
  pedidoId: number
  valor: number
  formaPagamento: string
  data: Date
  itensVendidos: Array<{
    nome: string
    quantidade: number
    valorUnitario: number
  }>
}

interface DataContextType {
  clientes: Cliente[]
  produtos: Produto[]
  pedidos: Pedido[]
  estoque: ItemEstoque[]
  vendas: Venda[]
  loading: boolean
  error: string | null
  addCliente: (cliente: Omit<Cliente, "id">) => Promise<Cliente>
  updateCliente: (cliente: Cliente) => Promise<void>
  getCliente: (id: string) => Promise<Cliente | undefined>
  getClienteByNome: (nome: string) => Cliente | undefined
  addProduto: (produto: Omit<Produto, "id">) => Promise<Produto>
  updateProduto: (produto: Produto) => Promise<void>
  deleteProduto: (id: number) => Promise<void>
  addPedido: (pedido: Omit<Pedido, "id">) => Promise<Pedido>
  updatePedido: (pedido: Pedido) => Promise<void>
  deletePedido: (id: number) => Promise<void>
  getPedido: (id: number) => Pedido | undefined
  addItemEstoque: (item: Omit<ItemEstoque, "id">) => Promise<ItemEstoque>
  updateItemEstoque: (item: ItemEstoque) => Promise<void>
  deleteItemEstoque: (id: number) => Promise<void>
  addVenda: (venda: Omit<Venda, "id">) => Promise<Venda>
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para armazenar os dados
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [estoque, setEstoque] = useState<ItemEstoque[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar todos os dados da API
  const refreshData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Carregar clientes
      const clientesResponse = await api.get("/clientes")
      setClientes(clientesResponse.data)

      // Carregar produtos
      const produtosResponse = await api.get("/produtos")
      setProdutos(produtosResponse.data)

      // Carregar pedidos
      const pedidosResponse = await api.get("/pedidos")
      // Converter strings de data para objetos Date
      const pedidosFormatados = pedidosResponse.data.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }))
      setPedidos(pedidosFormatados)

      // Carregar estoque
      const estoqueResponse = await api.get("/estoque")
      const estoqueFormatado = estoqueResponse.data.map((e: any) => ({
        ...e,
        ultimaAtualizacao: new Date(e.ultimaAtualizacao),
      }))
      setEstoque(estoqueFormatado)

      // Carregar vendas
      const vendasResponse = await api.get("/vendas")
      const vendasFormatadas = vendasResponse.data.map((v: any) => ({
        ...v,
        data: new Date(v.data),
      }))
      setVendas(vendasFormatadas)

      setLoading(false)
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.message || "Erro ao carregar dados da API")
      setLoading(false)

      // Carregar dados de fallback do localStorage se a API falhar
      loadFromLocalStorage()
    }
  }

  // Função para carregar dados do localStorage (fallback)
  const loadFromLocalStorage = () => {
    const savedClientes = localStorage.getItem("clientes")
    const savedProdutos = localStorage.getItem("produtos")
    const savedPedidos = localStorage.getItem("pedidos")
    const savedEstoque = localStorage.getItem("estoque")
    const savedVendas = localStorage.getItem("vendas")

    if (savedClientes) setClientes(JSON.parse(savedClientes))
    if (savedProdutos) setProdutos(JSON.parse(savedProdutos))
    if (savedPedidos) {
      // Convertendo as strings de data para objetos Date
      const parsedPedidos = JSON.parse(savedPedidos)
      setPedidos(
        parsedPedidos.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        })),
      )
    }
    if (savedEstoque) {
      const parsedEstoque = JSON.parse(savedEstoque)
      setEstoque(
        parsedEstoque.map((e: any) => ({
          ...e,
          ultimaAtualizacao: new Date(e.ultimaAtualizacao),
        })),
      )
    }
    if (savedVendas) {
      const parsedVendas = JSON.parse(savedVendas)
      setVendas(
        parsedVendas.map((v: any) => ({
          ...v,
          data: new Date(v.data),
        })),
      )
    }

    // Se não houver produtos salvos, inicialize com alguns produtos padrão
    if (!savedProdutos) {
      const defaultProdutos: Produto[] = [
        {
          id: 1,
          nome: "Hot Dog Tradicional",
          preco: 12.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
        },
        {
          id: 2,
          nome: "Hot Dog Bacon",
          preco: 15.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
        },
        {
          id: 3,
          nome: "Hot Dog Frango",
          preco: 14.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
        },
        {
          id: 4,
          nome: "Hot Dog Vegetariano",
          preco: 16.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
        },
        {
          id: 5,
          nome: "Refrigerante Lata",
          preco: 6.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
        },
        {
          id: 6,
          nome: "Água Mineral",
          preco: 4.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
        },
        {
          id: 7,
          nome: "Suco Natural",
          preco: 8.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
        },
        {
          id: 8,
          nome: "Batata Frita",
          preco: 10.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Acompanhamentos",
          ativo: true,
        },
        {
          id: 9,
          nome: "Onion Rings",
          preco: 12.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Acompanhamentos",
          ativo: true,
        },
      ]
      setProdutos(defaultProdutos)
      localStorage.setItem("produtos", JSON.stringify(defaultProdutos))
    }
  }

  // Carregar dados quando o componente for montado
  useEffect(() => {
    refreshData()
  }, [])

  // Salvar dados no localStorage como backup quando houver alterações
  useEffect(() => {
    if (clientes.length > 0) localStorage.setItem("clientes", JSON.stringify(clientes))
  }, [clientes])

  useEffect(() => {
    if (produtos.length > 0) localStorage.setItem("produtos", JSON.stringify(produtos))
  }, [produtos])

  useEffect(() => {
    if (pedidos.length > 0) localStorage.setItem("pedidos", JSON.stringify(pedidos))
  }, [pedidos])

  useEffect(() => {
    if (estoque.length > 0) localStorage.setItem("estoque", JSON.stringify(estoque))
  }, [estoque])

  useEffect(() => {
    if (vendas.length > 0) localStorage.setItem("vendas", JSON.stringify(vendas))
  }, [vendas])

  // Funções para manipulação de clientes
  const addCliente = async (cliente: Omit<Cliente, "id">) => {
    try {
      const response = await api.post("/clientes", cliente)
      const novoCliente = response.data
      setClientes([...clientes, novoCliente])
      return novoCliente
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err)
      // Fallback para localStorage
      const id = `client_${Date.now()}`
      const novoCliente = { ...cliente, id, historicoPedidos: [] }
      setClientes([...clientes, novoCliente])
      return novoCliente
    }
  }

  const updateCliente = async (cliente: Cliente) => {
    try {
      await api.put(`/clientes/${cliente.id}`, cliente)
      setClientes(clientes.map((c) => (c.id === cliente.id ? cliente : c)))
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err)
      // Fallback para localStorage
      setClientes(clientes.map((c) => (c.id === cliente.id ? cliente : c)))
    }
  }

  const getCliente = async (id: string) => {
    try {
      const response = await api.get(`/clientes/${id}`)
      return response.data
    } catch (err) {
      console.error("Erro ao buscar cliente:", err)
      // Fallback para localStorage
      return clientes.find((c) => c.id === id)
    }
  }

  const getClienteByNome = (nome: string) => {
    return clientes.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
  }

  // Funções para manipulação de produtos
  const addProduto = async (produto: Omit<Produto, "id">) => {
    try {
      const response = await api.post("/produtos", produto)
      const novoProduto = response.data
      setProdutos([...produtos, novoProduto])
      return novoProduto
    } catch (err) {
      console.error("Erro ao adicionar produto:", err)
      // Fallback para localStorage
      const id = produtos.length > 0 ? Math.max(...produtos.map((p) => p.id)) + 1 : 1
      const novoProduto = { ...produto, id }
      setProdutos([...produtos, novoProduto])
      return novoProduto
    }
  }

  const updateProduto = async (produto: Produto) => {
    try {
      await api.put(`/produtos/${produto.id}`, produto)
      setProdutos(produtos.map((p) => (p.id === produto.id ? produto : p)))
    } catch (err) {
      console.error("Erro ao atualizar produto:", err)
      // Fallback para localStorage
      setProdutos(produtos.map((p) => (p.id === produto.id ? produto : p)))
    }
  }

  const deleteProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`)
      setProdutos(produtos.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Erro ao excluir produto:", err)
      // Fallback para localStorage
      setProdutos(produtos.filter((p) => p.id !== id))
    }
  }

  // Funções para manipulação de pedidos
  const addPedido = async (pedido: Omit<Pedido, "id">) => {
    try {
      const response = await api.post("/pedidos", pedido)
      const novoPedido = response.data
      setPedidos([...pedidos, novoPedido])

      // Se o pedido está associado a um cliente, atualize o histórico do cliente
      if (pedido.clienteId) {
        const cliente = clientes.find((c) => c.id === pedido.clienteId)
        if (cliente) {
          const updatedCliente = {
            ...cliente,
            historicoPedidos: [...(cliente.historicoPedidos || []), novoPedido.id],
          }
          updateCliente(updatedCliente)
        }
      }

      return novoPedido
    } catch (err) {
      console.error("Erro ao adicionar pedido:", err)
      // Fallback para localStorage
      const id = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1
      const novoPedido = { ...pedido, id }
      setPedidos([...pedidos, novoPedido])
      return novoPedido
    }
  }

  const updatePedido = async (pedido: Pedido) => {
    try {
      await api.put(`/pedidos/${pedido.id}`, pedido)
      setPedidos(pedidos.map((p) => (p.id === pedido.id ? pedido : p)))
    } catch (err) {
      console.error("Erro ao atualizar pedido:", err)
      // Fallback para localStorage
      setPedidos(pedidos.map((p) => (p.id === pedido.id ? pedido : p)))
    }
  }

  const deletePedido = async (id: number) => {
    try {
      await api.delete(`/pedidos/${id}`)
      setPedidos(pedidos.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Erro ao excluir pedido:", err)
      // Fallback para localStorage
      setPedidos(pedidos.filter((p) => p.id !== id))
    }
  }

  const getPedido = (id: number) => {
    return pedidos.find((p) => p.id === id)
  }

  // Funções para manipulação de estoque
  const addItemEstoque = async (item: Omit<ItemEstoque, "id">) => {
    try {
      const response = await api.post("/estoque", item)
      const novoItem = response.data
      setEstoque([...estoque, novoItem])
      return novoItem
    } catch (err) {
      console.error("Erro ao adicionar item ao estoque:", err)
      // Fallback para localStorage
      const id = estoque.length > 0 ? Math.max(...estoque.map((e) => e.id)) + 1 : 1
      const novoItem = { ...item, id }
      setEstoque([...estoque, novoItem])
      return novoItem
    }
  }

  const updateItemEstoque = async (item: ItemEstoque) => {
    try {
      await api.put(`/estoque/${item.id}`, item)
      setEstoque(estoque.map((e) => (e.id === item.id ? item : e)))
    } catch (err) {
      console.error("Erro ao atualizar item do estoque:", err)
      // Fallback para localStorage
      setEstoque(estoque.map((e) => (e.id === item.id ? item : e)))
    }
  }

  const deleteItemEstoque = async (id: number) => {
    try {
      await api.delete(`/estoque/${id}`)
      setEstoque(estoque.filter((e) => e.id !== id))
    } catch (err) {
      console.error("Erro ao excluir item do estoque:", err)
      // Fallback para localStorage
      setEstoque(estoque.filter((e) => e.id !== id))
    }
  }

  // Funções para manipulação de vendas
  const addVenda = async (venda: Omit<Venda, "id">) => {
    try {
      const response = await api.post("/vendas", venda)
      const novaVenda = response.data
      setVendas([...vendas, novaVenda])
      return novaVenda
    } catch (err) {
      console.error("Erro ao adicionar venda:", err)
      // Fallback para localStorage
      const id = vendas.length > 0 ? Math.max(...vendas.map((v) => v.id)) + 1 : 1
      const novaVenda = { ...venda, id }
      setVendas([...vendas, novaVenda])
      return novaVenda
    }
  }

  const value = {
    clientes,
    produtos,
    pedidos,
    estoque,
    vendas,
    loading,
    error,
    addCliente,
    updateCliente,
    getCliente,
    getClienteByNome,
    addProduto,
    updateProduto,
    deleteProduto,
    addPedido,
    updatePedido,
    deletePedido,
    getPedido,
    addItemEstoque,
    updateItemEstoque,
    deleteItemEstoque,
    addVenda,
    refreshData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
