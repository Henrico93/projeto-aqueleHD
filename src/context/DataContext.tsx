"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
  addCliente: (cliente: Omit<Cliente, "id">) => Cliente
  updateCliente: (cliente: Cliente) => void
  getCliente: (id: string) => Cliente | undefined
  getClienteByNome: (nome: string) => Cliente | undefined
  addProduto: (produto: Omit<Produto, "id">) => Produto
  updateProduto: (produto: Produto) => void
  deleteProduto: (id: number) => void
  addPedido: (pedido: Omit<Pedido, "id">) => Pedido
  updatePedido: (pedido: Pedido) => void
  deletePedido: (id: number) => void
  getPedido: (id: number) => Pedido | undefined
  addItemEstoque: (item: Omit<ItemEstoque, "id">) => ItemEstoque
  updateItemEstoque: (item: ItemEstoque) => void
  deleteItemEstoque: (id: number) => void
  addVenda: (venda: Omit<Venda, "id">) => Venda
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

  // Carrega dados salvos no localStorage ao iniciar
  useEffect(() => {
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

    // Se não houver pedidos salvos, inicialize com alguns pedidos de exemplo
    if (!savedPedidos) {
      const defaultPedidos: Pedido[] = [
        {
          id: 1,
          mesa: "Mesa 1",
          cliente: "João Silva",
          itens: [
            { nome: "Hot Dog Completo", quantidade: 2, preco: 12.0 },
            { nome: "Refrigerante", quantidade: 1, preco: 6.0 },
          ],
          status: "aberto",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          valorTotal: 30.0,
        },
        {
          id: 2,
          mesa: "Mesa 3",
          cliente: "Maria Oliveira",
          itens: [
            { nome: "Hot Dog Simples", quantidade: 1, preco: 10.0 },
            { nome: "Água", quantidade: 1, preco: 4.0 },
          ],
          status: "aberto",
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
          valorTotal: 14.0,
        },
      ]
      setPedidos(defaultPedidos)
      localStorage.setItem("pedidos", JSON.stringify(defaultPedidos))
    }

    // Se não houver estoque salvo, inicialize com alguns itens padrão
    if (!savedEstoque) {
      const defaultEstoque: ItemEstoque[] = [
        {
          id: 1,
          produtoId: -1,
          nome: "Pão para Hot Dog",
          quantidade: 50,
          unidade: "unidade",
          precoUnitario: 1.5,
          categoria: "Pães",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 20,
        },
        {
          id: 2,
          produtoId: -1,
          nome: "Salsicha",
          quantidade: 40,
          unidade: "unidade",
          precoUnitario: 2.0,
          categoria: "Carnes",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 15,
        },
        {
          id: 3,
          produtoId: 5,
          nome: "Refrigerante Lata",
          quantidade: 24,
          unidade: "unidade",
          precoUnitario: 3.0,
          categoria: "Bebidas",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 12,
        },
        {
          id: 4,
          produtoId: -1,
          nome: "Batata Palito",
          quantidade: 10,
          unidade: "kg",
          precoUnitario: 8.0,
          categoria: "Acompanhamentos",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 5,
        },
        {
          id: 5,
          produtoId: -1,
          nome: "Cebola",
          quantidade: 5,
          unidade: "kg",
          precoUnitario: 3.0,
          categoria: "Vegetais",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 2,
        },
        {
          id: 6,
          produtoId: -1,
          nome: "Queijo Mussarela",
          quantidade: 3,
          unidade: "kg",
          precoUnitario: 25.0,
          categoria: "Laticínios",
          ultimaAtualizacao: new Date(),
          estoqueMinimo: 1,
        },
      ]
      setEstoque(defaultEstoque)
      localStorage.setItem("estoque", JSON.stringify(defaultEstoque))
    }
  }, [])

  // Salva dados no localStorage quando houver alterações
  useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clientes))
  }, [clientes])

  useEffect(() => {
    localStorage.setItem("produtos", JSON.stringify(produtos))
  }, [produtos])

  useEffect(() => {
    localStorage.setItem("pedidos", JSON.stringify(pedidos))
  }, [pedidos])

  useEffect(() => {
    localStorage.setItem("estoque", JSON.stringify(estoque))
  }, [estoque])

  useEffect(() => {
    localStorage.setItem("vendas", JSON.stringify(vendas))
  }, [vendas])

  // Funções para manipulação de clientes
  const addCliente = (cliente: Omit<Cliente, "id">) => {
    const id = `client_${Date.now()}`
    const novoCliente = { ...cliente, id, historicoPedidos: [] }
    setClientes([...clientes, novoCliente])
    return novoCliente
  }

  const updateCliente = (cliente: Cliente) => {
    setClientes(clientes.map((c) => (c.id === cliente.id ? cliente : c)))
  }

  const getCliente = (id: string) => {
    return clientes.find((c) => c.id === id)
  }

  const getClienteByNome = (nome: string) => {
    return clientes.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
  }

  // Funções para manipulação de produtos
  const addProduto = (produto: Omit<Produto, "id">) => {
    const id = produtos.length > 0 ? Math.max(...produtos.map((p) => p.id)) + 1 : 1
    const novoProduto = { ...produto, id }
    setProdutos([...produtos, novoProduto])
    return novoProduto
  }

  const updateProduto = (produto: Produto) => {
    setProdutos(produtos.map((p) => (p.id === produto.id ? produto : p)))
  }

  const deleteProduto = (id: number) => {
    setProdutos(produtos.filter((p) => p.id !== id))
  }

  // Funções para manipulação de pedidos
  const addPedido = (pedido: Omit<Pedido, "id">) => {
    const id = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1
    const novoPedido = { ...pedido, id }
    setPedidos([...pedidos, novoPedido])

    // Se o pedido está associado a um cliente, atualize o histórico do cliente
    if (pedido.clienteId) {
      const cliente = clientes.find((c) => c.id === pedido.clienteId)
      if (cliente) {
        const updatedCliente = {
          ...cliente,
          historicoPedidos: [...(cliente.historicoPedidos || []), id],
        }
        updateCliente(updatedCliente)
      }
    }

    return novoPedido
  }

  const updatePedido = (pedido: Pedido) => {
    setPedidos(pedidos.map((p) => (p.id === pedido.id ? pedido : p)))
  }

  const deletePedido = (id: number) => {
    setPedidos(pedidos.filter((p) => p.id !== id))
  }

  const getPedido = (id: number) => {
    return pedidos.find((p) => p.id === id)
  }

  // Funções para manipulação de estoque
  const addItemEstoque = (item: Omit<ItemEstoque, "id">) => {
    const id = estoque.length > 0 ? Math.max(...estoque.map((e) => e.id)) + 1 : 1
    const novoItem = { ...item, id }
    setEstoque([...estoque, novoItem])
    return novoItem
  }

  const updateItemEstoque = (item: ItemEstoque) => {
    setEstoque(estoque.map((e) => (e.id === item.id ? item : e)))
  }

  const deleteItemEstoque = (id: number) => {
    setEstoque(estoque.filter((e) => e.id !== id))
  }

  // Funções para manipulação de vendas
  const addVenda = (venda: Omit<Venda, "id">) => {
    const id = vendas.length > 0 ? Math.max(...vendas.map((v) => v.id)) + 1 : 1
    const novaVenda = { ...venda, id }
    setVendas([...vendas, novaVenda])
    return novaVenda
  }

  const value = {
    clientes,
    produtos,
    pedidos,
    estoque,
    vendas,
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
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
