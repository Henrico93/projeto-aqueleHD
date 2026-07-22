"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import api from "../services/api"
import { useToast } from "@chakra-ui/react"

export interface Cliente {
  id: string
  nome: string
  telefone?: string
  historicoPedidos?: number[]
}

export interface Usuario {
  id: string
  nome: string
  email: string
  senha?: string
  role: "admin" | "funcionario"
  permissoes: string[]
  criadoEm: Date
}

// Atualize a interface Produto para incluir itensEstoque e personalização
export interface Produto {
  id: number
  nome: string
  preco: number
  imagem: string
  categoria: string
  ativo: boolean
  itensEstoque?: Array<{
    itemId: number
    quantidade: number
  }>
  // Campos de personalização por produto
  personalizacaoAtiva?: boolean
  opcoesAdicionais?: { nome: string; preco: number }[]
  opcoesRemover?: string[]
}

export interface ItemPedido {
  produto: Produto
  quantidade: number
  observacao?: string
  adicionais?: { nome: string; preco: number }[]
  removidos?: string[]
}

export interface ItemEstoque {
  id: number
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
    preco: number           // Preço unitário total (base + adicionais)
    precoBase?: number      // Preço base sem adicionais
    observacao?: string
    adicionais?: { nome: string; preco: number }[]
    removidos?: string[]
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
    adicionais?: { nome: string; preco: number }[]
    removidos?: string[]
  }>
}

// Interface para armazenar as relações produto-estoque localmente
export interface ProdutoEstoqueRelacao {
  produtoId: number
  itemId: number
  quantidade: number
}

export interface LogEstoque {
  id?: number
  itemId: number
  itemNome: string
  tipo: "entrada" | "saida" | "ajuste" | "venda"
  quantidade: number
  quantidadeAnterior: number
  quantidadeNova: number
  motivo: string
  usuarioId?: string
  usuarioNome?: string
  dataHora: Date
}

