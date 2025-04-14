"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  RadioGroup,
  Radio,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
  HStack,
  Icon,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
} from "@chakra-ui/react"
import { FiCreditCard, FiDollarSign, FiSmartphone, FiCheck, FiPrinter } from "react-icons/fi"

type MetodoPagamento = "pix" | "dinheiro" | "cartao_credito" | "cartao_debito"

const PagamentoPage = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("pix")
  const [troco, setTroco] = useState("")
  const [processando, setProcessando] = useState(false)
  const [valorRecebido, setValorRecebido] = useState("")
  const [pagamentoFinalizado, setPagamentoFinalizado] = useState(false)

  // Dados do pedido (simulado)
  const pedido = {
    id: pedidoId,
    cliente: "João Silva",
    mesa: "Mesa 1",
    data: new Date(),
    itens: [
      { nome: "Hot Dog Tradicional", quantidade: 2, preco: 12.0 },
      { nome: "Hot Dog Bacon", quantidade: 1, preco: 15.0 },
      { nome: "Refrigerante", quantidade: 2, preco: 6.0 },
    ],
    status: "fechado",
  }

  // Valor total do pedido
  const valorTotal = pedido.itens.reduce((total, item) => total + item.preco * item.quantidade, 0)

  // Calcular troco
  const calcularTroco = () => {
    if (!valorRecebido) return 0
    const valor = Number.parseFloat(valorRecebido.replace(",", "."))
    return valor > valorTotal ? valor - valorTotal : 0
  }

  const handleFinalizarPagamento = () => {
    setProcessando(true)

    // Validações
    if (metodoPagamento === "dinheiro" && !valorRecebido) {
      toast({
        title: "Erro",
        description: "Informe o valor recebido",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setProcessando(false)
      return
    }

    // Simulando processamento de pagamento
    setTimeout(() => {
      setProcessando(false)
      setPagamentoFinalizado(true)

      toast({
        title: "Pagamento realizado",
        description: `Pagamento da comanda #${pedidoId} concluído com sucesso!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    }, 2000)
  }

  const imprimirComprovante = () => {
    toast({
      title: "Imprimindo comprovante",
      description: "O comprovante está sendo impresso",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const voltarParaPedidos = () => {
    navigate("/pedidos")
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Button
        bg="#C25B02"
        color="white"
        size="md"
        borderRadius="full"
        px={6}
        py={2}
        fontWeight="normal"
        fontSize="md"
        mb={6}
        _hover={{ bg: "#B24A01" }}
      >
        Pagamento da Comanda #{pedidoId}
      </Button>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Resumo do pedido */}
        <GridItem>
          <Box bg="black" p={6} borderRadius="xl">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md" color="#E6B325">
                Resumo da Comanda
              </Heading>
              <Badge colorScheme="orange" fontSize="sm" px={2} py={1} borderRadius="full">
                Fechada
              </Badge>
            </Flex>

            <Flex justify="space-between" mb={4}>
              <Text color="white">
                Cliente:{" "}
                <Text as="span" fontWeight="bold">
                  {pedido.cliente}
                </Text>
              </Text>
              <Text color="white">
                Mesa:{" "}
                <Text as="span" fontWeight="bold">
                  {pedido.mesa}
                </Text>
              </Text>
            </Flex>

            <Divider borderColor="whiteAlpha.300" my={4} />

            <Text color="#E6B325" fontWeight="bold" mb={3}>
              Itens do pedido:
            </Text>

            <VStack align="stretch" spacing={3} mb={4}>
              {pedido.itens.map((item, index) => (
                <Flex key={index} justify="space-between" color="white">
                  <Text>
                    {item.quantidade}x {item.nome}
                  </Text>
                  <Text>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
                </Flex>
              ))}
            </VStack>

            <Divider borderColor="whiteAlpha.300" my={4} />

            <Flex justify="space-between" fontWeight="bold" fontSize="lg">
              <Text color="white">Total:</Text>
              <Text color="#E6B325">R$ {valorTotal.toFixed(2)}</Text>
            </Flex>
          </Box>
        </GridItem>

        {/* Métodos de pagamento */}
        <GridItem>
          {!pagamentoFinalizado ? (
            <Box bg="black" p={6} borderRadius="xl" height="100%">
              <Heading size="md" mb={4} color="#E6B325">
                Forma de Pagamento
              </Heading>

              <RadioGroup value={metodoPagamento} onChange={(value) => setMetodoPagamento(value as MetodoPagamento)}>
                <VStack align="stretch" spacing={4}>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={metodoPagamento === "pix" ? "#E6B325" : "whiteAlpha.300"}
                    bg={metodoPagamento === "pix" ? "blackAlpha.400" : "transparent"}
                  >
                    <Radio value="pix" colorScheme="yellow">
                      <HStack>
                        <Icon as={FiSmartphone} boxSize={5} color="white" />
                        <Text color="white">PIX</Text>
                      </HStack>
                    </Radio>
                  </Box>

                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={metodoPagamento === "dinheiro" ? "#E6B325" : "whiteAlpha.300"}
                    bg={metodoPagamento === "dinheiro" ? "blackAlpha.400" : "transparent"}
                  >
                    <Radio value="dinheiro" colorScheme="yellow">
                      <HStack>
                        <Icon as={FiDollarSign} boxSize={5} color="white" />
                        <Text color="white">Dinheiro</Text>
                      </HStack>
                    </Radio>

                    {metodoPagamento === "dinheiro" && (
                      <VStack spacing={3} mt={4} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm" color="white">
                            Valor recebido
                          </FormLabel>
                          <Input
                            placeholder="R$ 0,00"
                            value={valorRecebido}
                            onChange={(e) => setValorRecebido(e.target.value)}
                            color="white"
                          />
                        </FormControl>

                        {valorRecebido && Number.parseFloat(valorRecebido.replace(",", ".")) > valorTotal && (
                          <Stat>
                            <StatLabel color="white">Troco</StatLabel>
                            <StatNumber color="#E6B325">R$ {calcularTroco().toFixed(2)}</StatNumber>
                          </Stat>
                        )}
                      </VStack>
                    )}
                  </Box>

                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={metodoPagamento === "cartao_credito" ? "#E6B325" : "whiteAlpha.300"}
                    bg={metodoPagamento === "cartao_credito" ? "blackAlpha.400" : "transparent"}
                  >
                    <Radio value="cartao_credito" colorScheme="yellow">
                      <HStack>
                        <Icon as={FiCreditCard} boxSize={5} color="white" />
                        <Text color="white">Cartão de Crédito</Text>
                      </HStack>
                    </Radio>
                  </Box>

                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={metodoPagamento === "cartao_debito" ? "#E6B325" : "whiteAlpha.300"}
                    bg={metodoPagamento === "cartao_debito" ? "blackAlpha.400" : "transparent"}
                  >
                    <Radio value="cartao_debito" colorScheme="yellow">
                      <HStack>
                        <Icon as={FiCreditCard} boxSize={5} color="white" />
                        <Text color="white">Cartão de Débito</Text>
                      </HStack>
                    </Radio>
                  </Box>
                </VStack>
              </RadioGroup>

              <Button
                mt={8}
                w="100%"
                bg="#C25B02"
                color="white"
                onClick={handleFinalizarPagamento}
                isLoading={processando}
                loadingText="Processando"
                borderRadius="full"
                _hover={{ bg: "#B24A01" }}
              >
                Finalizar Pagamento
              </Button>
            </Box>
          ) : (
            <Box bg="black" p={6} borderRadius="xl" height="100%">
              <VStack spacing={6} align="stretch">
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  bg="green.500"
                  color="white"
                  p={6}
                  borderRadius="md"
                >
                  <Icon as={FiCheck} boxSize={12} mb={2} />
                  <Heading size="md">Pagamento Concluído</Heading>
                  <Text>Comanda #{pedidoId} paga com sucesso</Text>
                </Flex>

                <Stat>
                  <StatLabel color="white">Método de Pagamento</StatLabel>
                  <StatNumber color="#E6B325">
                    {metodoPagamento === "pix" && "PIX"}
                    {metodoPagamento === "dinheiro" && "Dinheiro"}
                    {metodoPagamento === "cartao_credito" && "Cartão de Crédito"}
                    {metodoPagamento === "cartao_debito" && "Cartão de Débito"}
                  </StatNumber>
                  <StatHelpText color="white">{new Date().toLocaleString("pt-BR")}</StatHelpText>
                </Stat>

                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiPrinter />}
                    onClick={imprimirComprovante}
                    flex={1}
                    bg="#E6B325"
                    color="black"
                    _hover={{ bg: "#D6A315" }}
                  >
                    Imprimir
                  </Button>
                  <Button onClick={voltarParaPedidos} flex={1} bg="#C25B02" color="white" _hover={{ bg: "#B24A01" }}>
                    Voltar
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}

export default PagamentoPage
