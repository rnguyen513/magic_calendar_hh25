'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function ChakraUIProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  )
} 