interface DataContextType {
  clientes: Cliente[]
  produtos: Produto[]
  pedidos: Pedido[]
  estoque: ItemEstoque[]
  vendas: Venda[]
  usuarios: Usuario[]
  currentUser: Usuario | null
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
  atualizarEstoqueAposVenda: (
    itensVendidos: Array<{ nome: string; quantidade: number; valorUnitario: number }>,
  ) => Promise<void>
  registrarLogEstoque: (log: Omit<LogEstoque, "id">) => Promise<void>
  associarItemEstoqueProduto: (produtoId: number, itemId: number, quantidade: number) => Promise<Produto>
  desassociarItemEstoqueProduto: (produtoId: number, itemId: number) => Promise<Produto>
  atualizarQuantidadeItemEstoqueProduto: (produtoId: number, itemId: number, quantidade: number) => Promise<Produto>
  getItensEstoqueProduto: (produtoId: number) => Array<{ itemId: number; quantidade: number }>
  getItensEstoqueDisponiveis: () => ItemEstoque[]
  getProdutoComItensEstoque: (produtoId: number) => Produto | undefined
  login: (email: string, senha?: string) => Promise<boolean>
  logout: () => void
  addUsuario: (usuario: Omit<Usuario, "id" | "criadoEm">) => Promise<Usuario>
  updateUsuario: (usuario: Usuario) => Promise<void>
  deleteUsuario: (id: string) => Promise<void>
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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [estoque, setEstoque] = useState<ItemEstoque[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [relacoesEstoque, setRelacoesEstoque] = useState<ProdutoEstoqueRelacao[]>([])
  const socketRef = useRef<Socket | null>(null)
  const toast = useToast()

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
      console.log("Produtos carregados da API:", produtosResponse.data)

      // Carregar as relações do localStorage
      const savedRelacoes = localStorage.getItem("produtoEstoqueRelacoes")
      const relacoes = savedRelacoes ? JSON.parse(savedRelacoes) : []
      setRelacoesEstoque(relacoes)

      // Adicionar as relações aos produtos
      const produtosComRelacoes = produtosResponse.data.map((produto: Produto) => {
        const relacoesDosProduto = relacoes.filter((rel: ProdutoEstoqueRelacao) => rel.produtoId === produto.id)
        return {
          ...produto,
          itensEstoque: relacoesDosProduto.map((rel: ProdutoEstoqueRelacao) => ({
            itemId: rel.itemId,
            quantidade: rel.quantidade,
          })),
        }
      })

      setProdutos(produtosComRelacoes)
      console.log("Produtos com relações:", produtosComRelacoes)

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

      // Carregar usuários
      const usuariosResponse = await api.get("/usuarios")
      const usuariosFormatados = usuariosResponse.data.map((u: any) => ({
        ...u,
        criadoEm: new Date(u.criadoEm),
      }))
      setUsuarios(usuariosFormatados)

      setLoading(false)
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      // 401 é tratado pelo interceptor (redireciona pro login), não mostrar overlay de erro
      if (err.response?.status !== 401) {
        setError(err.message || "Erro ao carregar dados da API")
      }
      setLoading(false)

      // Carregar dados de fallback do localStorage se a API falhar
      loadFromLocalStorage()
    }
  }

  const loadFromLocalStorage = () => {
    const savedClientes = localStorage.getItem("clientes")
    const savedProdutos = localStorage.getItem("produtos")
    const savedPedidos = localStorage.getItem("pedidos")
    const savedEstoque = localStorage.getItem("estoque")
    const savedVendas = localStorage.getItem("vendas")
    const savedRelacoes = localStorage.getItem("produtoEstoqueRelacoes")
    const savedUsuarios = localStorage.getItem("usuarios")
    const savedCurrentUser = localStorage.getItem("currentUser")

    if (savedUsuarios) {
      setUsuarios(JSON.parse(savedUsuarios).map((u: any) => ({...u, criadoEm: new Date(u.criadoEm)})))
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser))
    }

    if (savedClientes) setClientes(JSON.parse(savedClientes))

    if (savedProdutos) {
      const parsedProdutos = JSON.parse(savedProdutos)

      // Adicionar as relações aos produtos
      if (savedRelacoes) {
        const relacoes = JSON.parse(savedRelacoes)
        setRelacoesEstoque(relacoes)

        const produtosComRelacoes = parsedProdutos.map((produto: Produto) => {
          const relacoesDosProduto = relacoes.filter((rel: ProdutoEstoqueRelacao) => rel.produtoId === produto.id)
          return {
            ...produto,
            itensEstoque: relacoesDosProduto.map((rel: ProdutoEstoqueRelacao) => ({
              itemId: rel.itemId,
              quantidade: rel.quantidade,
            })),
          }
        })

        setProdutos(produtosComRelacoes)
      } else {
        setProdutos(parsedProdutos)
      }
    }

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
          itensEstoque: [],
        },
        {
          id: 2,
          nome: "Hot Dog Bacon",
          preco: 15.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 3,
          nome: "Hot Dog Frango",
          preco: 14.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 4,
          nome: "Hot Dog Vegetariano",
          preco: 16.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Hot Dogs",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 5,
          nome: "Refrigerante Lata",
          preco: 6.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 6,
          nome: "Água Mineral",
          preco: 4.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 7,
          nome: "Suco Natural",
          preco: 8.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Bebidas",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 8,
          nome: "Batata Frita",
          preco: 10.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Acompanhamentos",
          ativo: true,
          itensEstoque: [],
        },
        {
          id: 9,
          nome: "Onion Rings",
          preco: 12.0,
          imagem: "/placeholder.svg?height=100&width=100",
          categoria: "Acompanhamentos",
          ativo: true,
          itensEstoque: [],
        },
      ]
      setProdutos(defaultProdutos)
      localStorage.setItem("produtos", JSON.stringify(defaultProdutos))
    }
  }

  // Salvar relações no localStorage quando houver alterações
  useEffect(() => {
    if (relacoesEstoque.length > 0) {
      localStorage.setItem("produtoEstoqueRelacoes", JSON.stringify(relacoesEstoque))
    }
  }, [relacoesEstoque])

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)) } catch {}
    }
    const token = localStorage.getItem("authToken")
    if (token && token !== "undefined") {
      refreshData()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || token === "undefined") return

    const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
      auth: { token },
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 5000,
    })
    socketRef.current = socket

    socket.on("connect_error", () => {
      // socket indisponível (backend antigo ou offline) — silencioso
    })

    socket.on("pedido:novo", (novoPedido: any) => {
      const formatado = { ...novoPedido, timestamp: new Date(novoPedido.timestamp) }
      setPedidos((prev) => {
        if (prev.find((p) => p.id === formatado.id)) return prev
        return [...prev, formatado]
      })
    })

    socket.on("pedido:atualizado", (pedidoAtualizado: any) => {
      const formatado = { ...pedidoAtualizado, timestamp: new Date(pedidoAtualizado.timestamp) }
      setPedidos((prev) => prev.map((p) => (p.id === formatado.id ? formatado : p)))
    })

    socket.on("pedido:removido", ({ id }: { id: number }) => {
      setPedidos((prev) => prev.filter((p) => p.id !== id))
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUser])

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
  // Função para adicionar produto
  const addProduto = async (produto: Omit<Produto, "id">) => {
    try {
      // Separar itensEstoque (gerenciado localmente) dos outros campos
      const { itensEstoque, ...produtoParaBackend } = produto as any
      // Garantir que os campos de personalização sejam enviados
      const produtoPayload = {
        ...produtoParaBackend,
        personalizacaoAtiva: produto.personalizacaoAtiva || false,
        opcoesAdicionais: produto.opcoesAdicionais || [],
        opcoesRemover: produto.opcoesRemover || [],
      }

      console.log("Enviando novo produto para o backend:", JSON.stringify(produtoPayload, null, 2))

      const response = await api.post("/produtos", produtoPayload)
      const novoProduto = response.data
      console.log("Produto recebido do backend após criação:", novoProduto)

      // Restaurar campos frontend-only
      const produtoCompleto = {
        ...novoProduto,
        itensEstoque: produto.itensEstoque || [],
        personalizacaoAtiva: produto.personalizacaoAtiva || false,
        opcoesAdicionais: produto.opcoesAdicionais || [],
        opcoesRemover: produto.opcoesRemover || [],
      }

      setProdutos([...produtos, produtoCompleto])
      return produtoCompleto
    } catch (err) {
      console.error("Erro ao adicionar produto:", err)
      // Fallback para localStorage
      const id = produtos.length > 0 ? Math.max(...produtos.map((p) => p.id)) + 1 : 1
      const novoProduto = {
        ...produto,
        id,
        itensEstoque: produto.itensEstoque || [],
        personalizacaoAtiva: produto.personalizacaoAtiva || false,
        opcoesAdicionais: produto.opcoesAdicionais || [],
        opcoesRemover: produto.opcoesRemover || [],
      }
      setProdutos([...produtos, novoProduto])
      return novoProduto
    }
  }

  // Função para atualizar produto
  const updateProduto = async (produto: Produto) => {
    try {
      // Separar itensEstoque (gerenciado localmente) dos outros campos
      const { itensEstoque, ...produtoParaBackend } = produto as any
      // Garantir que os campos de personalização sejam enviados
      const produtoPayload = {
        ...produtoParaBackend,
        personalizacaoAtiva: produto.personalizacaoAtiva || false,
        opcoesAdicionais: produto.opcoesAdicionais || [],
        opcoesRemover: produto.opcoesRemover || [],
      }

      console.log("Enviando produto atualizado para o backend:", JSON.stringify(produtoPayload, null, 2))

      const response = await api.put(`/produtos/${produto.id}`, produtoPayload)
      const produtoAtualizado = response.data
      console.log("Produto recebido do backend após atualização:", produtoAtualizado)

      // Restaurar todos os campos frontend-only
      const produtoCompleto = {
        ...produtoAtualizado,
        itensEstoque: produto.itensEstoque || [],
        personalizacaoAtiva: produto.personalizacaoAtiva || false,
        opcoesAdicionais: produto.opcoesAdicionais || [],
        opcoesRemover: produto.opcoesRemover || [],
      }

      setProdutos(produtos.map((p) => (p.id === produto.id ? produtoCompleto : p)))
    } catch (err) {
      console.error("Erro ao atualizar produto:", err)
      // Fallback para localStorage — preservar tudo localmente
      setProdutos(produtos.map((p) => (p.id === produto.id ? produto : p)))
    }
  }

  const deleteProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`)
      setProdutos(produtos.filter((p) => p.id !== id))

      // Remover todas as relações deste produto
      setRelacoesEstoque(relacoesEstoque.filter((rel) => rel.produtoId !== id))
    } catch (err) {
      console.error("Erro ao excluir produto:", err)
      // Fallback para localStorage
      setProdutos(produtos.filter((p) => p.id !== id))

      // Remover todas as relações deste produto
      setRelacoesEstoque(relacoesEstoque.filter((rel) => rel.produtoId !== id))
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

      // Remover todas as relações deste item
      setRelacoesEstoque(relacoesEstoque.filter((rel) => rel.itemId !== id))

      // Atualizar produtos que usam este item
      const produtosAtualizados = produtos.map((produto) => {
        if (produto.itensEstoque && produto.itensEstoque.some((item) => item.itemId === id)) {
          return {
            ...produto,
            itensEstoque: produto.itensEstoque.filter((item) => item.itemId !== id),
          }
        }
        return produto
      })

      setProdutos(produtosAtualizados)
    } catch (err) {
      console.error("Erro ao excluir item do estoque:", err)
      // Fallback para localStorage
      setEstoque(estoque.filter((e) => e.id !== id))

      // Remover todas as relações deste item
      setRelacoesEstoque(relacoesEstoque.filter((rel) => rel.itemId !== id))

      // Atualizar produtos que usam este item
      const produtosAtualizados = produtos.map((produto) => {
        if (produto.itensEstoque && produto.itensEstoque.some((item) => item.itemId === id)) {
          return {
            ...produto,
            itensEstoque: produto.itensEstoque.filter((item) => item.itemId !== id),
          }
        }
        return produto
      })

      setProdutos(produtosAtualizados)
    }
  }

  // Função para obter um produto com seus itens de estoque
  const getProdutoComItensEstoque = (produtoId: number) => {
    const produto = produtos.find((p) => p.id === produtoId)
    if (!produto) return undefined

    // Garantir que o produto tenha o array itensEstoque
    const relacoesDosProduto = relacoesEstoque.filter((rel) => rel.produtoId === produtoId)

    return {
      ...produto,
      itensEstoque: relacoesDosProduto.map((rel) => ({
        itemId: rel.itemId,
        quantidade: rel.quantidade,
      })),
    }
  }

  // Novas funções para gerenciar a relação entre produtos e itens de estoque
  const associarItemEstoqueProduto = async (produtoId: number, itemId: number, quantidade: number) => {
    try {
      // Encontrar o produto
      const produto = produtos.find((p) => p.id === produtoId)
      if (!produto) {
        throw new Error("Produto não encontrado")
      }

      // Verificar se o item de estoque existe
      const itemEstoque = estoque.find((item) => item.id === itemId)
      if (!itemEstoque) {
        throw new Error("Item de estoque não encontrado")
      }

      // Verificar se o item já está associado ao produto
      const relacaoExistente = relacoesEstoque.find((rel) => rel.produtoId === produtoId && rel.itemId === itemId)

      if (relacaoExistente) {
        throw new Error("Este item já está associado a este produto")
      }

      // Adicionar a relação localmente
      const novaRelacao: ProdutoEstoqueRelacao = {
        produtoId,
        itemId,
        quantidade,
      }

      setRelacoesEstoque([...relacoesEstoque, novaRelacao])

      // Atualizar o produto no estado local
      const produtoAtualizado = {
        ...produto,
        itensEstoque: [...(produto.itensEstoque || []), { itemId, quantidade }],
      }

      setProdutos(produtos.map((p) => (p.id === produtoId ? produtoAtualizado : p)))

      // Tentar atualizar no backend (mesmo que não funcione, temos o backup local)
      try {
        await api.put(`/produtos/${produtoId}`, produto)
      } catch (err) {
        console.log("Erro ao atualizar produto no backend, mas a relação foi salva localmente:", err)
      }

      return produtoAtualizado
    } catch (err) {
      console.error("Erro ao associar item de estoque ao produto:", err)
      throw err
    }
  }

  const desassociarItemEstoqueProduto = async (produtoId: number, itemId: number) => {
    try {
      // Encontrar o produto
      const produto = produtos.find((p) => p.id === produtoId)
      if (!produto) {
        throw new Error("Produto não encontrado")
      }

      // Verificar se o item está associado ao produto
      const relacaoExistente = relacoesEstoque.find((rel) => rel.produtoId === produtoId && rel.itemId === itemId)

      if (!relacaoExistente) {
        throw new Error("Este item não está associado a este produto")
      }

      // Remover a relação localmente
      setRelacoesEstoque(relacoesEstoque.filter((rel) => !(rel.produtoId === produtoId && rel.itemId === itemId)))

      // Atualizar o produto no estado local
      const produtoAtualizado = {
        ...produto,
        itensEstoque: (produto.itensEstoque || []).filter((item) => item.itemId !== itemId),
      }

      setProdutos(produtos.map((p) => (p.id === produtoId ? produtoAtualizado : p)))

      // Tentar atualizar no backend (mesmo que não funcione, temos o backup local)
      try {
        await api.put(`/produtos/${produtoId}`, produto)
      } catch (err) {
        console.log("Erro ao atualizar produto no backend, mas a relação foi removida localmente:", err)
      }

      return produtoAtualizado
    } catch (err) {
      console.error("Erro ao desassociar item de estoque do produto:", err)
      throw err
    }
  }

  const atualizarQuantidadeItemEstoqueProduto = async (produtoId: number, itemId: number, quantidade: number) => {
    try {
      // Encontrar o produto
      const produto = produtos.find((p) => p.id === produtoId)
      if (!produto) {
        throw new Error("Produto não encontrado")
      }

      // Verificar se o item está associado ao produto
      const relacaoExistente = relacoesEstoque.find((rel) => rel.produtoId === produtoId && rel.itemId === itemId)

      if (!relacaoExistente) {
        throw new Error("Este item não está associado a este produto")
      }

      // Atualizar a relação localmente
      setRelacoesEstoque(
        relacoesEstoque.map((rel) => {
          if (rel.produtoId === produtoId && rel.itemId === itemId) {
            return { ...rel, quantidade }
          }
          return rel
        }),
      )

      // Atualizar o produto no estado local
      const produtoAtualizado = {
        ...produto,
        itensEstoque: (produto.itensEstoque || []).map((item) => {
          if (item.itemId === itemId) {
            return { ...item, quantidade }
          }
          return item
        }),
      }

      setProdutos(produtos.map((p) => (p.id === produtoId ? produtoAtualizado : p)))

      // Tentar atualizar no backend (mesmo que não funcione, temos o backup local)
      try {
        await api.put(`/produtos/${produtoId}`, produto)
      } catch (err) {
        console.log("Erro ao atualizar produto no backend, mas a quantidade foi atualizada localmente:", err)
      }

      return produtoAtualizado
    } catch (err) {
      console.error("Erro ao atualizar quantidade do item de estoque no produto:", err)
      throw err
    }
  }

  const getItensEstoqueProduto = (produtoId: number) => {
    // Buscar as relações do produto
    const relacoesDosProduto = relacoesEstoque.filter((rel) => rel.produtoId === produtoId)

    return relacoesDosProduto.map((rel) => ({
      itemId: rel.itemId,
      quantidade: rel.quantidade,
    }))
  }

  const getItensEstoqueDisponiveis = () => {
    return estoque
  }

  // Função para atualizar o estoque após uma venda
  const atualizarEstoqueAposVenda = async (
    itensVendidos: Array<{ nome: string; quantidade: number; valorUnitario: number; adicionais?: { nome: string; preco: number }[]; removidos?: string[] }>,
  ) => {
    try {
      // Mapa de deduções acumuladas: itemId -> quantidade total a descontar
      // Isso evita o problema de closure desatualizado ao somar receita + adicionais do mesmo item
      const deducoes = new Map<number, number>()

      for (const itemVendido of itensVendidos) {
        console.log(`Calculando deduções para: ${itemVendido.nome} (${itemVendido.quantidade}x)`)

        // --- 1. Receita base do produto (exceto removidos) ---
        const produto = produtos.find((p) => p.nome === itemVendido.nome)
        if (produto) {
          const relacoesDosProduto = relacoesEstoque.filter((rel) => rel.produtoId === produto.id)
          for (const relacao of relacoesDosProduto) {
            const itemEstoque = estoque.find((item) => item.id === relacao.itemId)
            if (!itemEstoque) continue

            const foiRemovido = (itemVendido.removidos || []).includes(itemEstoque.nome)
            if (foiRemovido) {
              console.log(`[Removido] Sem desconto de "${itemEstoque.nome}"`)
              continue
            }

            const qtd = itemVendido.quantidade * relacao.quantidade
            deducoes.set(itemEstoque.id, (deducoes.get(itemEstoque.id) || 0) + qtd)
            console.log(`[Receita] +${qtd}x "${itemEstoque.nome}" → acumulado: ${(deducoes.get(itemEstoque.id) || 0)}`)
          }
        }

        // --- 2. Adicionais pedidos pelo cliente ---
        if (itemVendido.adicionais && itemVendido.adicionais.length > 0) {
          for (const adicional of itemVendido.adicionais) {
            // Busca case-insensitive para evitar problemas de capitalização
            const itemEstoque = estoque.find(
              (item) => item.nome.toLowerCase().trim() === adicional.nome.toLowerCase().trim()
            )
            if (!itemEstoque) {
              console.log(`[Adicional] Item não encontrado no estoque: "${adicional.nome}"`)
              continue
            }
            const qtd = itemVendido.quantidade * 1
            deducoes.set(itemEstoque.id, (deducoes.get(itemEstoque.id) || 0) + qtd)
            console.log(`[Adicional] +${qtd}x "${itemEstoque.nome}" → acumulado: ${deducoes.get(itemEstoque.id)}`)
          }
        }
      }

      // Aplicar todas as deduções de uma vez com os valores CORRETOS do estoque atual
      for (const [itemId, quantidadeDescontar] of deducoes.entries()) {
        const itemEstoque = estoque.find((item) => item.id === itemId)
        if (!itemEstoque) continue

        const novaQuantidade = Math.max(0, itemEstoque.quantidade - quantidadeDescontar)
        console.log(`[Aplicando] "${itemEstoque.nome}": ${itemEstoque.quantidade} → ${novaQuantidade} (-${quantidadeDescontar})`)

        const itemAtualizado = { ...itemEstoque, quantidade: novaQuantidade, ultimaAtualizacao: new Date() }
        await api.put(`/estoque/${itemEstoque.id}`, itemAtualizado).catch(() => {})
        await updateItemEstoque(itemAtualizado)

        if (novaQuantidade <= itemEstoque.estoqueMinimo && itemEstoque.quantidade > itemEstoque.estoqueMinimo) {
          toast({
            title: "Alerta de Estoque",
            description: `O item "${itemEstoque.nome}" está abaixo do nível mínimo (${itemEstoque.estoqueMinimo})`,
            status: "warning",
            duration: 5000,
            isClosable: true,
          })
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar estoque após venda:", err)
    }
  }

  // Funções para manipulação de vendas
  const addVenda = async (venda: Omit<Venda, "id">) => {
    try {
      const response = await api.post("/vendas", venda)
      const novaVenda = response.data

      // Atualizar o estoque com base nos itens vendidos (receita + adicionais)
      if (venda.itensVendidos && venda.itensVendidos.length > 0) {
        await atualizarEstoqueAposVenda(venda.itensVendidos)
      }

      setVendas([...vendas, novaVenda])
      return novaVenda
    } catch (err) {
      console.error("Erro ao adicionar venda:", err)
      // Fallback para localStorage
      const id = vendas.length > 0 ? Math.max(...vendas.map((v) => v.id)) + 1 : 1
      const novaVenda = { ...venda, id }
      setVendas([...vendas, novaVenda])
      // Também atualiza o estoque mesmo no fallback
      if (venda.itensVendidos && venda.itensVendidos.length > 0) {
        await atualizarEstoqueAposVenda(venda.itensVendidos)
      }
      return novaVenda
    }
  }

  const registrarLogEstoque = async (log: Omit<LogEstoque, "id">) => {
    try {
      await api.post("/logs-estoque", log)
    } catch {
      // log de auditoria é best-effort; não bloqueia o fluxo principal
    }
  }

  // --- Funções de Autenticação e Gestão de Usuários ---
  const login = async (email: string, senha?: string) => {
    try {
      const response = await api.post("/usuarios/login", { email, senha });
      const data = response.data;

      // Suporta resposta nova { token, user } e resposta legada (objeto direto)
      const token: string | undefined = data.token;
      const user = data.user ?? data;

      if (token) {
        localStorage.setItem("authToken", token);
      }
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      await refreshData();
      return true;
    } catch (err) {
      console.error("Falha ao logar:", err);
      return false;
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    socketRef.current?.disconnect()
    socketRef.current = null
  }

  const addUsuario = async (usuario: Omit<Usuario, "id" | "criadoEm">) => {
    try {
      const response = await api.post("/usuarios", usuario);
      const novoUsuario = { ...response.data, criadoEm: new Date(response.data.criadoEm) };
      setUsuarios([...usuarios, novoUsuario]);
      return novoUsuario;
    } catch (err) {
      console.error("Erro ao adicionar usuario fallback localStorage:", err);
      const novoUsuario: Usuario = { ...usuario, id: `user_${Date.now()}`, criadoEm: new Date() }
      const updatedUsers = [...usuarios, novoUsuario]
      setUsuarios(updatedUsers)
      localStorage.setItem("usuarios", JSON.stringify(updatedUsers))
      return novoUsuario
    }
  }

  const updateUsuario = async (usuario: Usuario) => {
    try {
      await api.put(`/usuarios/${usuario.id}`, usuario);
      const updatedUsers = usuarios.map(u => u.id === usuario.id ? usuario : u)
      setUsuarios(updatedUsers)
      if (currentUser?.id === usuario.id) {
        setCurrentUser(usuario)
        localStorage.setItem("currentUser", JSON.stringify(usuario))
      }
    } catch (err) {
      console.error("Erro ao atualizar usuario fallback localStorage:", err);
      const updatedUsers = usuarios.map(u => u.id === usuario.id ? usuario : u)
      setUsuarios(updatedUsers)
      localStorage.setItem("usuarios", JSON.stringify(updatedUsers))
      if (currentUser?.id === usuario.id) {
        setCurrentUser(usuario)
        localStorage.setItem("currentUser", JSON.stringify(usuario))
      }
    }
  }

  const deleteUsuario = async (id: string) => {
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter(u => u.id !== id))
      if (currentUser?.id === id) {
        logout()
      }
    } catch (err) {
      console.error("Erro ao deletar usuario fallback localStorage:", err);
      const updatedUsers = usuarios.filter(u => u.id !== id)
      setUsuarios(updatedUsers)
      localStorage.setItem("usuarios", JSON.stringify(updatedUsers))
      if (currentUser?.id === id) {
        logout()
      }
    }
  }

  const value = {
    clientes,
    produtos,
    pedidos,
    estoque,
    vendas,
    usuarios,
    currentUser,
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
    atualizarEstoqueAposVenda,
    registrarLogEstoque,
    associarItemEstoqueProduto,
    desassociarItemEstoqueProduto,
    atualizarQuantidadeItemEstoqueProduto,
    getItensEstoqueProduto,
    getItensEstoqueDisponiveis,
    getProdutoComItensEstoque,
    login,
    logout,
    addUsuario,
    updateUsuario,
    deleteUsuario,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
