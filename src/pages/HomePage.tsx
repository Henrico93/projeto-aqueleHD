"use client"

import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { useData } from "../context/DataContext"
import { FiRefreshCw } from "react-icons/fi"
import { useState } from "react"

const HomePage = () => {
  const { pedidos, vendas, produtos, estoque, refreshData } = useData()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const toast = useToast()

  // Calcular estatísticas
  const pedidosAbertos = pedidos.filter((p) => p.status === "aberto").length
  const pedidosFechados = pedidos.filter((p) => p.status === "fechado").length
  const vendasHoje = vendas.filter((v) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataVenda = new Date(v.data)
    return dataVenda >= hoje
  })
  const faturamentoHoje = vendasHoje.reduce((total, venda) => total + venda.valor, 0)
  const produtosAtivos = produtos.filter((p) => p.ativo).length
  const itensEstoqueBaixo = estoque.filter((item) => item.quantidade <= item.estoqueMinimo).length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Dados atualizados",
        description: "Os dados foram sincronizados com o servidor",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível sincronizar com o servidor",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Box maxW="1200px" mx="auto" p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="brand.secondary">
          Dashboard
        </Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={handleRefresh}
          isLoading={isRefreshing}
          loadingText="Atualizando"
          bg="#C25B02"
          color="white"
          _hover={{ bg: "#B24A01" }}
        >
          Atualizar Dados
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Comandas Abertas</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {pedidosAbertos}
              </StatNumber>
              <StatHelpText color="white">Aguardando fechamento</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Comandas Fechadas</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {pedidosFechados}
              </StatNumber>
              <StatHelpText color="white">Aguardando pagamento</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Faturamento Hoje</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                R$ {faturamentoHoje.toFixed(2)}
              </StatNumber>
              <StatHelpText color="white">{vendasHoje.length} vendas realizadas</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Produtos Ativos</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {produtosAtivos}
              </StatNumber>
              <StatHelpText color="white">De {produtos.length} produtos cadastrados</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Itens com Estoque Baixo</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {itensEstoqueBaixo}
              </StatNumber>
              <StatHelpText color="white">Necessitam reposição</StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="black" p={5} borderRadius="xl" borderWidth={1} borderColor="#E6B325">
            <Stat>
              <StatLabel color="white">Total de Vendas</StatLabel>
              <StatNumber color="#E6B325" fontSize="3xl">
                {vendas.length}
              </StatNumber>
              <StatHelpText color="white">Desde o início</StatHelpText>
            </Stat>
          </Box>
        </GridItem>
      </Grid>

      <Flex
        direction="column"
        align="center"
        justify="center"
        bg="black"
        p={8}
        borderRadius="xl"
        borderWidth={1}
        borderColor="#E6B325"
        textAlign="center"
      >
        <Heading mb={6} size="lg" color="brand.secondary">
          Bem-vindo ao Sistema Aquele Hot Dogs
        </Heading>
        <Text fontSize="lg" mb={8} color="whiteAlpha.800">
          Gerencie seus pedidos, vendas e estoque em um só lugar
        </Text>
        <VStack spacing={4} width="100%" maxW="600px">
          <Button as={RouterLink} to="/pedidos" variant="primary" size="lg" width="100%">
            Ver Comandas
          </Button>
          <Button as={RouterLink} to="/novo-pedido" variant="primary" size="lg" width="100%">
            Nova Comanda
          </Button>
          <Button as={RouterLink} to="/estoque" variant="primary" size="lg" width="100%">
            Gerenciar Estoque
          </Button>
          <Button as={RouterLink} to="/relatorios" variant="primary" size="lg" width="100%">
            Ver Relatórios
          </Button>
        </VStack>
      </Flex>
    </Box>
  )
}

export default HomePage
