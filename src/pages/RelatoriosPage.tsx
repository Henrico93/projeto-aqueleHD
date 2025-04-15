"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Heading,
  Flex,
  Button,
  Select,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  VStack,
  HStack,
  Circle,
} from "@chakra-ui/react"
import { useData } from "../context/DataContext"

// Interface para os dados de faturamento
interface DadosFaturamento {
  totalVendas: number
  valorTotal: number
  ticketMedio: number
  formaPagamento: {
    [key: string]: number
  }
  produtosMaisVendidos: Array<{
    nome: string
    quantidade: number
    valor: number
  }>
}

const RelatoriosPage = () => {
  const { vendas, pedidos } = useData()
  const [periodoSelecionado, setPeriodoSelecionado] = useState<"hoje" | "semana" | "mes" | "total">("semana")
  const [dadosFaturamento, setDadosFaturamento] = useState<DadosFaturamento>({
    totalVendas: 0,
    valorTotal: 0,
    ticketMedio: 0,
    formaPagamento: {},
    produtosMaisVendidos: [],
  })
  const [dadosDiarios, setDadosDiarios] = useState<{
    labels: string[]
    valores: number[]
  }>({ labels: [], valores: [] })

  const formatarData = (data: Date): string => {
    const dataObj = new Date(data)
    return dataObj.toLocaleDateString("pt-BR")
  }

  const formatarValor = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Calcular faturamento com base no período selecionado
  useEffect(() => {
    if (vendas.length === 0) return

    // Filtrar vendas por período
    const dataAtual = new Date()
    const inicioHoje = new Date(dataAtual.setHours(0, 0, 0, 0))

    const vendasFiltradas = vendas.filter((venda) => {
      const dataVenda = new Date(venda.data)

      switch (periodoSelecionado) {
        case "hoje":
          return dataVenda >= inicioHoje
        case "semana": {
          const inicioSemana = new Date(dataAtual)
          inicioSemana.setDate(dataAtual.getDate() - 7)
          return dataVenda >= inicioSemana
        }
        case "mes": {
          const inicioMes = new Date(dataAtual)
          inicioMes.setDate(dataAtual.getDate() - 30)
          return dataVenda >= inicioMes
        }
        default:
          return true
      }
    })

    // Calcular dados gerais
    const totalVendas = vendasFiltradas.length
    const valorTotal = vendasFiltradas.reduce((sum, venda) => sum + venda.valor, 0)
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

    // Calcular formas de pagamento
    const formaPagamento: { [key: string]: number } = {}
    vendasFiltradas.forEach((venda) => {
      if (formaPagamento[venda.formaPagamento]) {
        formaPagamento[venda.formaPagamento] += venda.valor
      } else {
        formaPagamento[venda.formaPagamento] = venda.valor
      }
    })

    // Produtos mais vendidos
    const produtosMap = new Map<string, { quantidade: number; valor: number }>()

    vendasFiltradas.forEach((venda) => {
      venda.itensVendidos.forEach((item) => {
        const chave = item.nome
        if (produtosMap.has(chave)) {
          const atual = produtosMap.get(chave)!
          produtosMap.set(chave, {
            quantidade: atual.quantidade + item.quantidade,
            valor: atual.valor + item.valorUnitario * item.quantidade,
          })
        } else {
          produtosMap.set(chave, {
            quantidade: item.quantidade,
            valor: item.valorUnitario * item.quantidade,
          })
        }
      })
    })

    const produtosMaisVendidos = Array.from(produtosMap.entries())
      .map(([nome, { quantidade, valor }]) => ({ nome, quantidade, valor }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    setDadosFaturamento({
      totalVendas,
      valorTotal,
      ticketMedio,
      formaPagamento,
      produtosMaisVendidos,
    })

    // Gerar dados para gráfico diário
    if (periodoSelecionado === "semana" || periodoSelecionado === "mes") {
      const diasPeriodo = periodoSelecionado === "semana" ? 7 : 30
      const labels: string[] = []
      const valores: number[] = []

      for (let i = 0; i < diasPeriodo; i++) {
        const data = new Date()
        data.setDate(data.getDate() - i)
        data.setHours(0, 0, 0, 0)

        const dataStr = formatarData(data)
        labels.unshift(dataStr) // Adiciona no início para manter ordem cronológica

        // Calcular valor vendido neste dia
        const valorDia = vendasFiltradas
          .filter((venda) => {
            const vendaData = new Date(venda.data)
            vendaData.setHours(0, 0, 0, 0)
            return vendaData.getTime() === data.getTime()
          })
          .reduce((sum, venda) => sum + venda.valor, 0)

        valores.unshift(valorDia)
      }

      setDadosDiarios({ labels, valores })
    }
  }, [periodoSelecionado, vendas])

  // Cores para os gráficos
  const chartColors = [
    "#C25B02", // Laranja escuro (cor primária)
    "#E6B325", // Amarelo (cor secundária)
    "#FFD700", // Dourado (cor de acento)
    "#F3A505", // Laranja médio
    "#D47B00", // Laranja acastanhado
    "#F9CB40", // Amarelo claro
    "#DAA520", // Goldenrod
    "#B8860B", // Dourado escuro
    "#FFA500", // Laranja
    "#FF8C00", // Laranja escuro
  ]

  // Encontrar o valor máximo para normalizar os gráficos
  const maxValorDiario = Math.max(...dadosDiarios.valores, 1)
  const maxQuantidadeProduto =
    dadosFaturamento.produtosMaisVendidos.length > 0
      ? Math.max(...dadosFaturamento.produtosMaisVendidos.map((p) => p.quantidade), 1)
      : 1

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Button
          bg="#C25B02"
          color="white"
          size="md"
          borderRadius="full"
          px={6}
          py={2}
          fontWeight="normal"
          fontSize="md"
          _hover={{ bg: "#B24A01" }}
        >
          Relatório de Vendas
        </Button>

        <Select
          bg="black"
          color="white"
          borderColor="whiteAlpha.300"
          value={periodoSelecionado}
          onChange={(e) => setPeriodoSelecionado(e.target.value as any)}
          maxW="200px"
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Últimos 7 dias</option>
          <option value="mes">Últimos 30 dias</option>
          <option value="total">Todo o período</option>
        </Select>
      </Flex>

      {/* Cards com informações gerais */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
        <GridItem>
          <Box bg="black" p={4} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Total de Vendas</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {dadosFaturamento.totalVendas}
              </StatNumber>
              <StatHelpText color="white">
                {periodoSelecionado === "hoje" && "Hoje"}
                {periodoSelecionado === "semana" && "Nos últimos 7 dias"}
                {periodoSelecionado === "mes" && "Nos últimos 30 dias"}
                {periodoSelecionado === "total" && "Todo o período"}
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={4} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Faturamento</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {formatarValor(dadosFaturamento.valorTotal)}
              </StatNumber>
              <StatHelpText color="white">Ticket médio: {formatarValor(dadosFaturamento.ticketMedio)}</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={4} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Método Mais Usado</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {Object.entries(dadosFaturamento.formaPagamento).sort((a, b) => b[1] - a[1])[0]?.[0] === "pix"
                  ? "PIX"
                  : Object.entries(dadosFaturamento.formaPagamento).sort((a, b) => b[1] - a[1])[0]?.[0] === "dinheiro"
                    ? "Dinheiro"
                    : Object.entries(dadosFaturamento.formaPagamento).sort((a, b) => b[1] - a[1])[0]?.[0] ===
                        "cartao_credito"
                      ? "Crédito"
                      : Object.entries(dadosFaturamento.formaPagamento).sort((a, b) => b[1] - a[1])[0]?.[0] ===
                          "cartao_debito"
                        ? "Débito"
                        : "N/A"}
              </StatNumber>
              <StatHelpText color="white">
                {formatarValor(
                  Object.entries(dadosFaturamento.formaPagamento).sort((a, b) => b[1] - a[1])[0]?.[1] || 0,
                )}
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
      </Grid>

      <Tabs variant="enclosed" colorScheme="yellow" bg="#E6B325" borderRadius="md">
        <TabList>
          <Tab _selected={{ bg: "#C25B02", color: "white" }}>Visão Geral</Tab>
          <Tab _selected={{ bg: "#C25B02", color: "white" }}>Produtos</Tab>
          <Tab _selected={{ bg: "#C25B02", color: "white" }}>Vendas</Tab>
        </TabList>

        <TabPanels bg="black" borderBottomRadius="md">
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6}>
              {/* Gráfico de Vendas por Dia (simplificado) */}
              <GridItem>
                <Box bg="whiteAlpha.100" p={4} borderRadius="md" height="100%">
                  <Heading size="md" color="#E6B325" mb={4}>
                    Faturamento Diário
                  </Heading>
                  {dadosDiarios.labels.length > 0 ? (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        {dadosDiarios.labels.map((label, index) => (
                          <Box key={index}>
                            <Flex justify="space-between" mb={1}>
                              <Text color="white" fontSize="sm">
                                {label}
                              </Text>
                              <Text color="white" fontSize="sm">
                                {formatarValor(dadosDiarios.valores[index])}
                              </Text>
                            </Flex>
                            <Progress
                              value={(dadosDiarios.valores[index] / maxValorDiario) * 100}
                              colorScheme="orange"
                              size="sm"
                              borderRadius="full"
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ) : (
                    <Flex justify="center" align="center" h="200px">
                      <Text color="whiteAlpha.700">Nenhum dado disponível para o período selecionado</Text>
                    </Flex>
                  )}
                </Box>
              </GridItem>

              {/* Gráfico de Formas de Pagamento (simplificado) */}
              <GridItem>
                <Box bg="whiteAlpha.100" p={4} borderRadius="md" height="100%">
                  <Heading size="md" color="#E6B325" mb={4}>
                    Formas de Pagamento
                  </Heading>
                  {Object.keys(dadosFaturamento.formaPagamento).length > 0 ? (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="md">
                      <VStack spacing={4} align="stretch">
                        {Object.entries(dadosFaturamento.formaPagamento).map(([forma, valor], index) => {
                          const totalFormas = Object.values(dadosFaturamento.formaPagamento).reduce((a, b) => a + b, 0)
                          const porcentagem = (valor / totalFormas) * 100

                          return (
                            <Box key={index}>
                              <Flex justify="space-between" mb={1}>
                                <HStack>
                                  <Circle size="12px" bg={chartColors[index % chartColors.length]} />
                                  <Text color="white">
                                    {forma === "pix"
                                      ? "PIX"
                                      : forma === "dinheiro"
                                        ? "Dinheiro"
                                        : forma === "cartao_credito"
                                          ? "Cartão de Crédito"
                                          : forma === "cartao_debito"
                                            ? "Cartão de Débito"
                                            : forma}
                                  </Text>
                                </HStack>
                                <Text color="white">
                                  {formatarValor(valor)} ({porcentagem.toFixed(1)}%)
                                </Text>
                              </Flex>
                              <Progress value={porcentagem} colorScheme="yellow" size="sm" borderRadius="full" />
                            </Box>
                          )
                        })}
                      </VStack>
                    </Box>
                  ) : (
                    <Flex justify="center" align="center" h="200px">
                      <Text color="whiteAlpha.700">Nenhum dado disponível para o período selecionado</Text>
                    </Flex>
                  )}
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Gráfico de Produtos Mais Vendidos (simplificado) */}
              <GridItem>
                <Box bg="whiteAlpha.100" p={4} borderRadius="md" height="100%">
                  <Heading size="md" color="#E6B325" mb={4}>
                    Produtos Mais Vendidos
                  </Heading>
                  {dadosFaturamento.produtosMaisVendidos.length > 0 ? (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="md">
                      <VStack spacing={3} align="stretch">
                        {dadosFaturamento.produtosMaisVendidos.map((produto, index) => (
                          <Box key={index}>
                            <Flex justify="space-between" mb={1}>
                              <Text color="white" isTruncated maxW="70%">
                                {produto.nome}
                              </Text>
                              <Text color="white">{produto.quantidade} un.</Text>
                            </Flex>
                            <Progress
                              value={(produto.quantidade / maxQuantidadeProduto) * 100}
                              colorScheme="orange"
                              size="sm"
                              borderRadius="full"
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ) : (
                    <Flex justify="center" align="center" h="200px">
                      <Text color="whiteAlpha.700">Nenhum dado disponível para o período selecionado</Text>
                    </Flex>
                  )}
                </Box>
              </GridItem>

              {/* Tabela de Produtos Mais Vendidos */}
              <GridItem>
                <Box bg="whiteAlpha.100" p={4} borderRadius="md" height="100%">
                  <Heading size="md" color="#E6B325" mb={4}>
                    Detalhamento de Produtos
                  </Heading>
                  {dadosFaturamento.produtosMaisVendidos.length > 0 ? (
                    <Box overflowX="auto">
                      <Table size="sm" variant="simple" colorScheme="whiteAlpha">
                        <Thead>
                          <Tr>
                            <Th color="#E6B325">Produto</Th>
                            <Th color="#E6B325" isNumeric>
                              Qtd
                            </Th>
                            <Th color="#E6B325" isNumeric>
                              Valor
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dadosFaturamento.produtosMaisVendidos.map((produto, idx) => (
                            <Tr key={idx}>
                              <Td color="white">{produto.nome}</Td>
                              <Td color="white" isNumeric>
                                {produto.quantidade}
                              </Td>
                              <Td color="white" isNumeric>
                                {formatarValor(produto.valor)}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Flex justify="center" align="center" h="200px">
                      <Text color="whiteAlpha.700">Nenhum dado disponível para o período selecionado</Text>
                    </Flex>
                  )}
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <Heading size="md" color="#E6B325" mb={4}>
                Histórico de Vendas
              </Heading>
              {vendas.length > 0 ? (
                <Box overflowX="auto">
                  <Table size="sm" variant="simple" colorScheme="whiteAlpha">
                    <Thead>
                      <Tr>
                        <Th color="#E6B325">ID</Th>
                        <Th color="#E6B325">Data</Th>
                        <Th color="#E6B325">Comanda</Th>
                        <Th color="#E6B325">Forma de Pagamento</Th>
                        <Th color="#E6B325">Itens</Th>
                        <Th color="#E6B325" isNumeric>
                          Valor
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {vendas
                        .filter((venda) => {
                          const dataVenda = new Date(venda.data)
                          const dataAtual = new Date()
                          const inicioHoje = new Date(dataAtual.setHours(0, 0, 0, 0))

                          switch (periodoSelecionado) {
                            case "hoje":
                              return dataVenda >= inicioHoje
                            case "semana": {
                              const inicioSemana = new Date(dataAtual)
                              inicioSemana.setDate(dataAtual.getDate() - 7)
                              return dataVenda >= inicioSemana
                            }
                            case "mes": {
                              const inicioMes = new Date(dataAtual)
                              inicioMes.setDate(dataAtual.getDate() - 30)
                              return dataVenda >= inicioMes
                            }
                            default:
                              return true
                          }
                        })
                        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                        .slice(0, 50) // Limitando para os 50 mais recentes
                        .map((venda) => (
                          <Tr key={venda.id}>
                            <Td color="white">{venda.id}</Td>
                            <Td color="white">{formatarData(venda.data)}</Td>
                            <Td color="white">{venda.pedidoId}</Td>
                            <Td color="white">
                              <Badge
                                colorScheme={
                                  venda.formaPagamento === "pix"
                                    ? "purple"
                                    : venda.formaPagamento === "dinheiro"
                                      ? "green"
                                      : venda.formaPagamento === "cartao_credito"
                                        ? "blue"
                                        : "cyan"
                                }
                              >
                                {venda.formaPagamento === "pix"
                                  ? "PIX"
                                  : venda.formaPagamento === "dinheiro"
                                    ? "Dinheiro"
                                    : venda.formaPagamento === "cartao_credito"
                                      ? "Crédito"
                                      : "Débito"}
                              </Badge>
                            </Td>
                            <Td color="white">{venda.itensVendidos.reduce((acc, item) => acc + item.quantidade, 0)}</Td>
                            <Td color="white" isNumeric>
                              {formatarValor(venda.valor)}
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Flex justify="center" align="center" h="200px">
                  <Text color="whiteAlpha.700">Nenhum dado disponível para o período selecionado</Text>
                </Flex>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default RelatoriosPage
